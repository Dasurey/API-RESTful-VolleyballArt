const { logDatabase } = require('./log');
const { ValidationError, NotFoundError, ConflictError, InternalServerError } = require('../middlewares/error');
const { collection, getDocs, query, where: whereClause, orderBy: orderByClause, limit: limitClause, doc, getDoc, setDoc, updateDoc, deleteDoc } = require('firebase/firestore');

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
        logDatabase(`${operationType} de ${collection} exitoso`, {
            collection,
            operationType,
            executionTime: `${executionTime}ms`,
            timestamp: new Date().toISOString(),
            ...metadata
        }, 'DATABASE');

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
            const documentData = includeTimestamp ? { ...data, createdAt: new Date().toISOString() } : data;

            const docRef = await db.collection(collectionName).add(documentData);

            return {
                id: docRef.id,
                ...documentData
            };
        },
        'create',
        collectionName,
        {
            documentSize: JSON.stringify(data).length,
            hasValidation: !!validateData
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
                    createTime: docSnap.metadata.fromCache ? null : docSnap.metadata.hasPendingWrites,
                    updateTime: docSnap.metadata.fromCache ? null : docSnap.metadata.hasPendingWrites
                };
            }

            return result;
        },
        'read',
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
                const { field, direction = 'asc' } = orderBy;
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
                        createTime: doc.createTime,
                        updateTime: doc.updateTime
                    };
                }

                return result;
            });

            return documents;
        },
        'read',
        collectionName,
        {
            totalDocuments: snapshot?.size || 0,
            hasFilters: !!where,
            hasOrdering: !!orderBy,
            hasLimit: !!limit
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
                ? { ...data, updatedAt: new Date().toISOString() }
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
        'update',
        collectionName,
        {
            documentId,
            updatedFields: Object.keys(data),
            merge,
            hasValidation: !!validateData
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
    const { softDelete = false, deletedField = 'deletedAt' } = options;

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
                    isDeleted: true
                });

                const updatedDocSnap = await getDoc(docRef);
                return { id: updatedDocSnap.id, ...updatedDocSnap.data() };
            } else {
                // Hard delete: eliminar completamente usando Firebase v9+ API
                await deleteDoc(docRef);
                return { id: documentId, deleted: true };
            }
        },
        'delete',
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
                        createTime: doc.createTime,
                        updateTime: doc.updateTime
                    };
                }

                return result;
            });

            return documents;
        },
        'search',
        collectionName,
        {
            totalResults: snapshot?.size || 0,
            hasCustomQuery: true
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
