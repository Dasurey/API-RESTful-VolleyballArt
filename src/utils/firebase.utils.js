const { RELATIVE_PATHS } = require('../config/paths.config.js');
const { SYSTEM_MESSAGES } = require('./messages.utils.js');
const { logMessage } = require(RELATIVE_PATHS.FROM_UTILS.RESPONSE_UTILS);
const { 
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  InternalServerError 
} = require('./error.utils.js');
const {
    collection,
    getDocs,
    query,
    where: whereClause,
    orderBy: orderByClause,
    limit: limitClause,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc
} = require('firebase/firestore');

/**
 * Utilidades específicas para modelos con Firebase
 */

/**
 * Wrapper para operaciones Firebase con manejo de errores estandarizado
 * @param {Function} firebaseOperation - Función que realiza la operación en Firebase
 * @param {string} operationType - Tipo de operación (ej: 'create', 'read', 'update', 'delete')
 * @param {string} collection - Nombre de la colección
 * @param {Object} metadata - Metadatos adicionales para logging
 */
async function executeFirebaseOperation(firebaseOperation, operationType, collection, metadata = {}) {
    try {
        const startTime = Date.now();
        const result = await firebaseOperation();
        const executionTime = Date.now() - startTime;

        // Log de éxito con detalles de la operación
        logMessage(SYSTEM_MESSAGES.FIREBASE_LOG_INFO, `${operationType} ${SYSTEM_MESSAGES.FIREBASE_OPERATION_OF} ${collection} ${SYSTEM_MESSAGES.FIREBASE_OPERATION_SUCCESS}`, {
            collection,
            operationType,
            executionTime: `${executionTime}${SYSTEM_MESSAGES.FIREBASE_EXECUTION_TIME}`,
            timestamp: new Date().toISOString(),
            ...metadata
        });

        return result;
    } catch (error) {
        throw new InternalServerError(
            undefined, // Usar mensaje por defecto
            { operation: operationType, collection, originalError: error.message, stack: error.stack, timestamp: new Date().toISOString(), ...metadata }
        );
    }
}

/**
 * Crear documento en Firebase con ID automático
 * @param {Object} db - Instancia de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @param {Object} data - Datos a insertar
 * @param {Object} options - Opciones adicionales
 */
async function createDocument(db, collectionName, data, options = {}) {
    const { includeTimestamp = true, validateData = null } = options;

    return executeFirebaseOperation(
        async () => {
            // Validar datos si se proporciona función de validación
            if (validateData) {
                const validation = validateData(data);
                if (!validation.isValid) {
                    throw new ValidationError();
                }
            }

            // Añadir timestamp si se requiere
            const documentData = includeTimestamp
                ? { ...data, [SYSTEM_MESSAGES.FIREBASE_TIMESTAMP_FIELD]: new Date().toISOString() }
                : data;

            const docRef = await db.collection(collectionName).add(documentData);

            return {
                id: docRef.id,
                ...documentData
            };
        },
        SYSTEM_MESSAGES.FIREBASE_CREATE,
        collectionName,
        {
            [SYSTEM_MESSAGES.FIREBASE_DOCUMENT_SIZE_PREFIX]: JSON.stringify(data).length,
            [SYSTEM_MESSAGES.FIREBASE_HAS_VALIDATION_PREFIX]: !!validateData
        }
    );
}

/**
 * Obtener documento por ID
 * @param {Object} db - Instancia de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @param {string} documentId - ID del documento
 * @param {Object} options - Opciones adicionales
 */
