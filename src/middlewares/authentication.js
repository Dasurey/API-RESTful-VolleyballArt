const jwt = require('jsonwebtoken');
const Logger = require('../config/logger.js');

const secret_key = process.env.JWT_SECRET_KEY;

const authentication = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    Logger.warn('🔐 Intento de acceso sin token de autorización', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    return res.status(401).json({ 
      message: 'Token de acceso requerido. Incluye el header Authorization.' 
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    Logger.warn('🔐 Token de autorización con formato inválido', {
      authHeader: authHeader,
      ip: req.ip,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });
    
    return res.status(401).json({ 
      message: 'Token de acceso inválido. Formato: Bearer <token>' 
    });
  }

  jwt.verify(token, secret_key, (error, decoded) => {
    if (error) {
      Logger.warn('🔐 Token JWT inválido o expirado', {
        error: error.message,
        tokenType: error.name,
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({ 
        message: 'Token de acceso inválido o expirado.',
        error: error.message 
      });
    }
    
    Logger.info('✅ Autenticación exitosa', {
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