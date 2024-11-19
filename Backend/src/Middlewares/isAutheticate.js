import appAssert from '../Utils/appAssert.js';
import { verifyToken } from '../Utils/SignToken.js';
import * as https from '../constant/https.js';

const isAuthenticated = async (req, res, next) => {
  try {
    const acessToken = req.cookies.AccessToken;
    appAssert(
      acessToken,
      https.UNAUTHORIZED,
      'votre Token est invalide ou a expiré, vous devez vous reconnecter',
    );

    const payload = await verifyToken(acessToken, process.env.JWT_SECRET);

    appAssert(
      payload.decoded,
      https.UNAUTHORIZED,
      'votre Token est invalide ou a expiré, vous devez vous reconnecter',
    );

    req.userId = payload.decoded.userId;
    req.sessionId = payload.sessionId;
    req.userRole = payload.decoded.userRole;
    next();
  } catch (error) {
    return res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export default isAuthenticated;
