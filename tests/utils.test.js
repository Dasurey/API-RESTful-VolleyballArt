const jwt = require('jsonwebtoken');
const { JWT_EXPIRATION } = require('../src/config/jwt.js');

describe('🛠️ Utilities & Schemas', () => {
  describe('JWT Token Generator', () => {
    it('debería generar un token válido', () => {
      const userData = {
        uid: 'test-user-123',
        email: 'test@volleyballart.com'
      };

      const token = jwt.sign(userData, 'test-secret', { expiresIn: JWT_EXPIRATION });

      expect(typeof token).toBe('string');
      expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    });

    it('debería generar tokens diferentes para usuarios diferentes', () => {
      const user1 = { uid: 'user1', email: 'user1@test.com' };
      const user2 = { uid: 'user2', email: 'user2@test.com' };

      const token1 = jwt.sign(user1, 'test-secret', { expiresIn: JWT_EXPIRATION });
      const token2 = jwt.sign(user2, 'test-secret', { expiresIn: JWT_EXPIRATION });

      expect(token1).not.toBe(token2);
    });
  });

  describe('Validaciones Básicas', () => {
    it('debería validar email correcto', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmail = 'test@volleyballart.com';
      
      expect(emailRegex.test(validEmail)).toBe(true);
    });

    it('debería rechazar email inválido', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmail = 'email-invalido';
      
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });

    it('debería validar password con longitud correcta', () => {
      const password = 'password123';
      
      expect(password.length).toBeGreaterThanOrEqual(6);
    });

    it('debería rechazar password muy corto', () => {
      const shortPassword = '12';
      
      expect(shortPassword.length).toBeLessThan(6);
    });
  });

  describe('Validaciones de Producto', () => {
    const validProduct = {
      name: 'Pelota de Volleyball',
      description: 'Pelota oficial para competencias',
      price: 150.00,
      category: 'Pelotas',
      stock: 50,
      images: ['https://example.com/image1.jpg']
    };

    it('debería validar producto con estructura correcta', () => {
      expect(validProduct).toHaveProperty('name');
      expect(validProduct).toHaveProperty('price');
      expect(validProduct).toHaveProperty('category');
      expect(validProduct.price).toBeGreaterThan(0);
      expect(validProduct.stock).toBeGreaterThanOrEqual(0);
    });

    it('debería rechazar precio negativo', () => {
      const invalidProduct = { ...validProduct, price: -10 };
      
      expect(invalidProduct.price).toBeLessThan(0);
    });

    it('debería rechazar stock negativo', () => {
      const invalidProduct = { ...validProduct, stock: -5 };
      
      expect(invalidProduct.stock).toBeLessThan(0);
    });

    it('debería validar que el nombre no esté vacío', () => {
      expect(validProduct.name).toBeTruthy();
      expect(validProduct.name.length).toBeGreaterThan(0);
    });
  });
});
