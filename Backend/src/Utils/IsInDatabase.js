import prisma from '../config/prisma.config.js';
const isInDatabase = async (models, id) => {
  try {
    const client = await models.findUnique({ where: { id } });
    return client;
  } catch (error) {
    return false;
  }
};

export default isInDatabase;
