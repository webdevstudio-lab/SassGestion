import { Router } from 'express';

import {
  createClientHandler,
  deleteClientHandler,
  getAllClientHandler,
  getClientHandler,
  updateClientHandler,
} from '../../Controllers/Clients/clients.controller.js';
import isAdmin from '../../Middlewares/idAdmin.js';

const clientsRoutes = Router();

clientsRoutes.post('/register', createClientHandler);
clientsRoutes.get('/', getAllClientHandler);
clientsRoutes.get('/:id', getClientHandler);
clientsRoutes.patch('/update/:id', updateClientHandler);
clientsRoutes.delete('/delete/:id', isAdmin, deleteClientHandler);

export default clientsRoutes;
