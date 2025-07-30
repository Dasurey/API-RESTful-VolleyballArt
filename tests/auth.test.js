const request = require('supertest');
const express = require('express');

// Crear una app de prueba simple para auth
const app = express();
app.use(express.json());

// Mock de ruta de auth simple para testing
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validación básica
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email y password son requeridos',
      errors: ['Email es requerido', 'Password es requerido']
    });
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Email inválido',
      errors: ['Email debe tener formato válido']
    });
  }
  
  // Validar longitud de password
  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password muy corto',
      errors: ['Password debe tener al menos 6 caracteres']
    });
  }
  
  // Credenciales de prueba
  if (email === 'test@volleyballart.com' && password === 'test123') {
    return res.status(200).json({
      message: 'Login exitoso',
      payload: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token'
      }
    });
  }
  
  return res.status(401).json({
    message: 'Credenciales incorrectas'
  });
});

describe('🔐 Auth Endpoints', () => {
  describe('POST /auth/login', () => {
    it('debería retornar token con credenciales válidas', async () => {
      const validCredentials = {
        email: 'test@volleyballart.com',
        password: 'test123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('payload');
      expect(response.body.payload).toHaveProperty('token');
    });

    it('debería rechazar credenciales inválidas', async () => {
      const invalidCredentials = {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidCredentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Credenciales incorrectas');
    });

    it('debería rechazar datos faltantes', async () => {
      const incompleteData = {
        email: 'test@email.com'
        // password faltante
      };

      const response = await request(app)
        .post('/auth/login')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('debería rechazar email inválido', async () => {
      const invalidEmail = {
        email: 'email-invalido',
        password: 'test123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidEmail);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('debería rechazar password muy corto', async () => {
      const shortPassword = {
        email: 'test@email.com',
        password: '123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(shortPassword);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
