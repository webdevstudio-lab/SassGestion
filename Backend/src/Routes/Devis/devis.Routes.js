import { Router } from 'express';
import {
  createDevisHandler,
  getAllDevisHandler,
  getDevisHandler,
  updateDevisHandler,
  deleteDevisHandler,
} from '../../Controllers/Devis/devis.controllers.js';
import isAdmin from '../../Middlewares/idAdmin.js';
const devisRoutes = Router();

devisRoutes.post('/:id/create', createDevisHandler);
devisRoutes.get('/:id', getDevisHandler);
devisRoutes.get('/', getAllDevisHandler);
devisRoutes.patch('/update/:id', updateDevisHandler);
devisRoutes.delete('/delete/:id', isAdmin, deleteDevisHandler);

export default devisRoutes;
