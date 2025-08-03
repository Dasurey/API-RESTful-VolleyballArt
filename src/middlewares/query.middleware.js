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
const { QUERY_PROCESSING } = require('../config/paths.config.js');

/**
 * Middleware principal de query processing
 */
const queryProcessor = (options = {}) => {
    const {
        allowedFilters = [],
        allowedSortFields = [],
        defaultSort = QUERY_CONSTANTS.DEFAULT_CONFIGS.PRODUCTS.SORT,
        defaultLimit = QUERY_CONSTANTS.LIMITS.DEFAULT,
        maxLimit = QUERY_CONSTANTS.LIMITS.MAX_GENERAL,
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
        type: query.cursor && enableCursor ?
            QUERY_CONSTANTS.PAGINATION_TYPES.CURSOR :
            QUERY_CONSTANTS.PAGINATION_TYPES.OFFSET
    };

    if (pagination.type === QUERY_CONSTANTS.PAGINATION_TYPES.CURSOR) {
        // Paginación cursor-based (más eficiente para datasets grandes)
        pagination.cursor = query.cursor || null;
        pagination.limit = Math.min(parseInt(query.limit) || defaultLimit, maxLimit);
        pagination.direction = query.direction === QUERY_CONSTANTS.PAGINATION_DIRECTIONS.PREV ?
            QUERY_CONSTANTS.PAGINATION_DIRECTIONS.PREV :
            QUERY_CONSTANTS.PAGINATION_DIRECTIONS.NEXT;
    } else {
        // Paginación offset-based (más familiar)
        pagination.page = Math.max(parseInt(query.page) || 1, 1);
        pagination.limit = Math.min(parseInt(query.limit) || defaultLimit, maxLimit);
        pagination.offset = (pagination.page - 1) * pagination.limit;
    }

    return pagination;
};

/**
 * Procesar filtros dinámicos
 */
