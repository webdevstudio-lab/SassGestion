/**********************************************/
/***********  NodeJs module ******************/
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import 'dotenv/config';

/**********************************************/
/***********  Import internal modules ******************/

import authRoutes from './Routes/Auth/Auth.Routes.js';
import userRoutes from './Routes/Users/user.Routes.js';
import isAuthenticated from './Middlewares/isAutheticate.js';
import sessionRoutes from './Routes/Session.Routes.js';
import clientsRoutes from './Routes/Clients/clients.Routes.js';
import devisRoutes from './Routes/Devis/devis.Routes.js';
import facturesRoutes from './Routes/Factures/Factures.Routes.js';

/**********************************************/
/***********  Api Initialization and security ******************
 **********************************************/
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: process.env.APP_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message:
      'Trop de requêtes effectuées dépuis cette IP, veuillez réessayer dans 15 minutes',
  }),
);

/**********************************************/
/**************  API ROUTES     ******************/

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur note Api de gestion!' });
});

/*********************************************/
app.use('/auth', authRoutes);

//Protected routes
app.use('/', isAuthenticated, userRoutes);
app.use('/', isAuthenticated, sessionRoutes);
app.use('/clients', isAuthenticated, clientsRoutes);
app.use('/devis', isAuthenticated, devisRoutes);
app.use('/factures', isAuthenticated, facturesRoutes);

//RUNNING SERVER
app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} environment!`,
  );
});
