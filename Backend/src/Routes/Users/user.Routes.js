import { Router } from 'express';
import {
  getUserHandler,
  updatePasswordHandler,
  updateUserHandler,
} from '../../Controllers/Users/user.controller.js';

const userRoutes = Router();

userRoutes.get('/user', getUserHandler);
userRoutes.put('/user/update', updateUserHandler);
userRoutes.put('/user/update_password', updatePasswordHandler);

export default userRoutes;