const processFilters = (query, allowedFilters) => {
    const filters = {};
    const operators = QUERY_PROCESSING.OPERATOR_MAPPINGS;

    Object.keys(query).forEach(key => {
        // Buscar filtros con formato: campo[operador]=valor
        const filterMatch = key.match(QUERY_CONSTANTS.PATTERNS.FILTER_BRACKET);

        if (filterMatch) {
            const [, field, operator] = filterMatch;

            // Verificar si el campo está permitido
            if (!allowedFilters.includes(field)) return;

            // Verificar si el operador es válido
            if (!operators[operator]) return;

            const value = parseFilterValue(query[key], operator);

            if (!filters[field]) filters[field] = [];

            filters[field].push({
                operator: operators[operator],
                value,
                originalOperator: operator
            });
        } else {
            // Filtros simples (asume equality)
            if (allowedFilters.includes(key)) {
                filters[key] = [{
                    operator: QUERY_CONSTANTS.FIRESTORE_OPERATORS.EQ,
                    value: parseFilterValue(query[key], QUERY_CONSTANTS.OPERATORS.EQ),
                    originalOperator: QUERY_CONSTANTS.OPERATORS.EQ
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

    if (typeof sortParam === SWAGGER_CONSTANTS.TYPE_STRING) {
        const sortFields = sortParam.split(QUERY_CONSTANTS.SEPARATORS.SORT);

        sortFields.forEach(field => {
            const trimmedField = field.trim();
            const isDesc = trimmedField.startsWith(QUERY_CONSTANTS.PREFIXES.DESC_SORT);
            const fieldName = isDesc ? trimmedField.substring(1) : trimmedField;

            // Verificar si el campo está permitido
            if (allowedSortFields.length === 0 || allowedSortFields.includes(fieldName)) {
                sorts.push({
                    field: fieldName,
                    direction: isDesc ? QUERY_CONSTANTS.SORT_DIRECTIONS.DESC : QUERY_CONSTANTS.SORT_DIRECTIONS.ASC
                });
            }
        });
    }

    // Si no hay ordenamiento válido, usar el default
    if (sorts.length === 0) {
        sorts.push({
            field: defaultSort,
            direction: QUERY_CONSTANTS.SORT_DIRECTIONS.DESC
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
        fields: searchFields.length > 0 ? searchFields : QUERY_CONSTANTS.DEFAULT_SEARCH_FIELDS.PRODUCTS,
        caseSensitive: query.caseSensitive === QUERY_CONSTANTS.SPECIAL_VALUES.TRUE,
        exact: query.exact === QUERY_CONSTANTS.SPECIAL_VALUES.TRUE
    };
};

/**
 * Procesar selección de campos
 */
const processFieldSelection = (query) => {
    if (!query.fields) return null;

    const fields = query.fields.split(QUERY_CONSTANTS.SEPARATORS.FIELD).map(f => f.trim()).filter(f => f);
    const exclude = query.exclude ?
        query.exclude.split(QUERY_CONSTANTS.SEPARATORS.FIELD).map(f => f.trim()) : [];

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
        aggregations.count = query.count.split(QUERY_CONSTANTS.SEPARATORS.FIELD).map(f => f.trim());
    }

    if (query.sum) {
        aggregations.sum = query.sum.split(QUERY_CONSTANTS.SEPARATORS.FIELD).map(f => f.trim());
    }

    if (query.avg) {
        aggregations.avg = query.avg.split(QUERY_CONSTANTS.SEPARATORS.FIELD).map(f => f.trim());
    }

    if (query.min) {
        aggregations.min = query.min.split(QUERY_CONSTANTS.SEPARATORS.FIELD).map(f => f.trim());
    }

    if (query.max) {
        aggregations.max = query.max.split(QUERY_CONSTANTS.SEPARATORS.FIELD).map(f => f.trim());
    }

    return Object.keys(aggregations).length > 0 ? aggregations : null;
};

/**
 * Parsear valores de filtros según el tipo
 */
const parseFilterValue = (value, operator) => {
    // Arrays para operadores in/nin
    if (operator === QUERY_CONSTANTS.OPERATORS.IN || operator === QUERY_CONSTANTS.OPERATORS.NIN) {
        return value.split(QUERY_CONSTANTS.SEPARATORS.FILTER).map(v => parseValue(v.trim()));
    }

    return parseValue(value);
};

/**
 * Parsear valor individual
 */
const parseValue = (value) => {
    // Boolean
    if (value === QUERY_CONSTANTS.SPECIAL_VALUES.TRUE) return true;
    if (value === QUERY_CONSTANTS.SPECIAL_VALUES.FALSE) return false;

    // Null
    if (value === QUERY_CONSTANTS.SPECIAL_VALUES.NULL) return null;

    // Number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
        return parseFloat(value);
    }

    // Date (formato ISO)
    if (value.match(QUERY_CONSTANTS.PATTERNS.ISO_DATE)) {
        return new Date(value);
    }

    // String
    return value;
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
    allowedFilters: QUERY_CONSTANTS.ALLOWED_FIELDS.PRODUCTS.FILTERS,
    allowedSortFields: QUERY_CONSTANTS.ALLOWED_FIELDS.PRODUCTS.SORT,
    defaultSort: QUERY_CONSTANTS.DEFAULT_CONFIGS.PRODUCTS.SORT,
    searchFields: QUERY_CONSTANTS.DEFAULT_SEARCH_FIELDS.PRODUCTS,
    defaultLimit: 20,
    maxLimit: 50
});

/**
 * Middleware específico para categorías
 */
const categoriesQueryProcessor = queryProcessor({
    allowedFilters: QUERY_CONSTANTS.ALLOWED_FIELDS.CATEGORIES.FILTERS,
    allowedSortFields: QUERY_CONSTANTS.ALLOWED_FIELDS.CATEGORIES.SORT,
    defaultSort: QUERY_CONSTANTS.DEFAULT_CONFIGS.CATEGORIES.SORT,
    searchFields: QUERY_CONSTANTS.DEFAULT_SEARCH_FIELDS.CATEGORIES,
    defaultLimit: 10,
    maxLimit: 100
});

/**
 * Middleware específico para subcategorías
 */
const subcategoriesQueryProcessor = queryProcessor({
    allowedFilters: QUERY_CONSTANTS.ALLOWED_FIELDS.SUBCATEGORIES.FILTERS,
    allowedSortFields: QUERY_CONSTANTS.ALLOWED_FIELDS.SUBCATEGORIES.SORT,
    defaultSort: QUERY_CONSTANTS.DEFAULT_CONFIGS.SUBCATEGORIES.SORT,
    searchFields: QUERY_CONSTANTS.DEFAULT_SEARCH_FIELDS.SUBCATEGORIES,
    defaultLimit: 10,
    maxLimit: 100
});

module.exports = {
    queryProcessor,
    productsQueryProcessor,
    categoriesQueryProcessor,
    subcategoriesQueryProcessor,
    applyFiltersToFirestore,
    applySortingToFirestore
};
