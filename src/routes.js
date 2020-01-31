import { Router } from 'express';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import tokenAuth from './middlewares/auth';

const routes = new Router();

routes.post('/login',SessionController.store);

routes.use(tokenAuth);

routes.post('/recipient',RecipientController.store)

routes.put('/recipient/:id', RecipientController.update);

routes.delete('/recipient/:id', RecipientController.delete);

export default routes;
