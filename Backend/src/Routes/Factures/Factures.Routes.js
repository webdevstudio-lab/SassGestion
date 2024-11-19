import { Router } from 'express';
import {
  createFactureHandler,
  deleteFactureHandler,
  getAllFacturesHandler,
  getFacturesHandler,
  updateFactureHandler,
} from '../../Controllers/Factures/Factures.controller.js';

import isAdmin from '../../Middlewares/idAdmin.js';

const facturesRoutes = Router();

facturesRoutes.post('/:id/create', createFactureHandler);
facturesRoutes.get('/:id', getFacturesHandler);
facturesRoutes.get('/', getAllFacturesHandler);
facturesRoutes.patch('/update/:id', updateFactureHandler);
facturesRoutes.delete('/delete/:id', isAdmin, deleteFactureHandler);

export default facturesRoutes;
