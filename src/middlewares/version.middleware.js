const { VERSION_MIDDLEWARE, HTTP_STATUS, RELATIVE_PATHS } = require('../config/paths.config.js');
const { VERSION_MESSAGES } = require('../utils/messages.utils.js');
const { ValidationError, NotFoundError } = require('../utils/error.utils.js');
const { API_CONFIG, getVersionInfo } = require(RELATIVE_PATHS.FROM_MIDDLEWARES.CONFIG_API_VERSIONS);

/**
 * Extrae la versión de la URL
 * Ejemplo: /api/v1/products -> 'v1'
 */
const extractVersionFromUrl = (path) => {
  const versionMatch = path.match(VERSION_MIDDLEWARE.VERSION_REGEX);
  return versionMatch ? versionMatch[1] : null;
};

/**
 * Verifica si una versión es válida
 */
const isValidVersion = (version) => {
  return API_CONFIG.supportedVersions.includes(version);
};

/**
 * Verifica si una versión está deprecada
 */
const isDeprecatedVersion = (version) => {
  return API_CONFIG.deprecatedVersions.includes(version);
};

/**
 * Configura los headers de respuesta con información de versión
 */
const setVersionHeaders = (res, version) => {
  res.setHeader(VERSION_MIDDLEWARE.HEADER_API_VERSION, version);
  res.setHeader(VERSION_MIDDLEWARE.HEADER_API_SUPPORTED_VERSIONS, API_CONFIG.supportedVersions.join(VERSION_MIDDLEWARE.VERSION_SEPARATOR));
  
  if (isDeprecatedVersion(version)) {
    res.setHeader(VERSION_MIDDLEWARE.HEADER_API_DEPRECATION_WARNING, `${VERSION_MESSAGES.VERSION_DEPRECATED_PREFIX} ${version} ${VERSION_MESSAGES.VERSION_DEPRECATED_SUFFIX}`);
  }
};

/**
 * Configura la información de versión en el request
 */
const setVersionInfo = (req, version) => {
  req.apiVersion = version;
  req.versionInfo = getVersionInfo(version);
};

/**
 * Middleware principal para manejar versiones de API
 */
const versionMiddleware = (req, res, next) => {
  const requestedVersion = extractVersionFromUrl(req.path);
  
  if (requestedVersion) {
    // Hay una versión específica en la URL
    if (isValidVersion(requestedVersion)) {
      setVersionInfo(req, requestedVersion);
      setVersionHeaders(res, requestedVersion);
      next();
    } else {
      // Versión no soportada
      const validationError = new ValidationError();
      validationError.details = {
        requestedVersion,
        supportedVersions: API_CONFIG.supportedVersions,
        currentVersion: API_CONFIG.currentVersion
      };
      return next(validationError);
    }
  } else {
    // Sin versión específica, usar la versión actual
    const currentVersion = API_CONFIG.currentVersion;
    setVersionInfo(req, currentVersion);
    setVersionHeaders(res, currentVersion);
    next();
  }
};

/**
 * Registra rutas para todas las versiones soportadas
 */
const registerVersionedRoutes = (app, basePath, routes, additionalMiddlewares = []) => {
  // Caso especial: auth solo debe estar sin versión
  if (basePath === VERSION_MIDDLEWARE.AUTH_ROUTE) {
    console.log(`${VERSION_MESSAGES.REGISTER_ROUTE_AUTH} ${basePath}`);
    app.use(basePath, ...additionalMiddlewares, routes);
    return;
  }
  
  // Para todas las demás rutas, registrar con versiones
  API_CONFIG.supportedVersions.forEach(version => {
    const versionPath = `${VERSION_MIDDLEWARE.API_PREFIX}/${version}${basePath}`;
    console.log(`${VERSION_MESSAGES.REGISTER_ROUTE_VERSIONED} ${versionPath}`);
    app.use(versionPath, ...additionalMiddlewares, routes);
  });
  
  // Registrar sin versión con prefijo /api
  const compatibilityPath = `${VERSION_MIDDLEWARE.API_PREFIX}${basePath}`;
  console.log(`${VERSION_MESSAGES.REGISTER_ROUTE_NO_VERSION} ${compatibilityPath}`);
  app.use(compatibilityPath, ...additionalMiddlewares, routes);
};

/**
 * Registra endpoints de información para cada versión
 */
const registerVersionInfoEndpoints = (app) => {
  console.log(VERSION_MESSAGES.REGISTER_VERSION_ENDPOINTS);
  
  API_CONFIG.supportedVersions.forEach(version => {
    const versionInfoPath = `${VERSION_MIDDLEWARE.API_PREFIX}/${version}${VERSION_MIDDLEWARE.DOCS_ENDPOINT}`;
    
    app.get(versionInfoPath, (req, res, next) => {
      const versionInfo = API_CONFIG.versions[version];
      
      if (!versionInfo) {
        return next(new NotFoundError());
      }
      
      res.json({
        message: `${VERSION_MESSAGES.API_DOCUMENTATION_PREFIX} ${version}`,
        payload: {
            api: VERSION_MIDDLEWARE.API_NAME,
            ...versionInfo,
            serverTime: new Date().toISOString(),
            requestInfo: {
              method: req.method,
              url: req.originalUrl,
              userAgent: req.get(VERSION_MIDDLEWARE.HEADER_USER_AGENT) || VERSION_MIDDLEWARE.USER_AGENT_UNKNOWN
            }
        }
      });
    });
    
    console.log(` ${VERSION_MESSAGES.REGISTER_DOCS_FOR} ${versionInfoPath} ${VERSION_MESSAGES.REGISTER_DOCS_SUFFIX} ${version}`);
  });
  
  console.log(VERSION_MIDDLEWARE.EMPTY_LINE);
};


module.exports = {
  versionMiddleware,
  registerVersionedRoutes,
  registerVersionInfoEndpoints
};