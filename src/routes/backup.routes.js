const backupController = require('../controllers/backup.controller');
const { authentication } = require('../middlewares/authentication.middleware');

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Backup
 *     description: Sistema de backup y recovery de datos
 */

/**
 * @swagger
 * /api/backup:
 *   post:
 *     summary: Crear un nuevo backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [full, incremental]
 *                 default: full
 *               collections:
 *                 type: array
 *                 items:
 *                   type: string
 *               compression:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Backup creado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       409:
 *         description: Ya hay un backup en progreso
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authentication, backupController.createBackup);

/**
 * @swagger
 * /api/backup:
 *   get:
 *     summary: Listar todos los backups disponibles
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full, incremental, all]
 *           default: all
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, largest, smallest]
 *           default: newest
 *     responses:
 *       200:
 *         description: Lista de backups obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authentication, backupController.listBackups);

/**
 * @swagger
 * /api/backup/status:
 *   get:
 *     summary: Obtener estado del sistema de backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado del sistema de backup obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/status', authentication, backupController.getBackupStatus);

/**
 * @swagger
 * /api/backup/validate/{backupId}:
 *   get:
 *     summary: Validar integridad de un backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup validado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Backup no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/validate/:backupId', authentication, backupController.validateBackup);

/**
 * @swagger
 * /api/backup/download/{backupId}:
 *   get:
 *     summary: Descargar un backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup descargado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Backup no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/download/:backupId', authentication, backupController.downloadBackup);

/**
 * @swagger
 * /api/backup/restore/{backupId}:
 *   post:
 *     summary: Restaurar desde un backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collections:
 *                 type: array
 *                 items:
 *                   type: string
 *               force:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Restauración iniciada exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Backup no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/restore/:backupId', authentication, backupController.restoreBackup);

/**
 * @swagger
 * /api/backup/{backupId}:
 *   delete:
 *     summary: Eliminar un backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup eliminado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Backup no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:backupId', authentication, backupController.deleteBackup);

/**
 * @swagger
 * /api/backup/cleanup:
 *   post:
 *     summary: Limpiar backups antiguos
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               olderThan:
 *                 type: integer
 *                 description: Días de antigüedad
 *                 default: 30
 *               keepCount:
 *                 type: integer
 *                 description: Número mínimo de backups a mantener
 *                 default: 5
 *     responses:
 *       200:
 *         description: Limpieza completada exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/cleanup', authentication, backupController.cleanupBackups);

module.exports = router;
