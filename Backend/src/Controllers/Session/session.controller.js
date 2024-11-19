import * as https from '../../constant/https.js';
import prisma from '../../config/prisma.config.js';
import appAssert from '../../Utils/appAssert.js';

export const getSessionsHandler = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: req.userId,
      },
    });
    appAssert(
      sessions.length > 0,
      https.NOT_FOUND,
      "Vous n'avez aucune session active",
    );
    res.status(https.OK).json({ sessions });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteSessionsHandler = async (req, res) => {
  const userAgent = req.headers['user-agent'];
  try {
    const id = parseInt(req.params.id);
    appAssert(
      !isNaN(id),
      https.BAD_REQUEST,
      "Cette session n'existe pas ou a expirer",
    );

    const session = await prisma.session.findUnique({
      where: {
        id,
        userId: req.userId,
      },
    });

    appAssert(
      session,
      https.NOT_FOUND,
      "Cette session n'existe pas ou a expirer",
      404,
    );
    if (session.userAgent === userAgent) {
      return res
        .status(https.UNAUTHORIZED)
        .json({
          error:
            'Vous ne pouvez pas supprimer une session sur laquelle vous etes connecter',
        });
    }
    await prisma.session.delete({
      where: {
        id: id,
        userId: req.userId,
      },
    });

    res.status(https.OK).json({ message: 'Session supprimée avec success' });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};
