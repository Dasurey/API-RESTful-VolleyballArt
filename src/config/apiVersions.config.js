const API_CONFIG = {
  currentVersion: 'v1',
  supportedVersions: ['v1'],
  deprecatedVersions: [],
  
  versions: {
    'v1': {
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
        '✅ CRUD de productos con IDs secuenciales (VA-XXXXXXX)',
        '✅ Sistema completo de categorías y subcategorías',
        '✅ IDs jerárquicos para categorías (CAT-XXXX-YYYY)',
        '✅ Rutas públicas y privadas',
        '✅ Sistema de version dinámico'
      ],
      features: {
        authentication: true,
        products: true,
        category: true,
        subcategory: true,
        users: false,
        fileUpload: false
      },
      endpoints: {
        auth: '/auth',
        products: '/api/products',
        category: '/api/category',
        subcategory: '/api/category/subcategory',
        'Category and Subcategory': '/api/category/hierarchy'
      },
      breakingChanges: []
    }
  }
};

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