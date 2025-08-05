/**
 * 🔍 Sistema Avanzado de Query, Paginación y Filtros
 * 
 * Implementa características RESTful completas:
 * - Paginación cursor-based y offset-based
 * - Filtros dinámicos con operadores
 * - Ordenamiento múltiple
 * - Búsqueda de texto completo
 * - Selección de campos (field selection)
 * - Agregaciones básicas
 */

const { QUERY_CONSTANTS, SWAGGER_CONSTANTS } = require('../utils/messages.utils.js');
const { InternalServerError } = require('../utils/error.utils.js');

/**
 * Middleware principal de query processing
 */
const queryProcessor = (options = {}) => {
    const {
        allowedFilters = [],
        allowedSortFields = [],
        defaultSort = 'createdAt',
        defaultLimit = 10,
        maxLimit = 100,
        allowSearch = true,
        searchFields = [],
        enableCursor = true
    } = options;

    return (req, res, next) => {
        try {
            // 1. PAGINACIÓN
            const pagination = processPagination(req.query, defaultLimit, maxLimit, enableCursor);

            // 2. FILTROS
            const filters = processFilters(req.query, allowedFilters);

            // 3. ORDENAMIENTO
            const sorting = processSorting(req.query, allowedSortFields, defaultSort);

            // 4. BÚSQUEDA
            const search = processSearch(req.query, allowSearch, searchFields);

            // 5. SELECCIÓN DE CAMPOS
            const fieldSelection = processFieldSelection(req.query);

            // 6. AGREGACIONES
            const aggregations = processAggregations(req.query);

            // Adjuntar query procesado al request
            req.queryProcessor = {
                pagination,
                filters,
                sorting,
                search,
                fieldSelection,
                aggregations,
                originalQuery: req.query
            };

            // Middleware para respuestas enriquecidas
            enhanceResponse(res, req.queryProcessor);

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Procesar parámetros de paginación
 */
const processPagination = (query, defaultLimit, maxLimit, enableCursor) => {
    const pagination = {
        type: query.cursor && enableCursor ? 'cursor' : 'offset'
    };

    if (pagination.type === 'cursor') {
        // Paginación cursor-based (más eficiente para datasets grandes)
        pagination.cursor = query.cursor || null;
        pagination.limit = Math.min(parseInt(query.limit) || defaultLimit, maxLimit);
        pagination.direction = query.direction === 'prev' ? 'prev' : 'next';
    } else {
        // Paginación offset-based (más familiar)
        pagination.page = Math.max(parseInt(query.page) || 1, 1);
        pagination.limit = Math.min(parseInt(query.limit) || defaultLimit, maxLimit);
        pagination.offset = (pagination.page - 1) * pagination.limit;
    }

    return pagination;
};

/**
 * ===============================
 * FUNCIONES COMPARTIDAS (CORE)
 * ===============================
 */

/**
 * Mapa de operadores unificado
 */
const OPERATORS_MAP = {
    // Operadores de URL → Operadores de Firestore/Memoria
    eq: '==',
    ne: '!=', 
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    in: 'in',
    nin: 'not-in',
    contains: 'contains',
    startsWith: 'startsWith',
    endsWith: 'endsWith'
};

/**
 * Validar operador
 */
const isValidOperator = (operator) => {
    return Object.keys(OPERATORS_MAP).includes(operator);
};

/**
 * Convertir operador de URL a operador interno
 */
const mapOperator = (urlOperator) => {
    return OPERATORS_MAP[urlOperator] || '==';
};

/**
 * Parsear valores de filtros según el tipo - FUNCIÓN COMPARTIDA
 */
const parseFilterValue = (value, operator) => {
    // Arrays para operadores in/nin
    if (operator === 'in' || operator === 'nin') {
        return value.split(',').map(v => parseValue(v.trim()));
    }

    return parseValue(value);
};

/**
 * Parsear valor individual - FUNCIÓN COMPARTIDA
 */
const parseValue = (value) => {
    // Boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Null
    if (value === 'null') return null;

    // Number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
        return parseFloat(value);
    }

    // Date (formato ISO)
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return new Date(value);
    }

    // String
    return value;
};

/**
 * Aplicar operador a dos valores - FUNCIÓN COMPARTIDA
 */
const applyOperator = (fieldValue, operator, filterValue) => {
    switch (operator) {
        case '==':
            return fieldValue == filterValue;
        case '!=':
            return fieldValue != filterValue;
        case '>':
            return fieldValue > filterValue;
        case '>=':
            return fieldValue >= filterValue;
        case '<':
            return fieldValue < filterValue;
        case '<=':
            return fieldValue <= filterValue;
        case 'in':
            return Array.isArray(filterValue) && filterValue.includes(fieldValue);
        case 'not-in':
            return Array.isArray(filterValue) && !filterValue.includes(fieldValue);
        case 'contains':
            return typeof fieldValue === 'string' && typeof filterValue === 'string' && 
                   fieldValue.toLowerCase().includes(filterValue.toLowerCase());
        case 'startsWith':
            return typeof fieldValue === 'string' && typeof filterValue === 'string' && 
                   fieldValue.toLowerCase().startsWith(filterValue.toLowerCase());
        case 'endsWith':
            return typeof fieldValue === 'string' && typeof filterValue === 'string' && 
                   fieldValue.toLowerCase().endsWith(filterValue.toLowerCase());
        default:
            return true;
    }
};

/**
 * ===============================
 * MIDDLEWARE FUNCTIONS
 * ===============================
 */

/**
 * Procesar filtros dinámicos desde query params
 */
const processFilters = (query, allowedFilters) => {
    const filters = {};

    Object.keys(query).forEach(key => {
        // Buscar filtros con formato: campo[operador]=valor
        const filterMatch = key.match(/^(.+)\[(.+)\]$/);

        if (filterMatch) {
            const [, field, operator] = filterMatch;

            // Verificar si el campo está permitido
            if (!allowedFilters.includes(field)) return;

            // Verificar si el operador es válido
            if (!isValidOperator(operator)) return;

            const value = parseFilterValue(query[key], operator);

            if (!filters[field]) filters[field] = [];

            filters[field].push({
                operator: mapOperator(operator),
                value,
                originalOperator: operator
            });
        } else {
            // Filtros simples (asume equality)
            if (allowedFilters.includes(key)) {
                filters[key] = [{
                    operator: '==',
                    value: parseFilterValue(query[key], 'eq'),
                    originalOperator: 'eq'
                }];
            }
        }
    });

    return filters;
};

/**
 * Procesar ordenamiento
 */
const processSorting = (query, allowedSortFields, defaultSort) => {
    const sortParam = query.sort || defaultSort;
    const sorts = [];

    if (typeof sortParam === 'string') {
        const sortFields = sortParam.split(',');

        sortFields.forEach(field => {
            const trimmedField = field.trim();
            const isDesc = trimmedField.startsWith('-');
            const fieldName = isDesc ? trimmedField.substring(1) : trimmedField;

            // Verificar si el campo está permitido
            if (allowedSortFields.length === 0 || allowedSortFields.includes(fieldName)) {
                sorts.push({
                    field: fieldName,
                    direction: isDesc ? 'desc' : 'asc'
                });
            }
        });
    }

    // Si no hay ordenamiento válido, usar el default
    if (sorts.length === 0) {
        sorts.push({
            field: defaultSort,
            direction: 'desc'
        });
    }

    return sorts;
};

/**
 * Procesar búsqueda de texto
 */
const processSearch = (query, allowSearch, searchFields) => {
    if (!allowSearch || !query.search) return null;

    return {
        term: query.search.trim(),
        fields: searchFields.length > 0 ? searchFields : ['title', 'description'],
        caseSensitive: query.caseSensitive === 'true',
        exact: query.exact === 'true'
    };
};

/**
 * Procesar selección de campos
 */
const processFieldSelection = (query) => {
    if (!query.fields) return null;

    const fields = query.fields.split(',').map(f => f.trim()).filter(f => f);
    const exclude = query.exclude ?
        query.exclude.split(',').map(f => f.trim()) : [];

    return {
        include: fields,
        exclude,
        includeAll: fields.length === 0
    };
};

/**
 * Procesar agregaciones básicas
 */
const processAggregations = (query) => {
    const aggregations = {};

    if (query.count) {
        aggregations.count = query.count.split(',').map(f => f.trim());
    }

    if (query.sum) {
        aggregations.sum = query.sum.split(',').map(f => f.trim());
    }

    if (query.avg) {
        aggregations.avg = query.avg.split(',').map(f => f.trim());
    }

    if (query.min) {
        aggregations.min = query.min.split(',').map(f => f.trim());
    }

    if (query.max) {
        aggregations.max = query.max.split(',').map(f => f.trim());
    }

    return Object.keys(aggregations).length > 0 ? aggregations : null;
};

/**
 * Enriquecer respuesta con metadatos de query
 */
const enhanceResponse = (res, queryProcessor) => {
    const originalJson = res.json;

    res.json = function (data) {
        const enhancedResponse = {
            ...data,
            queryInfo: {
                pagination: queryProcessor.pagination,
                appliedFilters: Object.keys(queryProcessor.filters),
                appliedSort: queryProcessor.sorting,
                searchTerm: queryProcessor.search?.term || null,
                selectedFields: queryProcessor.fieldSelection?.include || null
            }
        };

        return originalJson.call(this, enhancedResponse);
    };
};

/**
 * Utility para aplicar filtros a consultas de Firestore
 */
const applyFiltersToFirestore = (query, filters) => {
    let firestoreQuery = query;

    Object.entries(filters).forEach(([field, filterArray]) => {
        filterArray.forEach(({ operator, value }) => {
            firestoreQuery = firestoreQuery.where(field, operator, value);
        });
    });

    return firestoreQuery;
};

/**
 * Utility para aplicar ordenamiento a consultas de Firestore
 */
const applySortingToFirestore = (query, sorting) => {
    let firestoreQuery = query;

    sorting.forEach(({ field, direction }) => {
        firestoreQuery = firestoreQuery.orderBy(field, direction);
    });

    return firestoreQuery;
};

/**
 * Middleware específico para productos
 */
const productsQueryProcessor = queryProcessor({
    allowedFilters: ['category', 'subcategory', 'price', 'outstanding', 'createdAt'],
    allowedSortFields: ['price', 'createdAt', 'title', 'outstanding'],
    defaultSort: 'createdAt',
    searchFields: ['title', 'description'],
    defaultLimit: 20,
    maxLimit: 50
});

/**
 * Middleware específico para categorías
 */
const categoriesQueryProcessor = queryProcessor({
    allowedFilters: ['isParent', 'parentCategoryId', 'createdAt'],
    allowedSortFields: ['title', 'createdAt'],
    defaultSort: 'createdAt',
    searchFields: ['title'],
    defaultLimit: 10,
    maxLimit: 100
});

/**
 * Middleware específico para subcategorías
 */
const subcategoriesQueryProcessor = queryProcessor({
    allowedFilters: ['parentCategoryId', 'createdAt'],
    allowedSortFields: ['title', 'createdAt'],
    defaultSort: 'createdAt',
    searchFields: ['title', 'text'],
    defaultLimit: 10,
    maxLimit: 100
});

/**
 * ===============================
 * UTILIDADES PARA PROCESAMIENTO EN MEMORIA
 * ===============================
 * Estas funciones procesan arrays de datos en memoria
 * para casos donde no se puede usar consultas de base de datos directas
 */

/**
 * Aplicar búsqueda por término en campos específicos - OPTIMIZADA
 * @param {Array} data - Array de datos para filtrar
 * @param {Object} searchConfig - Configuración de búsqueda {term, fields, caseSensitive, exact}
 * @returns {Array} - Datos filtrados
 */
const applySearch = (data, searchConfig) => {
    if (!searchConfig || !searchConfig.term || !searchConfig.fields) {
        return data;
    }

    const { term, fields, caseSensitive = false, exact = false } = searchConfig;
    const searchTerm = caseSensitive ? term : term.toLowerCase();

    return data.filter(item => {
        return fields.some(field => {
            const fieldValue = item[field];
            if (typeof fieldValue === 'string') {
                const processedValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
                
                if (exact) {
                    return processedValue === searchTerm;
                } else {
                    return processedValue.includes(searchTerm);
                }
            }
            return false;
        });
    });
};

/**
 * Aplicar ordenamiento a los datos - OPTIMIZADA
 * @param {Array} data - Array de datos para ordenar
 * @param {Array} sortingConfig - Configuración de ordenamiento [{field, direction}]
 * @returns {Array} - Datos ordenados
 */
const applySorting = (data, sortingConfig) => {
    if (!sortingConfig || !sortingConfig.length) {
        return data;
    }

    return [...data].sort((a, b) => {
        // Soporte para múltiples campos de ordenamiento
        for (const sort of sortingConfig) {
            if (!sort || !sort.field) continue;
            
            const aVal = a[sort.field];
            const bVal = b[sort.field];
            
            let comparison = 0;
            
            // Comparación inteligente por tipo
            if (aVal === null || aVal === undefined) {
                comparison = bVal === null || bVal === undefined ? 0 : -1;
            } else if (bVal === null || bVal === undefined) {
                comparison = 1;
            } else if (typeof aVal === 'string' && typeof bVal === 'string') {
                comparison = aVal.localeCompare(bVal);
            } else {
                comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            }
            
            if (comparison !== 0) {
                return sort.direction === 'desc' ? -comparison : comparison;
            }
        }
        return 0;
    });
};

/**
 * Aplicar paginación a los datos - OPTIMIZADA
 * @param {Array} data - Array de datos para paginar
 * @param {Object} paginationConfig - Configuración de paginación {page, limit, offset, type}
 * @returns {Array} - Datos paginados
 */
const applyPagination = (data, paginationConfig) => {
    if (!paginationConfig || !data.length) {
        return data;
    }

    const { page, limit, offset, type } = paginationConfig;

    // Validar límites
    if (!limit || limit <= 0) {
        return data;
    }

    // Paginación offset-based (más común para procesamiento en memoria)
    if (type === 'offset' || offset !== undefined) {
        const startIndex = offset || ((page - 1) * limit);
        const endIndex = startIndex + limit;
        return data.slice(startIndex, endIndex);
    }

    // Paginación simple por página
    if (page && page > 0) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return data.slice(startIndex, endIndex);
    }

    // Si solo hay límite, tomar los primeros N elementos
    return data.slice(0, limit);
};

/**
 * Aplicar filtros básicos a los datos - OPTIMIZADA
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
            filteredData = filteredData.filter(item => {
                const fieldValue = item[field];
                // Usar función compartida para aplicar operador
                return applyOperator(fieldValue, operator, value);
            });
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
    queryProcessor,
    productsQueryProcessor,
    categoriesQueryProcessor,
    subcategoriesQueryProcessor,
    applyFiltersToFirestore,
    applySortingToFirestore,
    // Utilidades para procesamiento en memoria
    processQuery,
    getQueryProcessingInfo,
    applySearch,
    applySorting,
    applyPagination,
    applyFilters
};
