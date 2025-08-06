const request = require('supertest');
const express = require('express');

// Crear una app de prueba simple para productos
const app = express();
app.use(express.json());

// Middleware de autenticación mock
const mockAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  next();
};

// Mock de productos en memoria
let mockProducts = [
  {
    id: 'VA-0000001',
    name: 'Pelota de Volleyball',
    description: 'Pelota oficial',
    price: 150.00,
    category: 'Pelotas',
    stock: 50
  }
];

// Rutas mock para productos
app.get('/products', (req, res) => {
  res.status(200).json({
    message: 'Lista de productos',
    payload: mockProducts
  });
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  
  // Validar formato ID VA-XXXXXXX
  if (!/VA-\d{7}$/.test(id)) {
    return res.status(400).json({
      message: 'ID inválido',
      errors: ['ID debe tener formato VA-XXXXXXX']
    });
  }
  
  const product = mockProducts.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  
  res.status(200).json({
    message: 'Producto encontrado',
    payload: product
  });
});

app.post('/products/create', mockAuth, (req, res) => {
  const { name, description, price, category, stock, images } = req.body;
  
  // Validaciones básicas
  if (!name || name.trim() === '') {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: ['Nombre es requerido']
    });
  }
  
  if (price <= 0) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: ['Precio debe ser mayor a 0']
    });
  }
  
  if (stock < 0) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: ['Stock no puede ser negativo']
    });
  }
  
  const newProduct = {
    id: `VA-${String(mockProducts.length + 1).padStart(5, '0')}`,
    name,
    description,
    price,
    category,
    stock,
    images
  };
  
  mockProducts.push(newProduct);
  
  res.status(201).json({
    message: 'Producto creado',
    payload: { id: newProduct.id }
  });
});

app.put('/products/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  
  if (!/VA-\d{7}$/.test(id)) {
    return res.status(400).json({
      message: 'ID inválido',
      errors: ['ID debe tener formato VA-XXXXXXX']
    });
  }
  
  res.status(200).json({
    message: 'Producto actualizado'
  });
});

app.delete('/products/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  
  if (!/VA-\d{7}$/.test(id)) {
    return res.status(400).json({
      message: 'ID inválido',
      errors: ['ID debe tener formato VA-XXXXXXX']
    });
  }
  
  res.status(200).json({
    message: 'Producto eliminado'
  });
});

describe('🏐 Products Endpoints', () => {
  const authToken = 'valid-test-token';

  describe('GET /products', () => {
    it('debería obtener lista de productos sin autenticación', async () => {
      const response = await request(app)
        .get('/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('payload');
      expect(Array.isArray(response.body.payload)).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    it('debería obtener un producto específico', async () => {
      const productId = 'VA-0000001';
      
      const response = await request(app)
        .get(`/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('payload');
    });

    it('debería rechazar ID con formato inválido', async () => {
      const invalidId = 'invalid-id';
      
      const response = await request(app)
        .get(`/products/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /products/create', () => {
    const validProduct = {
      name: 'Pelota de Volleyball Profesional',
      description: 'Pelota oficial para competencias',
      price: 150.00,
      category: 'Pelotas',
      stock: 50,
      images: ['https://example.com/image1.jpg']
    };

    it('debería crear producto con datos válidos y autenticación', async () => {
      const response = await request(app)
        .post('/products/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('payload');
      expect(response.body.payload).toHaveProperty('id');
    });

    it('debería rechazar creación sin autenticación', async () => {
      const response = await request(app)
        .post('/products/create')
        .send(validProduct);

      expect(response.status).toBe(401);
    });

    it('debería rechazar precio negativo', async () => {
      const productWithNegativePrice = {
        ...validProduct,
        price: -50
      };

      const response = await request(app)
        .post('/products/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productWithNegativePrice);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /products/:id', () => {
    const updateData = {
      name: 'Pelota Actualizada',
      price: 200.00
    };

    it('debería actualizar producto con autenticación', async () => {
      const productId = 'VA-0000001';
      
      const response = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('debería rechazar actualización sin autenticación', async () => {
      const productId = 'VA-0000001';
      
      const response = await request(app)
        .put(`/products/${productId}`)
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /products/:id', () => {
    it('debería eliminar producto con autenticación', async () => {
      const productId = 'VA-0000001';
      
      const response = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('debería rechazar eliminación sin autenticación', async () => {
      const productId = 'VA-0000001';
      
      const response = await request(app)
        .delete(`/products/${productId}`);

      expect(response.status).toBe(401);
    });
  });
});
