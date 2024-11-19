import { Router } from 'express';
import {
  getSessionsHandler,
  deleteSessionsHandler,
} from '../Controllers/Session/session.controller.js';

const sessionRoutes = Router();

sessionRoutes.get('/sessions', getSessionsHandler);
sessionRoutes.delete('/sessions/:id', deleteSessionsHandler);

export default sessionRoutes;
