import express from 'express';
import routes from './routes';
import log from './middlewares/log';

import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());

    this.server.use(log);
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