async function getDocumentById(db, collectionName, documentId, options = {}) {
    const { includeMetadata = false } = options;

    return executeFirebaseOperation(
        async () => {
            const docRef = doc(db, collectionName, documentId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            const data = docSnap.data();
            const result = { id: docSnap.id, ...data };

            if (includeMetadata) {
                result._metadata = {
                    [SYSTEM_MESSAGES.FIREBASE_METADATA_CREATE_TIME]: docSnap.metadata.fromCache ? null : docSnap.metadata.hasPendingWrites,
                    [SYSTEM_MESSAGES.FIREBASE_METADATA_UPDATE_TIME]: docSnap.metadata.fromCache ? null : docSnap.metadata.hasPendingWrites
                };
            }

            return result;
        },
        SYSTEM_MESSAGES.FIREBASE_READ,
        collectionName,
        { documentId }
    );
}

/**
 * Obtener todos los documentos de una colección
 * @param {Object} db - Instancia de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @param {Object} options - Opciones de filtrado y paginación
 */
async function getAllDocuments(db, collectionName, options = {}) {
    const {
        orderBy = null,
        limit = null,
        where = null,
        includeMetadata = false
    } = options;

    return executeFirebaseOperation(
        async () => {
            // Crear referencia a la colección usando la nueva API
            const collectionRef = collection(db, collectionName);
            let q = collectionRef;

            // Construir query con filtros y ordenamiento
            const constraints = [];

            // Aplicar filtros
            if (where) {
                where.forEach(({ field, operator, value }) => {
                    constraints.push(whereClause(field, operator, value));
                });
            }

            // Aplicar ordenamiento
            if (orderBy) {
                const { field, direction = SYSTEM_MESSAGES.FIREBASE_ORDER_ASC } = orderBy;
                constraints.push(orderByClause(field, direction));
            }

            // Aplicar límite
            if (limit) {
                constraints.push(limitClause(limit));
            }

            // Si hay constraints, crear query
            if (constraints.length > 0) {
                q = query(collectionRef, ...constraints);
            }

            const snapshot = await getDocs(q);

            const documents = snapshot.docs.map(doc => {
                const data = doc.data();
                const result = { id: doc.id, ...data };

                if (includeMetadata) {
                    result._metadata = {
                        [SYSTEM_MESSAGES.FIREBASE_METADATA_CREATE_TIME]: doc.createTime,
                        [SYSTEM_MESSAGES.FIREBASE_METADATA_UPDATE_TIME]: doc.updateTime
                    };
                }

                return result;
            });

            return documents;
        },
        SYSTEM_MESSAGES.FIREBASE_READ,
        collectionName,
        {
            [SYSTEM_MESSAGES.FIREBASE_TOTAL_DOCUMENTS_PREFIX]: snapshot?.size || 0,
            [SYSTEM_MESSAGES.FIREBASE_HAS_FILTERS_PREFIX]: !!where,
            [SYSTEM_MESSAGES.FIREBASE_HAS_ORDERING_PREFIX]: !!orderBy,
            [SYSTEM_MESSAGES.FIREBASE_HAS_LIMIT_PREFIX]: !!limit
        }
    );
}

/**
 * Actualizar documento por ID
 * @param {Object} db - Instancia de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @param {string} documentId - ID del documento
 * @param {Object} data - Datos a actualizar
 * @param {Object} options - Opciones adicionales
 */
async function updateDocument(db, collectionName, documentId, data, options = {}) {
    const { includeTimestamp = true, validateData = null, merge = false } = options;

    return executeFirebaseOperation(
        async () => {
            // Validar datos si se proporciona función de validación
            if (validateData) {
                const validation = validateData(data);
                if (!validation.isValid) {
                    throw new ValidationError();
                }
            }

            // Añadir timestamp de actualización si se requiere
            const updateData = includeTimestamp
                ? { ...data, [SYSTEM_MESSAGES.FIREBASE_UPDATED_TIMESTAMP_FIELD]: new Date().toISOString() }
                : data;

            const docRef = doc(db, collectionName, documentId);

            // Verificar que el documento existe
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                return null;
            }

            // Actualizar documento usando Firebase v9+ API
            if (merge) {
                await setDoc(docRef, updateData, { merge: true });
            } else {
                await updateDoc(docRef, updateData);
            }

            // Retornar documento actualizado
            const updatedDocSnap = await getDoc(docRef);
            return { id: updatedDocSnap.id, ...updatedDocSnap.data() };
        },
        SYSTEM_MESSAGES.FIREBASE_UPDATE,
        collectionName,
        {
            documentId,
            [SYSTEM_MESSAGES.FIREBASE_UPDATED_FIELDS_PREFIX]: Object.keys(data),
            [SYSTEM_MESSAGES.FIREBASE_MERGE_PREFIX]: merge,
            [SYSTEM_MESSAGES.FIREBASE_HAS_VALIDATION_PREFIX]: !!validateData
        }
    );
}

/**
 * Eliminar documento por ID
 * @param {Object} db - Instancia de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @param {string} documentId - ID del documento
 * @param {Object} options - Opciones adicionales
 */
async function deleteDocument(db, collectionName, documentId, options = {}) {
    const { softDelete = false, deletedField = SYSTEM_MESSAGES.FIREBASE_DELETED_FIELD } = options;

    return executeFirebaseOperation(
        async () => {
            const docRef = doc(db, collectionName, documentId);

            // Verificar que el documento existe
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                return null;
            }

            if (softDelete) {
                // Soft delete: marcar como eliminado usando Firebase v9+ API
                await updateDoc(docRef, {
                    [deletedField]: new Date().toISOString(),
                    [SYSTEM_MESSAGES.FIREBASE_IS_DELETED_FIELD]: SYSTEM_MESSAGES.FIREBASE_DELETED_FLAG
                });

                const updatedDocSnap = await getDoc(docRef);
                return { id: updatedDocSnap.id, ...updatedDocSnap.data() };
            } else {
                // Hard delete: eliminar completamente usando Firebase v9+ API
                await deleteDoc(docRef);
                return { id: documentId, deleted: SYSTEM_MESSAGES.FIREBASE_DELETED_FLAG };
            }
        },
        SYSTEM_MESSAGES.FIREBASE_DELETE,
        collectionName,
        {
            documentId,
            softDelete
        }
    );
}

/**
 * Buscar documentos con query personalizada
 * @param {Object} db - Instancia de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @param {Function} queryBuilder - Función que construye la query
 * @param {Object} options - Opciones adicionales
 */
async function searchDocuments(db, collectionName, queryBuilder, options = {}) {
    const { includeMetadata = false } = options;

    return executeFirebaseOperation(
        async () => {
            // Usar la nueva API v9+ para construir la query
            const collectionRef = collection(db, collectionName);
            const q = queryBuilder(collectionRef);
            const snapshot = await getDocs(q);

            const documents = snapshot.docs.map(doc => {
                const data = doc.data();
                const result = { id: doc.id, ...data };

                if (includeMetadata) {
                    result._metadata = {
                        [SYSTEM_MESSAGES.FIREBASE_METADATA_CREATE_TIME]: doc.createTime,
                        [SYSTEM_MESSAGES.FIREBASE_METADATA_UPDATE_TIME]: doc.updateTime
                    };
                }

                return result;
            });

            return documents;
        },
        SYSTEM_MESSAGES.FIREBASE_SEARCH,
        collectionName,
        {
            [SYSTEM_MESSAGES.FIREBASE_TOTAL_RESULTS_PREFIX]: snapshot?.size || 0,
            [SYSTEM_MESSAGES.FIREBASE_HAS_CUSTOM_QUERY_PREFIX]: true
        }
    );
}

module.exports = {
    executeFirebaseOperation,
    createDocument,
    getDocumentById,
    getAllDocuments,
    updateDocument,
    deleteDocument,
    searchDocuments
};
