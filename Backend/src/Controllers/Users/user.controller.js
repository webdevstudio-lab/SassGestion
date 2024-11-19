import { z } from 'zod';
import * as https from '../../constant/https.js';
import prisma from '../../config/prisma.config.js';
import { updatePasswordSchema } from './DataValidation/updatePassword.schema.js';
import bcrypt from 'bcrypt';
import appAssert from '../../Utils/appAssert.js';
import { now } from '../../Utils/date.js';

export const getUserHandler = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
      include: {
        Session: {
          select: {
            id: true,
            userAgent: true,
          },
        },
      },
    });
    res.status(https.OK).json({
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
      Session: {
        id: user.Session[0].id,
        userAgent: user.Session[0].userAgent,
      },
    });
  } catch (error) {
    res.status(https.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const updateUserHandler = async (req, res) => {
  try {
    const userSchema = z.object({
      fullname: z
        .string()
        .min(5, { message: 'Le nom doit avoir au moins 5 caractères' })
        .max(65, {
          message: 'le nom doit avoir au maximum 65 caractères',
        }),
    });

    const request = userSchema.parse({
      ...req.body,
    });

    const user = await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        fullname: request.fullname,
      },
    });
    res.status(https.OK).json({
      message: 'Votre profil a ete mis a jour avec success',
      user: {
        id: user.id,
        fullname: user.fullname,
      },
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const updatePasswordHandler = async (req, res) => {
  try {
    const request = updatePasswordSchema.parse({
      ...req.body,
    });

    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });

    const isPasswordMatch = await bcrypt.compare(
      request.password,
      user.password,
    );
    appAssert(
      isPasswordMatch,
      https.UNAUTHORIZED,
      'Votre ancien mot de passe est incorrect',
    );

    const hashedPassword = await bcrypt.hash(request.newpassword, 12);

    await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        password: hashedPassword,
        passUpdateAt: now(),
      },
    });

    return res.status(https.OK).json({
      message: 'Votre mot de passe a ete mis a jour avec success',
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};
