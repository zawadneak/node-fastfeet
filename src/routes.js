import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import ProviderController from './app/controllers/ProviderController';
import FileController from './app/controllers/FileController';
import tokenAuth from './middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/login', SessionController.store);

routes.use(tokenAuth);

routes.post('/recipient', RecipientController.store);

routes.put('/recipient/:id', RecipientController.update);

routes.delete('/recipient/:id', RecipientController.delete);

routes.post('/provider', ProviderController.store);

routes.put('/provider/:id', ProviderController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
