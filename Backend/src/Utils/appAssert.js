import assert from 'node:assert';
import appError from './appError.js';

/**
 * verifie la condition et affriche un message d'error si la condition n'est pas respecter
 */

const appAssert = (condition, statusCode, message, errorCode) =>
  assert(condition, new appError(message, statusCode, errorCode));

export default appAssert;
