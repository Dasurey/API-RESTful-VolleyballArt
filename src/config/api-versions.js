// Configuración centralizada de versiones de la API

const API_CONFIG = {
  currentVersion: 'v1',
  supportedVersions: ['v1'],
  deprecatedVersions: [],
  
  versions: {
    v1: {
      version: 'v1',
      description: 'Primera versión de la API RESTful VolleyballArt',
      releaseDate: '2025-07-09',
      deprecated: false,
      inMaintenance: true,
      status: 'stable',
      maintainer: 'VolleyballArt Team',
      documentation: '/api/v1/docs',
      changelog: [
        '✅ Autenticación con Firebase',
        '✅ CRUD de productos con IDs secuenciales (VA-XXXXX)', 
        '✅ Rutas públicas y privadas',
        '✅ Sistema de version dinámico'
      ],
      features: {
        authentication: true,
        products: true,
        categories: false,
        users: false,
        fileUpload: false
      },
      endpoints: {
        auth: '/auth',
        products: '/api/products'
      },
      //supportedUntil: '2026-01-29', // 1 año de soporte
      breakingChanges: []
    }
    /* Futuras versiones se agregarán aquí
    v2: {
      version: 'v2',
      description: 'Segunda versión con categorías y gestión de usuarios',
      releaseDate: '2025-06-01',
      deprecated: false,
      inMaintenance: true,
      status: 'beta',
      maintainer: 'VolleyballArt Team',
      documentation: '/api/v2/docs',
      changelog: [
        '🆕 Sistema de categorías',
        '🆕 Gestión de usuarios',
        '🆕 Upload de archivos',
        '🔄 Mejoras en autenticación'
      ],
      features: {
        authentication: true,
        products: true,
        categories: true,
        users: true,
        fileUpload: true
      },
      endpoints: {
        auth: '/auth',
        products: '/products',
        categories: '/categories',
        users: '/users'
      },
      // supportedUntil: '2026-06-01',
      breakingChanges: [
        'Products endpoint moved from /api/products to /products'
      ]
    }*/  // Descomentar para futuras versiones
  }
};

// Función para obtener información de versión
const getVersionInfo = (version = null) => {
  if (version) {
    return API_CONFIG.versions[version] || null;
  }
  return {
    current: API_CONFIG.currentVersion,
    supported: API_CONFIG.supportedVersions,
    deprecated: API_CONFIG.deprecatedVersions,
    versions: API_CONFIG.versions
  };
};

module.exports = {
  API_CONFIG,
  getVersionInfo
};
