const { EXTERNAL_PACKAGES, RELATIVE_PATHS, HTTP_STATUS, AUTHENTICATION, HTTP_HEADERS } = require('../config/paths.config.js');
const { AUTH_MIDDLEWARE_MESSAGES } = require('../utils/messages.utils.js');
const jwt = require(EXTERNAL_PACKAGES.JSONWEBTOKEN);
const Logger = require(RELATIVE_PATHS.FROM_MIDDLEWARES.CONFIG_LOGGER);

const secret_key = process.env.JWT_SECRET_KEY;

const authentication = (req, res, next) => {
  const authHeader = req.headers[AUTHENTICATION.AUTHORIZATION_HEADER];
  
  if (!authHeader) {
    Logger.warn(AUTH_MIDDLEWARE_MESSAGES.ACCESS_WITHOUT_TOKEN, {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get(HTTP_HEADERS.USER_AGENT),
      timestamp: new Date().toISOString()
    });
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: AUTH_MIDDLEWARE_MESSAGES.TOKEN_REQUIRED 
    });
  }

  const token = authHeader.split(AUTHENTICATION.TOKEN_SEPARATOR)[AUTHENTICATION.TOKEN_INDEX];

  if (!token) {
    Logger.warn(AUTH_MIDDLEWARE_MESSAGES.INVALID_TOKEN_FORMAT, {
      authHeader: authHeader,
      ip: req.ip,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: AUTH_MIDDLEWARE_MESSAGES.TOKEN_INVALID_FORMAT 
    });
  }

  jwt.verify(token, secret_key, (error, decoded) => {
    if (error) {
      Logger.warn(AUTH_MIDDLEWARE_MESSAGES.INVALID_OR_EXPIRED_TOKEN, {
        error: error.message,
        tokenType: error.name,
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.get(HTTP_HEADERS.USER_AGENT),
        timestamp: new Date().toISOString()
      });
      
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        message: AUTH_MIDDLEWARE_MESSAGES.TOKEN_INVALID_OR_EXPIRED,
        error: error.message 
      });
    }
    
    Logger.info(AUTH_MIDDLEWARE_MESSAGES.AUTHENTICATION_SUCCESS, {
      userId: decoded.id,
      email: decoded.email,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    req.user = decoded; // Guardamos la info del usuario decodificada
    next();
  });
};


module.exports = {
  authentication
};