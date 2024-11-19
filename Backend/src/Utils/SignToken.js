import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export const generateAccessToken = (userId, userRole, sessionId) => {
  const acessToken = jwt.sign(
    { userId: userId, userRole: userRole, sessionId: sessionId },
    process.env.JWT_SECRET,
    {
      expiresIn: '10m',
    },
  );
  return acessToken;
};

export const generateRefreshToken = (userId, sessionId) => {
  const refToken = jwt.sign(
    { userId: userId, sessionId: sessionId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' },
  );

  return refToken;
};

export const verifyToken = async (token, secret) => {
  let decoded, er;
  try {
    if (!token) {
      return false;
    }
    decoded = await promisify(jwt.verify)(token, secret);
  } catch (error) {
    er = { message: error.message };
  }

  return { decoded, er };
};
