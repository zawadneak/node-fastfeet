import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import ProviderController from './app/controllers/ProviderController';
import FileController from './app/controllers/FileController';
import DeliveredController from './app/controllers/DeliveredController';
import ProblemController from './app/controllers/ProblemController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryEditController from './app/controllers/DeliveryEditController';
import tokenAuth from './middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/login', SessionController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/provider/:provider_id/delivered', DeliveredController.index);

routes.get('/provider/:provider_id/deliveries', DeliveryController.show);

routes.get('/provider/:id', ProviderController.show);

routes.put(
  '/provider/:provider_id/deliveries/:delivery_id',
  DeliveryController.update
);

routes.put(
  '/provider/:provider_id/deliver/:delivery_id',
  DeliveredController.update
);

routes.post('/delivery/:delivery_id/problems', ProblemController.store);

routes.get('/delivery/:delivery_id/problems', ProblemController.show);

routes.use(tokenAuth);

routes.post('/recipient', RecipientController.store);

routes.put('/recipient/:id', RecipientController.update);

routes.get('/recipient', RecipientController.index);

routes.delete('/recipient/:id', RecipientController.delete);

routes.post('/provider', ProviderController.store);

routes.put('/provider/:id', ProviderController.update);

routes.get('/provider', ProviderController.index);

routes.delete('/provider/:id', ProviderController.delete);

routes.post('/delivery', DeliveryController.store);

routes.get('/delivery', DeliveryController.index);

routes.delete('/delivery/:id', DeliveryController.delete);

routes.get('/delivery/problems', ProblemController.index);

routes.put('/delivery/:delivery_id', DeliveryEditController.update);

routes.delete('/problem/:problem_id/cancel-delivery', ProblemController.delete);

export default routes;
