const backupUtils = require('../utils/backup');
const path = require('path');
const fs = require('fs').promises;
const { ValidationError, ConflictError, InternalServerError, NotFoundError } = require('../middlewares/error');
const { createSuccessWithLog } = require('../utils/success');
const { logAndExecute } = require('../config/log');

// Estado global del sistema de backup
let backupState = {
  inProgress: false,
  currentOperation: null,
  lastBackup: null
};

/**
 * Servicio para crear un nuevo backup
 * @param {Object} options - Opciones para el backup
 * @param {string} options.type - Tipo de backup ('full' o 'incremental')
 * @param {Array} options.collections - Colecciones a respaldar (opcional)
 * @param {boolean} options.compression - Activar compresión
 * @param {string} options.requestedBy - Usuario que solicita el backup
 * @returns {Promise<Object>} Información del backup creado
 */
const createBackup = async (options) => {
  const { type = 'full', collections = null, compression = true, requestedBy = 'system' } = options;

  if (backupState.inProgress) {
    throw new ConflictError('Ya hay un backup en progreso');
  }

  backupState.inProgress = true;
  backupState.currentOperation = {
    type,
    startTime: new Date(),
    progress: 0,
    currentCollection: null,
    requestedBy
  };

  try {
    let result;
    if (type === 'full') {
      logAndExecute('info', 'Iniciando backup completo...');
      result = await backupUtils.createFullBackup({
        collections: collections || ['products', 'users', 'orders', 'category'],
        compression,
        onProgress: (progress, collection) => {
          backupState.currentOperation.progress = progress;
          backupState.currentOperation.currentCollection = collection;
        }
      });
    } else if (type === 'incremental') {
      logAndExecute('info', 'Iniciando backup incremental...');
      result = await backupUtils.createIncrementalBackup({
        collections: collections || ['products', 'users', 'orders', 'category'],
        compression,
        onProgress: (progress, collection) => {
          backupState.currentOperation.progress = progress;
          backupState.currentOperation.currentCollection = collection;
        }
      });
    } else {
      throw new ValidationError('Tipo de backup inválido');
    }

    backupState.lastBackup = {
      timestamp: new Date(),
      type,
      filename: result.filename,
      size: result.size,
      success: true
    };

    logAndExecute('info', `${type === 'full' ? '💾 Backup completo creado exitosamente' : 'Backup incremental finalizado:'} ${result.filename}`);
    logAndExecute('info', `Tamaño del backup: ${(result.size / 1024 / 1024).toFixed(2)} MB`);
    logAndExecute('info', `Duración del backup: ${result.duration}`);

    return result;

  } catch (error) {
    backupState.lastBackup = {
      timestamp: new Date(),
      type,
      filename: null,
      size: 0,
      success: false,
      error: error.message
    };
    if (error instanceof ValidationError || error instanceof ConflictError) {
      throw error;
    }
    throw new InternalServerError('Error inesperado al crear backup', {
      operation: 'createBackup',
      backupType: type,
      originalError: error.message
    });
  } finally {
    backupState.inProgress = false;
    backupState.currentOperation = null;
  }
};

/**
 * Servicio para listar backups disponibles
 * @param {Object} options - Opciones para el listado
 * @param {string} options.type - Filtrar por tipo ('full', 'incremental' o null para todos)
 * @param {number} options.limit - Límite de resultados
 * @param {string} options.sort - Orden ('newest', 'oldest', 'largest', 'smallest')
 * @returns {Promise<Object>} Lista de backups y metadata
 */
