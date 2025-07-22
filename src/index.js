import express from 'express';
import config from 'dotenv';
import cors from 'cors';
import { join, __dirname } from "./utils/index.js";

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

app.use(express.json());
app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Middleware para capturar errores de JSON malformado
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON malformado:', error.message);
    return res.status(400).json({ 
      message: 'JSON malformado. Verifica la sintaxis de los datos enviados.',
      error: error.message 
    });
  }
  next();
});

app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);

// app.use('/api/products', authentication, productsRoutes);
app.use('/api/products', productsRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Recurso no encontrado o ruta invalida' });
});

const PORT = process.env.PORT || 3000;

//listeners
app.listen(PORT, () => {
  console.log(`Server on port http://localhost:${PORT}`);
});
