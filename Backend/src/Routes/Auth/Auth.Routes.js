import { Router } from 'express';

import {
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
} from '../../Controllers/Auth/auth.controller.js';

const authRoutes = Router();

authRoutes.post('/register', registerHandler);
authRoutes.post('/login', loginHandler);
authRoutes.get('/logout', logoutHandler);
authRoutes.get('/refresh', refreshTokenHandler);

export default authRoutes;