const listBackups = async (options = {}) => {
  const { type = null, limit = 50, sort = 'newest' } = options;
  try {
    const backups = await backupUtils.listBackups();
    let filteredBackups = backups;
    if (type) {
      filteredBackups = backups.filter(backup => backup.type === type);
    }
    switch (sort) {
      case 'newest':
        filteredBackups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'oldest':
        filteredBackups.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'largest':
        filteredBackups.sort((a, b) => b.size - a.size);
        break;
      case 'smallest':
        filteredBackups.sort((a, b) => a.size - b.size);
        break;
      default:
        filteredBackups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    const limitedBackups = filteredBackups.slice(0, limit);
    logAndExecute('info', `Listando backups: total=${filteredBackups.length}, devueltos=${limitedBackups.length}`);
    return {
      backups: limitedBackups,
      total: filteredBackups.length,
      totalAllTypes: backups.length
    };
  } catch (error) {
    throw new InternalServerError('Error inesperado al listar backups', { originalError: error.message });
  }
};

/**
 * Servicio para obtener el estado del sistema de backup
 * @returns {Promise<Object>} Estado completo del sistema
 */
const getBackupStatus = async () => {
  try {
    const backups = await backupUtils.listBackups();
    const fullBackups = backups.filter(b => b.type === 'full').length;
    const incrementalBackups = backups.filter(b => b.type === 'incremental').length;
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const timestamps = backups.map(b => new Date(b.timestamp)).sort();
    const oldestBackup = timestamps.length > 0 ? timestamps[0] : null;
    const newestBackup = timestamps.length > 0 ? timestamps[timestamps.length - 1] : null;
    logAndExecute('info', `Estado del sistema de backup consultado. Total backups: ${backups.length}`);
    return {
      inProgress: backupState.inProgress,
      currentOperation: backupState.currentOperation,
      lastBackup: backupState.lastBackup,
      stats: {
        totalBackups: backups.length,
        fullBackups,
        incrementalBackups,
        totalSize,
        oldestBackup: oldestBackup ? oldestBackup.toISOString() : null,
        newestBackup: newestBackup ? newestBackup.toISOString() : null
      }
    };
  } catch (error) {
    throw new InternalServerError('Error inesperado al obtener estado del backup', { originalError: error.message });
  }
};

/**
 * Servicio para obtener información de un backup específico
 * @param {string} backupId - ID del backup
 * @returns {Promise<Object|null>} Información del backup o null si no existe
 */
const getBackupInfo = async (backupId) => {
  try {
    const info = await backupUtils.getBackupInfo(backupId);
    if (!info) {
      throw new NotFoundError('Backup no encontrado');
    }
    logAndExecute('info', `Información de backup consultada: ${backupId}`);
    return info;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError('Error inesperado al obtener información del backup', { originalError: error.message });
  }
};

/**
 * Servicio para restaurar desde un backup
 * @param {Object} options - Opciones para la restauración
 * @param {string} options.backupId - ID del backup a restaurar
 * @param {Array} options.collections - Colecciones a restaurar (opcional)
 * @param {boolean} options.force - Forzar restauración sin validación
 * @param {boolean} options.validateFirst - Validar backup antes de restaurar
 * @param {string} options.requestedBy - Usuario que solicita la restauración
 * @returns {Promise<Object>} Resultado de la restauración
 */
const restoreFromBackup = async (options) => {
  const { 
    backupId, 
    collections = null, 
    force = false, 
    validateFirst = true, 
    requestedBy = 'system' 
  } = options;

  if (backupState.inProgress) {
    throw new ConflictError('Ya hay una operación de restauración en progreso');
  }

  backupState.inProgress = true;
  backupState.currentOperation = {
    type: 'restore',
    startTime: new Date(),
    progress: 0,
    currentCollection: null,
    requestedBy,
    backupId
  };

  try {
    logAndExecute('info', `🔄 Iniciando recuperación desde backup ${backupId}`);
    // Validar backup si se solicita
    if (validateFirst && !force) {
      logAndExecute('info', 'Validando backup antes de restaurar...');
      const validation = await backupUtils.validateBackup(backupId);
      if (!validation) {
        throw new NotFoundError('Backup no encontrado para restaurar');
      }
      if (!validation.valid) {
        throw new ValidationError(`El backup está corrupto o es inválido: ${validation.issues?.join(', ')}`);
      }
      logAndExecute('info', '✅ Validación de backup exitosa');
    }
    const result = await backupUtils.recoverFromBackup(backupId, {
      collections,
      onProgress: (progress, collection) => {
        backupState.currentOperation.progress = progress;
        backupState.currentOperation.currentCollection = collection;
      }
    });
    logAndExecute('info', `Recuperación completada exitosamente para backup: ${backupId}`);
    logAndExecute('info', `Estadísticas de recuperación: ${result.totalDocuments} documentos restaurados`);
    return result;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof ConflictError) {
      throw error;
    }
    throw new InternalServerError('Error inesperado en el proceso de recuperación', { originalError: error.message });
  } finally {
    backupState.inProgress = false;
    backupState.currentOperation = null;
  }
};

