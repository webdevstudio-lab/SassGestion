import appAssert from '../../Utils/appAssert.js';
import { now, oneMonthFromNow } from '../../Utils/date.js';
import {
  loginSchema,
  registerSchema,
} from './DataValidation/register.schema.js';
import prisma from '../../config/prisma.config.js';
import * as https from '../../constant/https.js';
import bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../../Utils/SignToken.js';
import { setAuthCookies, setAuthNewCookies } from '../../Utils/cookies.js';

//REGISTER A USER
export const registerHandler = async (req, res) => {
  try {
    //Validate data
    const request = registerSchema.parse({
      ...req.body,
      userAgent: req.headers['user-agent'],
    });

    //verify email
    const user = await prisma.user.findUnique({
      where: {
        email: request.email,
      },
    });
    appAssert(
      !user,
      https.CONFLICT,
      'cette email est deja utilisé',
      'EMAIL_ALREADY_EXISTS',
    );
    //hash password
    const hashedPassword = await bcrypt.hash(request.password, 12);

    //create user
    const newUser = await prisma.user.create({
      data: {
        fullname: request.fullname,
        email: request.email,
        password: hashedPassword,
      },
    });

    //creer la session
    const session = await prisma.session.create({
      data: {
        userAgent: request.userAgent,
        expiresAt: oneMonthFromNow(),
        userId: newUser.id,
      },
    });

    //sign access token and refresh token
    const accessToken = generateAccessToken(newUser.id, newUser.role);
    const refreshToken = generateRefreshToken(newUser.id, session.id);

    //hash and update refresh token

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await prisma.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });

    //set cookie
    setAuthCookies(res, accessToken, refreshToken);

    //send response
    res.status(https.CREATED).json({
      message: 'utilisateur cree avec success',
      user: {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
      },
      session: {
        id: session.id,
        userAgent: session.userAgent,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//LOGIN A USER
export const loginHandler = async (req, res) => {
  try {
    //validate data
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers['user-agent'],
    });

    //call servies
    const user = await prisma.user.findUnique({
      where: {
        email: request.email,
      },
    });
    appAssert(
      user,
      https.UNAUTHORIZED,
      'email ou mot de passe incorrect',
      'EMAIL_OR_PASSWORD_INCORRECT',
    );

    //copare password
    const isPasswordMatch = await bcrypt.compare(
      request.password,
      user.password,
    );
    appAssert(
      isPasswordMatch,
      https.UNAUTHORIZED,
      'email ou mot de passe incorrect',
      'EMAIL_OR_PASSWORD_INCORRECT',
    );

    //verifier les sessions et metre a jour
    const session = await prisma.session.findFirst({
      where: {
        userId: user.id,
        userAgent: request.userAgent,
      },
    });
    const sessionsInfo = { sessionId: null };

    if (!session) {
      const newSession = await prisma.session.create({
        data: {
          userAgent: request.userAgent,
          expiresAt: oneMonthFromNow(),
          userId: user.id,
        },
      });
      sessionsInfo.sessionId = newSession.id;
    } else {
      await prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          expiresAt: oneMonthFromNow(),
          createAt: now(),
        },
      });
      sessionsInfo.sessionId = session.id;
    }

    //sign access token and refresh token
    const accessToken = generateAccessToken(
      user.id,
      user.role,
      sessionsInfo.sessionId,
    );
    const refreshToken = generateRefreshToken(user.id, sessionsInfo.sessionId);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });

    //set cookie
    setAuthCookies(res, accessToken, refreshToken);
    //send response

    res.status(https.OK).json({
      message: 'utilisateur connecte avec success',
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      },
      session: {
        id: sessionsInfo.sessionId,
        userAgent: request.userAgent,
      },
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

//LOGOUT A USER
export const logoutHandler = async (req, res) => {
  try {
    const payload = await verifyToken(
      req.cookies.AccessToken,
      process.env.JWT_SECRET,
    );
    appAssert(
      payload.decoded,
      https.UNAUTHORIZED,
      'vous devez etre connecté pour pouvoir vous deconnecter',
    );

    await prisma.session.deleteMany({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
      },
    });

    res
      .clearCookie('AccessToken')
      .clearCookie('RefreshToken')
      .status(https.OK)
      .json({ message: 'vous avez été deconnecté avec success' });
  } catch (error) {
    return res
      .status(https.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

//REFRESH TOKEN
export const refreshTokenHandler = async (req, res) => {
  try {
    const payload = await verifyToken(
      req.cookies.RefreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    appAssert(
      payload.decoded,
      https.UNAUTHORIZED,
      'votre Token est invalide ou a expiré, vous devez vous reconnecter',
    );

    //comparer le refresh token
    const user = await prisma.user.findUnique({
      where: { id: payload.decoded.userId },
    });

    appAssert(
      user &&
        (await bcrypt.compare(req.cookies.RefreshToken, user.refreshToken)),
      https.UNAUTHORIZED,
      'votre Token est invalide ou a expiré, vous devez vous reconnecter',
      401,
    );

    // //verifier si le mot de passe na pas ete modifier
    appAssert(
      user.passUpdateAt.getTime() / 1000 < payload.decoded.iat,
      https.UNAUTHORIZED,
      'Votre mot de passe a recentement été modifier, veuillez vous reconnecter',
      401,
    );

    const session = await prisma.session.findUnique({
      where: { id: payload.decoded.sessionId },
    });

    appAssert(
      session && session.expiresAt.getTime() > Date.now(),
      https.UNAUTHORIZED,
      'votre session a expiré, veuillez vous reconnecter',
      401,
    );

    const accessToken = generateAccessToken(user.id, user.role, session.id);

    setAuthNewCookies({ res, accessToken });

    res.status(https.OK).json({
      message: 'Token refresh avec success',
    });
  } catch (error) {
    return res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};
//FORGOT PASSWORD

//RESET PASSWORD
