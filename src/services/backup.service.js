const backupUtils = require('../utils/backup.utils');
const path = require('path');
const fs = require('fs').promises;
const { BACKUP_CONFIG, BACKUP_MESSAGES } = require('../utils/messages.utils');
const { 
  ValidationError, 
  ConflictError, 
  InternalServerError, 
  NotFoundError 
} = require('../utils/error.utils');

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

  // Verificar si ya hay un backup en progreso
  if (backupState.inProgress) {
    throw new ConflictError(BACKUP_MESSAGES.BACKUP_IN_PROGRESS);
  }

  // Marcar backup como en progreso
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
      console.log(BACKUP_MESSAGES.STARTING_FULL_BACKUP);
      result = await backupUtils.createFullBackup({
        collections: collections || BACKUP_CONFIG.DEFAULT_COLLECTIONS,
        compression,
        onProgress: (progress, collection) => {
          backupState.currentOperation.progress = progress;
          backupState.currentOperation.currentCollection = collection;
        }
      });
    } else if (type === 'incremental') {
      console.log(BACKUP_MESSAGES.STARTING_INCREMENTAL_BACKUP);
      result = await backupUtils.createIncrementalBackup({
        collections: collections || BACKUP_CONFIG.DEFAULT_COLLECTIONS,
        compression,
        onProgress: (progress, collection) => {
          backupState.currentOperation.progress = progress;
          backupState.currentOperation.currentCollection = collection;
        }
      });
    } else {
      throw new ValidationError();
    }

    // Actualizar estado del último backup
    backupState.lastBackup = {
      timestamp: new Date(),
      type,
      filename: result.filename,
      size: result.size,
      success: true
    };

    console.log(`${type === 'full' ? BACKUP_MESSAGES.FULL_BACKUP_COMPLETED : BACKUP_MESSAGES.INCREMENTAL_BACKUP_COMPLETED} ${result.filename}`);
    console.log(`${BACKUP_MESSAGES.BACKUP_SIZE} ${(result.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`${BACKUP_MESSAGES.BACKUP_DURATION} ${result.duration}`);

    return result;

  } catch (error) {
    // Actualizar estado de error
    backupState.lastBackup = {
      timestamp: new Date(),
      type,
      filename: null,
      size: 0,
      success: false,
      error: error.message
    };

    throw new InternalServerError(undefined, {
      operation: 'createBackup',
      backupType: type,
      originalError: error.message
    });
  } finally {
    // Limpiar estado de progreso
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
    
    // Filtrar por tipo si se especifica
    let filteredBackups = backups;
    if (type) {
      filteredBackups = backups.filter(backup => backup.type === type);
    }

    // Ordenar según criterio
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
        // Por defecto newest
        filteredBackups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Aplicar límite
    const limitedBackups = filteredBackups.slice(0, limit);

    return {
      backups: limitedBackups,
      total: filteredBackups.length,
      totalAllTypes: backups.length
    };

  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.LIST_BACKUPS_ERROR, { originalError: error.message });
  }
};

/**
 * Servicio para obtener el estado del sistema de backup
 * @returns {Promise<Object>} Estado completo del sistema
 */
const getBackupStatus = async () => {
  try {
    const backups = await backupUtils.listBackups();
    
    // Calcular estadísticas
    const fullBackups = backups.filter(b => b.type === 'full').length;
    const incrementalBackups = backups.filter(b => b.type === 'incremental').length;
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    
    const timestamps = backups.map(b => new Date(b.timestamp)).sort();
    const oldestBackup = timestamps.length > 0 ? timestamps[0] : null;
    const newestBackup = timestamps.length > 0 ? timestamps[timestamps.length - 1] : null;

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
    throw new InternalServerError(BACKUP_MESSAGES.BACKUP_STATUS_ERROR, { originalError: error.message });
  }
};

/**
 * Servicio para obtener información de un backup específico
 * @param {string} backupId - ID del backup
 * @returns {Promise<Object|null>} Información del backup o null si no existe
 */
const getBackupInfo = async (backupId) => {
  try {
    return await backupUtils.getBackupInfo(backupId);
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.BACKUP_INFO_ERROR, { originalError: error.message });
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

  // Verificar si ya hay una operación en progreso
  if (backupState.inProgress) {
    throw new ConflictError(BACKUP_MESSAGES.RECOVERY_IN_PROGRESS);
  }

  // Marcar operación como en progreso
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
    console.log(`${BACKUP_MESSAGES.STARTING_RECOVERY} ${backupId}`);

    // Validar backup si se solicita
    if (validateFirst && !force) {
      console.log('Validando backup antes de restaurar...');
      const validation = await backupUtils.validateBackup(backupId);
      if (!validation.valid) {
        throw new ValidationError(`${BACKUP_MESSAGES.BACKUP_CORRUPTED}: ${validation.issues?.join(', ')}`);
      }
      console.log(BACKUP_MESSAGES.BACKUP_VALIDATION_SUCCESS);
    }

    // Ejecutar restauración
    const result = await backupUtils.recoverFromBackup(backupId, {
      collections,
      onProgress: (progress, collection) => {
        backupState.currentOperation.progress = progress;
        backupState.currentOperation.currentCollection = collection;
      }
    });

    console.log(`${BACKUP_MESSAGES.RECOVERY_COMPLETED} ${backupId}`);
    console.log(`${BACKUP_MESSAGES.RECOVERY_STATS}: ${result.totalDocuments} documentos restaurados`);

    return result;

  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.RECOVERY_FAILED, { originalError: error.message });
  } finally {
    // Limpiar estado de progreso
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
    return await backupUtils.validateBackup(backupId);
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.BACKUP_VALIDATION_ERROR, { originalError: error.message });
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
    if (deleted) {
      console.log(`${BACKUP_MESSAGES.BACKUP_DELETED}: ${backupId}`);
    }
    return deleted;
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.BACKUP_DELETE_FAILED, { originalError: error.message });
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
    maxFullBackups = BACKUP_CONFIG.MAX_FULL_BACKUPS,
    maxIncrementalBackups = BACKUP_CONFIG.MAX_INCREMENTAL_BACKUPS
  } = options;

  try {
    console.log(`${BACKUP_MESSAGES.CLEANING_OLD_BACKUPS} (dryRun: ${dryRun})`);

    const result = await backupUtils.cleanupOldBackups({
      maxFullBackups,
      maxIncrementalBackups,
      dryRun
    });

    if (dryRun) {
      console.log(`Simulación completada: ${result.deleted.length} backups serían eliminados`);
    } else {
      console.log(`${BACKUP_MESSAGES.CLEANUP_COMPLETED}: ${result.deleted.length} backups eliminados`);
    }

    return result;

  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.CLEANUP_FAILED, { originalError: error.message });
  }
};

/**
 * Servicio para programar backups automáticos
 * @param {Object} schedule - Configuración de programación
 * @returns {Promise<Object>} Información de la programación
 */
const scheduleAutomaticBackups = async (schedule = {}) => {
  try {
    console.log(BACKUP_MESSAGES.SCHEDULING_AUTOMATIC_BACKUP);
    
    // Esta función inicializaría el sistema de backups automáticos
    // Por ahora retorna información de configuración
    return {
      fullBackupInterval: schedule.fullBackupInterval || BACKUP_CONFIG.FULL_BACKUP_INTERVAL,
      incrementalBackupInterval: schedule.incrementalBackupInterval || BACKUP_CONFIG.INCREMENTAL_BACKUP_INTERVAL,
      enabled: true,
      nextFullBackup: new Date(Date.now() + (schedule.fullBackupInterval || BACKUP_CONFIG.FULL_BACKUP_INTERVAL)),
      nextIncrementalBackup: new Date(Date.now() + (schedule.incrementalBackupInterval || BACKUP_CONFIG.INCREMENTAL_BACKUP_INTERVAL))
    };

  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.AUTOMATIC_BACKUP_FAILED, { originalError: error.message });
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
