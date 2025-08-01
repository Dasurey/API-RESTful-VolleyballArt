// Configuración centralizada de versiones de la API

const { SYSTEM_MESSAGES } = require("../utils/messages.utils");

const { 
  API_ENDPOINTS
} = require("./paths.config");

const API_CONFIG = {
  currentVersion: SYSTEM_MESSAGES.API_VERSION_V1,
  supportedVersions: [SYSTEM_MESSAGES.API_VERSION_V1],
  deprecatedVersions: [],
  
  versions: {
    [SYSTEM_MESSAGES.API_VERSION_V1]: {
      version: SYSTEM_MESSAGES.API_VERSION_V1,
      description: SYSTEM_MESSAGES.API_DESCRIPTION_V1,
      releaseDate: SYSTEM_MESSAGES.API_RELEASE_DATE,
      deprecated: false,
      inMaintenance: true,
      status: SYSTEM_MESSAGES.API_STATUS_STABLE,
      maintainer: SYSTEM_MESSAGES.API_MAINTAINER,
      documentation: SYSTEM_MESSAGES.API_DOCS_V1,
      changelog: [
        SYSTEM_MESSAGES.CHANGELOG_AUTH_FIREBASE,
        SYSTEM_MESSAGES.CHANGELOG_CRUD_PRODUCTS,
        SYSTEM_MESSAGES.CHANGELOG_CATEGORY_SYSTEM,
        SYSTEM_MESSAGES.CHANGELOG_HIERARCHICAL_IDS,
        SYSTEM_MESSAGES.CHANGELOG_PUBLIC_PRIVATE_ROUTES,
        SYSTEM_MESSAGES.CHANGELOG_DYNAMIC_VERSIONING
      ],
      features: {
        [SYSTEM_MESSAGES.API_FEATURE_AUTHENTICATION]: true,
        [SYSTEM_MESSAGES.API_FEATURE_PRODUCTS]: true,
        [SYSTEM_MESSAGES.API_FEATURE_CATEGORY]: true,
        [SYSTEM_MESSAGES.API_FEATURE_SUBCATEGORY]: true,
        [SYSTEM_MESSAGES.API_FEATURE_USERS]: false,
        [SYSTEM_MESSAGES.API_FEATURE_FILE_UPLOAD]: false
      },
      endpoints: {
        auth: API_ENDPOINTS.AUTH,
        products: API_ENDPOINTS.API_PRODUCTS,
        category: API_ENDPOINTS.API_CATEGORY
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