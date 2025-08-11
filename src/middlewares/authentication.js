const { verifyToken } = require('../config/jwt');
const { AuthenticationError } = require('./error');
const { Logger } = require('../config/log');
const { createSuccessWithLog } = requiere('../utils/success');

const authentication = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      Logger.warn('🔐 Intento de acceso sin token de autorización', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      throw new AuthenticationError();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      Logger.warn('🔐 Token de autorización con formato inválido', {
        authHeader: authHeader,
        ip: req.ip,
        url: req.originalUrl,
        timestamp: new Date().toISOString()
      });
      
      throw new AuthenticationError();
    }

    const decoded = verifyToken(token);
    
    createSuccessWithLog(
      res,
      200,
      '✅ Autenticación exitosa',
      { userId: decoded.id, email: decoded.email },
      { url: req.originalUrl, method: req.method, timestamp: new Date().toISOString() }
    );
    
    req.user = decoded; // Guardamos la info del usuario decodificada
    next();
    
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      Logger.warn('🔐 Token JWT inválido o expirado', {
        error: error.message,
        tokenType: error.name,
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      next(new AuthenticationError());
    }
  }
};


module.exports = {
  authentication
};