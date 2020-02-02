import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import ProviderController from './app/controllers/ProviderController';
import FileController from './app/controllers/FileController';
import DeliveredController from './app/controllers/DeliveredController';
import DeliveryController from './app/controllers/DeliveryController';
import tokenAuth from './middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/login', SessionController.store);

routes.get('/provider/:provider_id/delivered', DeliveredController.index);

routes.get('/provider/:provider_id/deliveries', DeliveryController.index);

routes.put(
  '/provider/:provider_id/deliveries/:delivery_id',
  DeliveryController.update
);

routes.use(tokenAuth);

routes.post('/recipient', RecipientController.store);

routes.put('/recipient/:id', RecipientController.update);

routes.delete('/recipient/:id', RecipientController.delete);

routes.post('/provider', ProviderController.store);

routes.put('/provider/:id', ProviderController.update);

routes.get('/provider', ProviderController.index);

routes.delete('/provider/:id', ProviderController.delete);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/delivery', DeliveryController.store);

export default routes;