/**
 * Servicio para validar un backup
 * @param {string} backupId - ID del backup a validar
 * @returns {Promise<Object|null>} Resultado de la validación o null si no existe
 */
const validateBackup = async (backupId) => {
  try {
    const validation = await backupUtils.validateBackup(backupId);
    if (!validation) {
      throw new NotFoundError('Backup no encontrado para validar');
    }
    logAndExecute('info', `Validación de backup consultada: ${backupId}`);
    return validation;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError('Error inesperado al validar backup', { originalError: error.message });
  }
};

/**
 * Servicio para eliminar un backup
 * @param {string} backupId - ID del backup a eliminar
 * @returns {Promise<boolean>} true si se eliminó, false si no existía
 */
const deleteBackup = async (backupId) => {
  try {
    const deleted = await backupUtils.deleteBackup(backupId);
    if (!deleted) {
      throw new NotFoundError('Backup no encontrado para eliminar');
    }
    logAndExecute('info', `🗑️ Backup eliminado exitosamente: ${backupId}`);
    return deleted;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError('Error inesperado al eliminar backup', { originalError: error.message });
  }
};

/**
 * Servicio para limpiar backups antiguos
 * @param {Object} options - Opciones para la limpieza
 * @param {boolean} options.dryRun - Solo simular sin eliminar
 * @param {number} options.maxFullBackups - Máximo de backups completos
 * @param {number} options.maxIncrementalBackups - Máximo de backups incrementales
 * @returns {Promise<Object>} Resultado de la limpieza
 */
const cleanupOldBackups = async (options = {}) => {
  const { 
    dryRun = false, 
    maxFullBackups = 7,
    maxIncrementalBackups = 24
  } = options;
  try {
    logAndExecute('info', `🧹 Limpieza de backups antiguos (dryRun: ${dryRun})`);
    const result = await backupUtils.cleanupOldBackups({
      maxFullBackups,
      maxIncrementalBackups,
      dryRun
    });
    if (dryRun) {
      logAndExecute('info', `Simulación completada: ${result.deleted.length} backups serían eliminados`);
    } else {
      logAndExecute('info', `🧹 Limpieza de backups completada exitosamente: ${result.deleted.length} backups eliminados`);
    }
    return result;
  } catch (error) {
    throw new InternalServerError('Error inesperado en limpieza de backups', { originalError: error.message });
  }
};

/**
 * Servicio para programar backups automáticos
 * @param {Object} schedule - Configuración de programación
 * @returns {Promise<Object>} Información de la programación
 */
const scheduleAutomaticBackups = async (schedule = {}) => {
  try {
    logAndExecute('info', 'Programando backup automático');
    return {
      fullBackupInterval: schedule.fullBackupInterval || 24 * 60 * 60 * 1000,
      incrementalBackupInterval: schedule.incrementalBackupInterval || 60 * 60 * 1000,
      enabled: true,
      nextFullBackup: new Date(Date.now() + (schedule.fullBackupInterval || 24 * 60 * 60 * 1000)),
      nextIncrementalBackup: new Date(Date.now() + (schedule.incrementalBackupInterval || 60 * 60 * 1000))
    };
  } catch (error) {
    throw new InternalServerError('Error inesperado en backup automático', { originalError: error.message });
  }
};

module.exports = {
  createBackup,
  listBackups,
  getBackupStatus,
  getBackupInfo,
  restoreFromBackup,
  validateBackup,
  deleteBackup,
  cleanupOldBackups,
  scheduleAutomaticBackups
};
