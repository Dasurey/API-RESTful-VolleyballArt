/**
 * Controlador temporal simplificado para backup
 * Para diagnosticar problemas de importación
 */
const { BACKUP_MESSAGES } = require('../utils/messages.utils.js');
const { 
  ValidationError, 
  InternalServerError, 
  ConflictError 
} = require('../utils/error.utils.js');
const { controllerWrapper } = require('../utils/async.utils.js');

const createBackup = controllerWrapper(async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: BACKUP_MESSAGES.FULL_BACKUP_COMPLETED,
      data: {
        type: req.body?.type || 'full',
        timestamp: new Date().toISOString(),
        status: 'test_mode'
      }
    });
  } catch (error) {
    // Si es un error específico de nuestras utilidades, lo pasamos al error.utils.js
    if (error instanceof ValidationError || error instanceof ConflictError) {
      throw error;
    }
    // Si no, lo convertimos en un InternalServerError
    throw new InternalServerError(BACKUP_MESSAGES.BACKUP_FAILED, { originalError: error.message });
  }
});

const listBackups = controllerWrapper(async (req, res) => {
  try {
    res.json({
      success: true,
      message: BACKUP_MESSAGES.LIST_BACKUPS_SUCCESS,
      data: [],
      meta: {
        total: 0,
        returned: 0,
        status: 'test_mode'
      }
    });
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.LIST_BACKUPS_ERROR, { originalError: error.message });
  }
});

const getBackupStatus = controllerWrapper(async (req, res) => {
  try {
    res.json({
      success: true,
      message: BACKUP_MESSAGES.BACKUP_STATUS_SUCCESS,
      data: {
        inProgress: false,
        currentOperation: null,
        lastBackup: null,
        stats: {
          totalBackups: 0,
          fullBackups: 0,
          incrementalBackups: 0
        },
        status: 'test_mode'
      }
    });
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.BACKUP_STATUS_ERROR, { originalError: error.message });
  }
});

const validateBackup = controllerWrapper(async (req, res) => {
  try {
    const { backupId } = req.params;
    res.json({
      success: true,
      message: BACKUP_MESSAGES.BACKUP_VALIDATION_SUCCESS,
      data: {
        backupId,
        isValid: true,
        validatedAt: new Date().toISOString(),
        status: 'test_mode'
      }
    });
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.BACKUP_VALIDATION_ERROR, { originalError: error.message });
  }
});

const downloadBackup = controllerWrapper(async (req, res) => {
  try {
    const { backupId } = req.params;
    res.json({
      success: true,
      message: BACKUP_MESSAGES.DOWNLOAD_BACKUP_SUCCESS,
      data: {
        backupId,
        downloadUrl: `/api/backup/download/${backupId}`,
        status: 'test_mode'
      }
    });
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.DOWNLOAD_BACKUP_ERROR, { originalError: error.message });
  }
});

const restoreBackup = controllerWrapper(async (req, res) => {
  try {
    const { backupId } = req.params;
    res.json({
      success: true,
      message: BACKUP_MESSAGES.STARTING_RECOVERY,
      data: {
        backupId,
        restoreStatus: 'initiated',
        timestamp: new Date().toISOString(),
        status: 'test_mode'
      }
    });
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.RECOVERY_FAILED, { originalError: error.message });
  }
});

const deleteBackup = controllerWrapper(async (req, res) => {
  try {
    const { backupId } = req.params;
    res.json({
      success: true,
      message: BACKUP_MESSAGES.BACKUP_DELETED,
      data: {
        backupId,
        deleted: true,
        timestamp: new Date().toISOString(),
        status: 'test_mode'
      }
    });
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.BACKUP_DELETE_FAILED, { originalError: error.message });
  }
});

const cleanupBackups = controllerWrapper(async (req, res) => {
  try {
    res.json({
      success: true,
      message: BACKUP_MESSAGES.CLEANUP_COMPLETED,
      data: {
        cleanedCount: 0,
        spaceFreed: '0 MB',
        timestamp: new Date().toISOString(),
        status: 'test_mode'
      }
    });
  } catch (error) {
    throw new InternalServerError(BACKUP_MESSAGES.CLEANUP_FAILED, { originalError: error.message });
  }
});

module.exports = {
  createBackup,
  listBackups,
  getBackupStatus,
  validateBackup,
  downloadBackup,
  restoreBackup,
  deleteBackup,
  cleanupBackups
};
