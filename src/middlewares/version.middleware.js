const { ValidationError, NotFoundError } = require('../middlewares/error');
const { API_CONFIG, getVersionInfo } = require('../config/api.versions');

/**
 * Extrae la versión de la URL
 * Ejemplo: /api/v1/products -> 'v1'
 */
const extractVersionFromUrl = (path) => {
  const versionMatch = path.match(/^\/api\/(v\d+)\//);
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
  res.setHeader('API-Version', version);
  res.setHeader('API-Supported-Versions', API_CONFIG.supportedVersions.join(', '));
  
  if (isDeprecatedVersion(version)) {
    res.setHeader('API-Deprecation-Warning', `Version ${version} is deprecated`);
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
  if (basePath === '/auth') {
    console.log(`✅ Registrando ruta (auth): ${basePath}`);
    app.use(basePath, ...additionalMiddlewares, routes);
    return;
  }
  
  // Para todas las demás rutas, registrar con versiones
  API_CONFIG.supportedVersions.forEach(version => {
    const versionPath = `/api/${version}${basePath}`;
    console.log(`✅ Registrando ruta: ${versionPath}`);
    app.use(versionPath, ...additionalMiddlewares, routes);
  });
  
  // Registrar sin versión con prefijo /api
  const compatibilityPath = `/api${basePath}`;
  console.log(`✅ Registrando ruta (sin versión): ${compatibilityPath}`);
  app.use(compatibilityPath, ...additionalMiddlewares, routes);
};

/**
 * Registra endpoints de información para cada versión
 */
const registerVersionInfoEndpoints = (app) => {
  console.log('\n📋 Registrando endpoints de información de versiones:');
  
  API_CONFIG.supportedVersions.forEach(version => {
    const versionInfoPath = `/api/${version}/docs`;
    
    app.get(versionInfoPath, (req, res, next) => {
      const versionInfo = API_CONFIG.versions[version];
      
      if (!versionInfo) {
        return next(new NotFoundError());
      }
      
      res.json({
        message: `Documentación de la API para la versión ${version}`,
        payload: {
            api: 'VolleyballArt API',
            ...versionInfo,
            serverTime: new Date().toISOString(),
            requestInfo: {
              method: req.method,
              url: req.originalUrl,
              userAgent: req.get('User-Agent') || 'Unknown'
            }
        }
      });
    });
    
    console.log(` ✅ ${versionInfoPath} - Documentación de ${version}`);
  });
  
  console.log('');
};


module.exports = {
  versionMiddleware,
  registerVersionedRoutes,
  registerVersionInfoEndpoints
};