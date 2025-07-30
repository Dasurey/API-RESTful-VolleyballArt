/**
 * Utilidades para manejo de URLs dinámicas
 * Centraliza la lógica de generación de URLs base para toda la aplicación
 * 
 * ⚡ DETECCIÓN AUTOMÁTICA:
 * En producción, el servidor detecta automáticamente su URL desde el request HTTP.
 * Funciona con cualquier dominio (fulanino.com, api.miempresa.net, etc.) 
 * sin necesidad de configurar variables de entorno.
 * 
 * ✅ Funciona automáticamente con:
 * - Vercel (api-proyecto.vercel.app)
 * - Netlify (proyecto.netlify.app) 
 * - Railway (proyecto.railway.app)
 * - Render (proyecto.onrender.com)
 * - Heroku (proyecto.herokuapp.com)
 * - Tu dominio personalizado (fulanino.com)
 * - Cualquier proveedor de hosting
 * 
 * 🔧 Solo en casos especiales necesitarías configurar:
 * VERCEL_URL - Se configura automáticamente en Vercel
 * DOMAIN - Solo si el servidor no puede detectar el dominio
 */

// 🌐 Función para generar URL base según el entorno (Detección automática)
const getBaseUrl = (req = null) => {
    if (process.env.NODE_ENV === 'production') {
        // En producción: SIEMPRE detectar automáticamente desde el request
        if (req) {
            const protocol = req.headers['x-forwarded-proto'] || req.headers['x-forwarded-ssl'] === 'on' ? 'https' : req.connection.encrypted ? 'https' : 'http';
            return `${protocol}://${req.get('host')}`;
        }

        // Solo si NO hay request disponible, usar variables de entorno como fallback
        if (process.env.VERCEL_URL) {
            return `https://${process.env.VERCEL_URL}`;
        }

        // Último recurso: detectar desde variables del sistema
        const domain = process.env.DOMAIN || process.env.HOST || 'localhost';
        return `https://${domain}`;
    } else {
        // En desarrollo, usar localhost con puerto dinámico
        const PORT = process.env.PORT || 5000;
        return `http://localhost:${PORT}`;
    }
};

// 📁 Función para obtener rutas de archivos usando __dirname nativo
const getProjectPath = (baseDir, relativePath = '') => {
    const path = require('path');
    return path.join(baseDir, '..', relativePath);
};

module.exports = {
    getBaseUrl,
    getProjectPath
};
