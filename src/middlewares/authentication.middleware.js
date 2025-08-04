const { EXTERNAL_PACKAGES, RELATIVE_PATHS, HTTP_STATUS, AUTHENTICATION, HTTP_HEADERS } = require('../config/paths.config.js');
const { AUTH_MIDDLEWARE_MESSAGES } = require('../utils/messages.utils.js');
const { verifyToken } = require('../config/jwt.config.js');
const { AuthenticationError } = require('../utils/error.utils.js');
const Logger = require(RELATIVE_PATHS.FROM_MIDDLEWARES.CONFIG_LOGGER);

const authentication = (req, res, next) => {
  try {
    const authHeader = req.headers[AUTHENTICATION.AUTHORIZATION_HEADER];
    
    if (!authHeader) {
      Logger.warn(AUTH_MIDDLEWARE_MESSAGES.ACCESS_WITHOUT_TOKEN, {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get(HTTP_HEADERS.USER_AGENT),
        timestamp: new Date().toISOString()
      });
      
      throw new AuthenticationError();
    }

    const token = authHeader.split(AUTHENTICATION.TOKEN_SEPARATOR)[AUTHENTICATION.TOKEN_INDEX];

    if (!token) {
      Logger.warn(AUTH_MIDDLEWARE_MESSAGES.INVALID_TOKEN_FORMAT, {
        authHeader: authHeader,
        ip: req.ip,
        url: req.originalUrl,
        timestamp: new Date().toISOString()
      });
      
      throw new AuthenticationError();
    }

    const decoded = verifyToken(token);
    
    Logger.info(AUTH_MIDDLEWARE_MESSAGES.AUTHENTICATION_SUCCESS, {
      userId: decoded.id,
      email: decoded.email,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    req.user = decoded; // Guardamos la info del usuario decodificada
    next();
    
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      Logger.warn(AUTH_MIDDLEWARE_MESSAGES.INVALID_OR_EXPIRED_TOKEN, {
        error: error.message,
        tokenType: error.name,
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.get(HTTP_HEADERS.USER_AGENT),
        timestamp: new Date().toISOString()
      });
      
      next(new AuthenticationError());
    }
  }
};


module.exports = {
  authentication
};