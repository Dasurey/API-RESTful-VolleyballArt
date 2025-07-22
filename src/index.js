import express from 'express';
import config from 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';

import productsRoutes from './routes/products.routes.js';
import authRoutes from './routes/auth.routes.js';

import { authentication } from './middlewares/authentication.js';

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

app.use('/api/products', authentication, productsRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Recurso no encontrado o ruta invalida' });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
