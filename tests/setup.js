// Configuración global para los tests
const dotenv = require('dotenv');

// Cargar variables de entorno del archivo .env principal
dotenv.config();

// Configurar entorno específico para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-key-fallback';
process.env.PORT = process.env.TEST_PORT || '5001';

// Mock básico de Firebase sin importar archivos
global.mockFirestore = {
  collection: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ docs: [] })),
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve())
    })),
    add: jest.fn(() => Promise.resolve({ id: 'test-id' })),
    where: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ docs: [] }))
    }))
  }))
};

// Mock del logger para silenciar salidas durante tests
global.mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  stream: { write: jest.fn() }
};

// Configurar timeout para tests
jest.setTimeout(10000);
