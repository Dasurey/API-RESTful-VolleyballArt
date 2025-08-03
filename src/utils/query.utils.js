/**
 * Utilidades para procesamiento de consultas (búsqueda, ordenamiento, paginación)
 * Funciones reutilizables para evitar duplicación de código
 */

const { SYSTEM_MESSAGES } = require('./messages.utils.js');

/**
 * Aplicar búsqueda por término en campos específicos
 * @param {Array} data - Array de datos para filtrar
 * @param {Object} searchConfig - Configuración de búsqueda {term, fields}
 * @returns {Array} - Datos filtrados
 */
const applySearch = (data, searchConfig) => {
    if (!searchConfig || !searchConfig.term || !searchConfig.fields) {
        return data;
    }

    const searchTerm = searchConfig.term.toLowerCase();

    return data.filter(item => {
        return searchConfig.fields.some(field => {
            const fieldValue = item[field];
            if (typeof fieldValue === SYSTEM_MESSAGES.TYPE_STRING) {
                return fieldValue.toLowerCase().includes(searchTerm);
            }
            return false;
        });
    });
};

/**
 * Aplicar ordenamiento a los datos
 * @param {Array} data - Array de datos para ordenar
 * @param {Array} sortingConfig - Configuración de ordenamiento [{field, direction}]
 * @returns {Array} - Datos ordenados
 */
const applySorting = (data, sortingConfig) => {
    if (!sortingConfig || !sortingConfig.length) {
        return data;
    }

    // Usar solo el primer criterio de ordenamiento
    const sort = sortingConfig[0];
    if (!sort || !sort.field) {
        return data;
    }

    return [...data].sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];

        if (sort.direction === SYSTEM_MESSAGES.FIREBASE_ORDER_DESC) {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
    });
};

/**
 * Aplicar paginación a los datos
 * @param {Array} data - Array de datos para paginar
 * @param {Object} paginationConfig - Configuración de paginación {page, limit, offset}
 * @returns {Array} - Datos paginados
 */
const applyPagination = (data, paginationConfig) => {
    if (!paginationConfig) {
        return data;
    }

    const { page, limit, offset } = paginationConfig;

    if (offset !== undefined && limit) {
        return data.slice(offset, offset + limit);
    }

    return data;
};

/**
 * Aplicar filtros básicos a los datos
 * @param {Array} data - Array de datos para filtrar
 * @param {Object} filtersConfig - Configuración de filtros {field: [{operator, value}]}
 * @returns {Array} - Datos filtrados
 */
const applyFilters = (data, filtersConfig) => {
    if (!filtersConfig || Object.keys(filtersConfig).length === 0) {
        return data;
    }

    let filteredData = [...data];

    Object.entries(filtersConfig).forEach(([field, filterArray]) => {
        filterArray.forEach(({ operator, value }) => {
            if (field === SYSTEM_MESSAGES.PARENT_CATEGORY_ID_FIELD && operator === SYSTEM_MESSAGES.FIREBASE_EQUALITY_OPERATOR) {
                filteredData = filteredData.filter(item => item.parentCategoryId === value);
            }
            // Aquí se pueden agregar más tipos de filtros en el futuro
        });
    });

    return filteredData;
};

/**
 * Procesar consulta completa (búsqueda, filtros, ordenamiento, paginación)
 * @param {Array} data - Array de datos para procesar
 * @param {Object} queryProcessor - Configuración completa de la consulta
 * @returns {Array} - Datos procesados
 */
const processQuery = (data, queryProcessor) => {
    if (!queryProcessor) {
        return data;
    }

    let processedData = [...data];

    // 1. Aplicar búsqueda
    if (queryProcessor.search) {
        processedData = applySearch(processedData, queryProcessor.search);
    }

    // 2. Aplicar filtros
    if (queryProcessor.filters) {
        processedData = applyFilters(processedData, queryProcessor.filters);
    }

    // 3. Aplicar ordenamiento
    if (queryProcessor.sorting) {
        processedData = applySorting(processedData, queryProcessor.sorting);
    }

    // 4. Aplicar paginación
    if (queryProcessor.pagination) {
        processedData = applyPagination(processedData, queryProcessor.pagination);
    }

    return processedData;
};

/**
 * Generar información de estado de procesamiento de consulta
 * @param {Object} queryProcessor - Configuración de la consulta
 * @returns {Object} - Estado del procesamiento
 */
const getQueryProcessingInfo = (queryProcessor) => {
    if (!queryProcessor) {
        return {
            searchApplied: false,
            filtersApplied: false,
            sortingApplied: false,
            paginationApplied: false
        };
    }

    return {
        searchApplied: !!(queryProcessor.search && queryProcessor.search.term),
        filtersApplied: !!(queryProcessor.filters && Object.keys(queryProcessor.filters).length > 0),
        sortingApplied: !!(queryProcessor.sorting && queryProcessor.sorting.length > 0),
        paginationApplied: !!(queryProcessor.pagination)
    };
};

module.exports = {
    applySearch,
    applySorting,
    applyPagination,
    applyFilters,
    processQuery,
    getQueryProcessingInfo
};
