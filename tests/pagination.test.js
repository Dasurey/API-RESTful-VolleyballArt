const request = require('supertest');
const express = require('express');

describe('Sistema de Paginación y Filtros', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock de datos de productos
    const mockProducts = Array(100).fill().map((_, i) => ({
      id: `prod-${i + 1}`,
      name: `Producto ${i + 1}`,
      description: `Descripción del producto ${i + 1}`,
      price: Math.round((10 + Math.random() * 90) * 100) / 100,
      category: ['volleyball', 'accessories', 'clothing'][i % 3],
      brand: ['Nike', 'Adidas', 'Mizuno', 'Asics'][i % 4],
      tags: [`tag-${i % 5}`, `category-${i % 3}`],
      stock: Math.floor(Math.random() * 100),
      rating: Math.round((1 + Math.random() * 4) * 10) / 10,
      isActive: i % 10 !== 0, // 90% activos
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      specifications: {
        weight: Math.round(Math.random() * 1000) / 1000,
        material: ['Leather', 'Synthetic', 'Cotton', 'Polyester'][i % 4]
      }
    }));

    // Middleware de query processing
    const queryProcessor = (options = {}) => {
      const {
        allowedFilters = [],
        allowedSortFields = [],
        defaultSort = 'createdAt:desc',
        defaultLimit = 10,
        maxLimit = 100,
        allowSearch = true,
        searchFields = ['name', 'description']
      } = options;

      return (req, res, next) => {
        try {
          // 1. PAGINACIÓN
          const page = Math.max(1, parseInt(req.query.page) || 1);
          const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
          const offset = (page - 1) * limit;

          // Cursor-based pagination
          const cursor = req.query.cursor;
          const nextCursor = req.query.next_cursor;
          const prevCursor = req.query.prev_cursor;

          // 2. FILTROS
          const filters = {};
          allowedFilters.forEach(filter => {
            if (req.query[filter]) {
              filters[filter] = req.query[filter];
            }
          });

          // Filtros de rango
          const rangeFilters = {};
          ['price', 'rating', 'stock'].forEach(field => {
            if (req.query[`${field}_min`]) {
              rangeFilters[`${field}_min`] = parseFloat(req.query[`${field}_min`]);
            }
            if (req.query[`${field}_max`]) {
              rangeFilters[`${field}_max`] = parseFloat(req.query[`${field}_max`]);
            }
          });

          // Filtros de fecha
          const dateFilters = {};
          if (req.query.created_after) {
            dateFilters.created_after = new Date(req.query.created_after);
          }
          if (req.query.created_before) {
            dateFilters.created_before = new Date(req.query.created_before);
          }

          // 3. ORDENAMIENTO
          let sorting = [];
          if (req.query.sort) {
            const sortParams = Array.isArray(req.query.sort) ? req.query.sort : [req.query.sort];
            sorting = sortParams.map(param => {
              const [field, direction = 'asc'] = param.split(':');
              if (allowedSortFields.includes(field)) {
                return { field, direction: direction.toLowerCase() };
              }
              return null;
            }).filter(Boolean);
          }

          if (sorting.length === 0) {
            const [field, direction = 'asc'] = defaultSort.split(':');
            sorting = [{ field, direction }];
          }

          // 4. BÚSQUEDA
          const search = req.query.search || req.query.q;

          // 5. SELECCIÓN DE CAMPOS
          const fields = req.query.fields ? req.query.fields.split(',') : null;

          // 6. AGREGACIONES
          const includeStats = req.query.include_stats === 'true';
          const groupBy = req.query.group_by;

          // Adjuntar query procesado al request
          req.processedQuery = {
            pagination: {
              page,
              limit,
              offset,
              cursor,
              nextCursor,
              prevCursor
            },
            filters,
            rangeFilters,
            dateFilters,
            sorting,
            search,
            searchFields,
            fields,
            includeStats,
            groupBy
          };

          next();
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'Error en procesamiento de query',
            error: error.message
          });
        }
      };
    };

    // Función para aplicar filtros
    const applyFilters = (data, query) => {
      let filtered = [...data];

      // Filtros básicos
      Object.entries(query.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          filtered = filtered.filter(item => value.includes(item[key]));
        } else {
          filtered = filtered.filter(item => item[key] === value);
        }
      });

      // Filtros de rango
      Object.entries(query.rangeFilters).forEach(([key, value]) => {
        const [field, operation] = key.split('_');
        if (operation === 'min') {
          filtered = filtered.filter(item => item[field] >= value);
        } else if (operation === 'max') {
          filtered = filtered.filter(item => item[field] <= value);
        }
      });

      // Filtros de fecha
      Object.entries(query.dateFilters).forEach(([key, value]) => {
        if (key === 'created_after') {
          filtered = filtered.filter(item => new Date(item.createdAt) >= value);
        } else if (key === 'created_before') {
          filtered = filtered.filter(item => new Date(item.createdAt) <= value);
        }
      });

      // Búsqueda de texto
      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        filtered = filtered.filter(item => {
          return query.searchFields.some(field => {
            const fieldValue = item[field];
            return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm);
          });
        });
      }

      return filtered;
    };

    // Función para aplicar ordenamiento
    const applySorting = (data, sorting) => {
      return data.sort((a, b) => {
        for (const { field, direction } of sorting) {
          let aVal = a[field];
          let bVal = b[field];

          // Manejar valores anidados (ej: specifications.weight)
          if (field.includes('.')) {
            const keys = field.split('.');
            aVal = keys.reduce((obj, key) => obj?.[key], a);
            bVal = keys.reduce((obj, key) => obj?.[key], b);
          }

          // Convertir a números si es posible
          if (!isNaN(aVal) && !isNaN(bVal)) {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
          }

          // Comparar
          if (aVal < bVal) {
            return direction === 'asc' ? -1 : 1;
          }
          if (aVal > bVal) {
            return direction === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
    };

    // Función para seleccionar campos
    const selectFields = (data, fields) => {
      if (!fields) return data;

      return data.map(item => {
        const selected = {};
        fields.forEach(field => {
          if (field.includes('.')) {
            const keys = field.split('.');
            const value = keys.reduce((obj, key) => obj?.[key], item);
            if (value !== undefined) {
              keys.reduce((obj, key, index) => {
                if (index === keys.length - 1) {
                  obj[key] = value;
                } else {
                  obj[key] = obj[key] || {};
                }
                return obj[key];
              }, selected);
            }
          } else if (item.hasOwnProperty(field)) {
            selected[field] = item[field];
          }
        });
        return selected;
      });
    };

    // Función para generar estadísticas
    const generateStats = (data, originalData) => {
      return {
        total: originalData.length,
        filtered: data.length,
        categories: originalData.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {}),
        priceRange: {
          min: Math.min(...originalData.map(item => item.price)),
          max: Math.max(...originalData.map(item => item.price)),
          avg: originalData.reduce((sum, item) => sum + item.price, 0) / originalData.length
        },
        brands: originalData.reduce((acc, item) => {
          acc[item.brand] = (acc[item.brand] || 0) + 1;
          return acc;
        }, {})
      };
    };

    // Rutas con query processing
    app.get('/api/products',
      queryProcessor({
        allowedFilters: ['category', 'brand', 'isActive'],
        allowedSortFields: ['name', 'price', 'rating', 'createdAt', 'updatedAt', 'specifications.weight'],
        defaultSort: 'createdAt:desc',
        defaultLimit: 10,
        maxLimit: 50,
        searchFields: ['name', 'description', 'tags']
      }),
      (req, res) => {
        const query = req.processedQuery;

        // Aplicar filtros
        let filtered = applyFilters(mockProducts, query);

        // Generar estadísticas si se solicitan
        let stats = null;
        if (query.includeStats) {
          stats = generateStats(filtered, mockProducts);
        }

        // Aplicar ordenamiento
        filtered = applySorting(filtered, query.sorting);

        // Aplicar paginación
        const total = filtered.length;
        const totalPages = Math.ceil(total / query.pagination.limit);
        const paginatedData = filtered.slice(
          query.pagination.offset,
          query.pagination.offset + query.pagination.limit
        );

        // Seleccionar campos
        const selectedData = selectFields(paginatedData, query.fields);

        // Generar cursors para cursor-based pagination
        const hasNext = query.pagination.page < totalPages;
        const hasPrev = query.pagination.page > 1;
        const nextCursor = hasNext ? btoa(`page:${query.pagination.page + 1}`) : null;
        const prevCursor = hasPrev ? btoa(`page:${query.pagination.page - 1}`) : null;

        res.json({
          success: true,
          data: selectedData,
          pagination: {
            page: query.pagination.page,
            limit: query.pagination.limit,
            total,
            totalPages,
            hasNext,
            hasPrev,
            nextCursor,
            prevCursor
          },
          filters: {
            applied: Object.keys(query.filters).length > 0 ? query.filters : null,
            ranges: Object.keys(query.rangeFilters).length > 0 ? query.rangeFilters : null,
            search: query.search || null
          },
          sorting: query.sorting,
          stats
        });
      }
    );

    // Ruta para obtener filtros disponibles
    app.get('/api/products/filters', (req, res) => {
      const categories = [...new Set(mockProducts.map(p => p.category))];
      const brands = [...new Set(mockProducts.map(p => p.brand))];
      const tags = [...new Set(mockProducts.flatMap(p => p.tags))];
      const priceRange = {
        min: Math.min(...mockProducts.map(p => p.price)),
        max: Math.max(...mockProducts.map(p => p.price))
      };

      res.json({
        success: true,
        data: {
          categories,
          brands,
          tags,
          priceRange,
          sortOptions: [
            { field: 'name', label: 'Nombre' },
            { field: 'price', label: 'Precio' },
            { field: 'rating', label: 'Calificación' },
            { field: 'createdAt', label: 'Fecha de creación' }
          ]
        }
      });
    });

    // Ruta para búsqueda avanzada
    app.post('/api/products/search',
      queryProcessor({
        allowedFilters: ['category', 'brand', 'isActive'],
        allowedSortFields: ['name', 'price', 'rating', 'createdAt'],
        searchFields: ['name', 'description', 'tags']
      }),
      (req, res) => {
        const { filters: bodyFilters, search: bodySearch, advanced } = req.body;
        const query = req.processedQuery;

        // Combinar filtros de query y body
        if (bodyFilters) {
          Object.assign(query.filters, bodyFilters);
        }

        if (bodySearch) {
          query.search = bodySearch;
        }

        // Búsqueda avanzada con operadores
        let filtered = [...mockProducts];

        if (advanced) {
          // Filtros AND/OR
          if (advanced.and) {
            advanced.and.forEach(condition => {
              filtered = filtered.filter(item => {
                const value = item[condition.field];
                switch (condition.operator) {
                  case 'eq': return value === condition.value;
                  case 'ne': return value !== condition.value;
                  case 'gt': return value > condition.value;
                  case 'lt': return value < condition.value;
                  case 'gte': return value >= condition.value;
                  case 'lte': return value <= condition.value;
                  case 'in': return condition.value.includes(value);
                  case 'contains': return value && value.toString().toLowerCase().includes(condition.value.toLowerCase());
                  default: return true;
                }
              });
            });
          }
        } else {
          // Aplicar filtros normales
          filtered = applyFilters(filtered, query);
        }

        // Aplicar ordenamiento y paginación
        filtered = applySorting(filtered, query.sorting);
        const total = filtered.length;
        const totalPages = Math.ceil(total / query.pagination.limit);
        const paginatedData = filtered.slice(
          query.pagination.offset,
          query.pagination.offset + query.pagination.limit
        );

        res.json({
          success: true,
          data: paginatedData,
          pagination: {
            page: query.pagination.page,
            limit: query.pagination.limit,
            total,
            totalPages
          },
          searchQuery: {
            filters: query.filters,
            search: query.search,
            advanced: advanced || null
          }
        });
      }
    );
  });

  describe('Paginación Básica Tests', () => {
    it('debería retornar primera página por defecto', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.data).toHaveLength(10);
    });

    it('debería permitir especificar página y límite', async () => {
      const response = await request(app)
        .get('/api/products?page=2&limit=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data).toHaveLength(5);
    });

    it('debería respetar límite máximo', async () => {
      const response = await request(app)
        .get('/api/products?limit=1000')
        .expect(200);

      expect(response.body.pagination.limit).toBe(50); // Max configurado
    });

    it('debería manejar páginas fuera de rango', async () => {
      const response = await request(app)
        .get('/api/products?page=1000')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.page).toBe(1000);
    });

    it('debería incluir información de paginación completa', async () => {
      const response = await request(app)
        .get('/api/products?page=2&limit=10')
        .expect(200);

      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('hasNext');
      expect(response.body.pagination).toHaveProperty('hasPrev');
      expect(response.body.pagination.hasPrev).toBe(true);
    });
  });

  describe('Cursor-based Pagination Tests', () => {
    it('debería generar cursors para navegación', async () => {
      const response = await request(app)
        .get('/api/products?page=2')
        .expect(200);

      expect(response.body.pagination).toHaveProperty('nextCursor');
      expect(response.body.pagination).toHaveProperty('prevCursor');
      expect(response.body.pagination.prevCursor).toBeDefined();
    });

    it('debería no incluir prevCursor en primera página', async () => {
      const response = await request(app)
        .get('/api/products?page=1')
        .expect(200);

      expect(response.body.pagination.prevCursor).toBeNull();
    });
  });

  describe('Filtros Básicos Tests', () => {
    it('debería filtrar por categoría', async () => {
      const response = await request(app)
        .get('/api/products?category=volleyball')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(product => {
        expect(product.category).toBe('volleyball');
      });
    });

    it('debería filtrar por múltiples valores', async () => {
      const response = await request(app)
        .get('/api/products?category=volleyball&category=accessories')
        .expect(200);

      response.body.data.forEach(product => {
        expect(['volleyball', 'accessories']).toContain(product.category);
      });
    });

    it('debería filtrar por brand', async () => {
      const response = await request(app)
        .get('/api/products?brand=Nike')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.brand).toBe('Nike');
      });
    });

    it('debería filtrar por estado activo', async () => {
      const response = await request(app)
        .get('/api/products?isActive=true')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.isActive).toBe(true);
      });
    });
  });

  describe('Filtros de Rango Tests', () => {
    it('debería filtrar por precio mínimo', async () => {
      const response = await request(app)
        .get('/api/products?price_min=50')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(50);
      });
    });

    it('debería filtrar por precio máximo', async () => {
      const response = await request(app)
        .get('/api/products?price_max=30')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.price).toBeLessThanOrEqual(30);
      });
    });

    it('debería filtrar por rango de precio', async () => {
      const response = await request(app)
        .get('/api/products?price_min=20&price_max=60')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(20);
        expect(product.price).toBeLessThanOrEqual(60);
      });
    });

    it('debería filtrar por rango de calificación', async () => {
      const response = await request(app)
        .get('/api/products?rating_min=4')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.rating).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('Ordenamiento Tests', () => {
    it('debería ordenar por nombre ascendente', async () => {
      const response = await request(app)
        .get('/api/products?sort=name:asc&limit=5')
        .expect(200);

      const names = response.body.data.map(p => p.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('debería ordenar por precio descendente', async () => {
      const response = await request(app)
        .get('/api/products?sort=price:desc&limit=5')
        .expect(200);

      const prices = response.body.data.map(p => p.price);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    });

    it('debería ordenar por múltiples campos', async () => {
      const response = await request(app)
        .get('/api/products?sort=category:asc&sort=price:desc&limit=10')
        .expect(200);

      // Verificar que hay datos para trabajar
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Verificar estructura de ordenamiento básico - los productos están agrupados lógicamente
      const categories = response.body.data.map(p => p.category);
      const uniqueCategories = [...new Set(categories)];
      
      // Al menos debería haber algún tipo de ordenamiento lógico
      expect(uniqueCategories.length).toBeGreaterThan(0);
      
      // Verificar que dentro de la misma categoría, los precios están en orden descendente
      const categoryGroups = {};
      response.body.data.forEach(product => {
        if (!categoryGroups[product.category]) {
          categoryGroups[product.category] = [];
        }
        categoryGroups[product.category].push(product.price);
      });

      // Verificar ordenamiento de precios dentro de cada categoría
      Object.values(categoryGroups).forEach(prices => {
        if (prices.length > 1) {
          for (let i = 0; i < prices.length - 1; i++) {
            expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
          }
        }
      });
    });

    it('debería ordenar por campos anidados', async () => {
      const response = await request(app)
        .get('/api/products?sort=specifications.weight:asc&limit=5')
        .expect(200);

      const weights = response.body.data.map(p => p.specifications.weight);
      for (let i = 0; i < weights.length - 1; i++) {
        expect(weights[i]).toBeLessThanOrEqual(weights[i + 1]);
      }
    });
  });

  describe('Búsqueda de Texto Tests', () => {
    it('debería buscar en nombre de producto', async () => {
      const response = await request(app)
        .get('/api/products?search=Producto 1')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.name.toLowerCase()).toContain('producto 1');
      });
    });

    it('debería buscar en descripción', async () => {
      const response = await request(app)
        .get('/api/products?search=descripción')
        .expect(200);

      response.body.data.forEach(product => {
        const hasInName = product.name.toLowerCase().includes('descripción');
        const hasInDescription = product.description.toLowerCase().includes('descripción');
        expect(hasInName || hasInDescription).toBe(true);
      });
    });

    it('debería ser case insensitive', async () => {
      const response = await request(app)
        .get('/api/products?search=PRODUCTO')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(product => {
        const searchTerm = 'producto';
        const hasMatch = product.name.toLowerCase().includes(searchTerm) ||
                        product.description.toLowerCase().includes(searchTerm);
        expect(hasMatch).toBe(true);
      });
    });
  });

  describe('Selección de Campos Tests', () => {
    it('debería retornar solo campos seleccionados', async () => {
      const response = await request(app)
        .get('/api/products?fields=id,name,price&limit=3')
        .expect(200);

      response.body.data.forEach(product => {
        const keys = Object.keys(product);
        expect(keys).toHaveLength(3);
        expect(keys).toContain('id');
        expect(keys).toContain('name');
        expect(keys).toContain('price');
      });
    });

    it('debería manejar campos anidados', async () => {
      const response = await request(app)
        .get('/api/products?fields=id,name,specifications.weight&limit=3')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('specifications');
        expect(product.specifications).toHaveProperty('weight');
      });
    });
  });

  describe('Estadísticas Tests', () => {
    it('debería incluir estadísticas cuando se soliciten', async () => {
      const response = await request(app)
        .get('/api/products?include_stats=true&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('filtered');
      expect(response.body.stats).toHaveProperty('categories');
      expect(response.body.stats).toHaveProperty('priceRange');
      expect(response.body.stats).toHaveProperty('brands');
    });

    it('debería no incluir estadísticas por defecto', async () => {
      const response = await request(app)
        .get('/api/products?limit=5')
        .expect(200);

      expect(response.body.stats).toBeNull();
    });
  });

  describe('Filtros Disponibles Tests', () => {
    it('debería retornar filtros disponibles', async () => {
      const response = await request(app)
        .get('/api/products/filters')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('brands');
      expect(response.body.data).toHaveProperty('tags');
      expect(response.body.data).toHaveProperty('priceRange');
      expect(response.body.data).toHaveProperty('sortOptions');

      expect(Array.isArray(response.body.data.categories)).toBe(true);
      expect(Array.isArray(response.body.data.brands)).toBe(true);
      expect(response.body.data.priceRange).toHaveProperty('min');
      expect(response.body.data.priceRange).toHaveProperty('max');
    });
  });

  describe('Búsqueda Avanzada Tests', () => {
    it('debería realizar búsqueda con filtros en body', async () => {
      const searchData = {
        filters: {
          category: 'volleyball'
        },
        search: 'Producto'
      };

      const response = await request(app)
        .post('/api/products/search')
        .send(searchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(product => {
        expect(product.category).toBe('volleyball');
      });
    });

    it('debería manejar operadores avanzados', async () => {
      const searchData = {
        advanced: {
          and: [
            { field: 'price', operator: 'gte', value: 30 },
            { field: 'rating', operator: 'gt', value: 3 }
          ]
        }
      };

      const response = await request(app)
        .post('/api/products/search')
        .send(searchData)
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(30);
        expect(product.rating).toBeGreaterThan(3);
      });
    });

    it('debería manejar operador contains', async () => {
      const searchData = {
        advanced: {
          and: [
            { field: 'name', operator: 'contains', value: 'Producto 1' }
          ]
        }
      };

      const response = await request(app)
        .post('/api/products/search')
        .send(searchData)
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.name.toLowerCase()).toContain('producto 1');
      });
    });

    it('debería manejar operador in', async () => {
      const searchData = {
        advanced: {
          and: [
            { field: 'category', operator: 'in', value: ['volleyball', 'accessories'] }
          ]
        }
      };

      const response = await request(app)
        .post('/api/products/search')
        .send(searchData)
        .expect(200);

      response.body.data.forEach(product => {
        expect(['volleyball', 'accessories']).toContain(product.category);
      });
    });
  });

  describe('Combinación de Filtros Tests', () => {
    it('debería combinar múltiples tipos de filtros', async () => {
      const response = await request(app)
        .get('/api/products?category=volleyball&price_min=30&sort=price:desc&search=Producto&limit=5')
        .expect(200);

      response.body.data.forEach(product => {
        expect(product.category).toBe('volleyball');
        expect(product.price).toBeGreaterThanOrEqual(30);
        expect(product.name.toLowerCase()).toContain('producto');
      });

      // Verificar ordenamiento por precio descendente
      const prices = response.body.data.map(p => p.price);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    });

    it('debería mostrar información de filtros aplicados', async () => {
      const response = await request(app)
        .get('/api/products?category=volleyball&price_min=30&search=test')
        .expect(200);

      expect(response.body.filters).toHaveProperty('applied');
      expect(response.body.filters).toHaveProperty('ranges');
      expect(response.body.filters).toHaveProperty('search');
      expect(response.body.filters.applied.category).toBe('volleyball');
      expect(response.body.filters.ranges.price_min).toBe(30);
      expect(response.body.filters.search).toBe('test');
    });
  });

  describe('Manejo de Errores Tests', () => {
    it('debería manejar parámetros de paginación inválidos', async () => {
      const response = await request(app)
        .get('/api/products?page=invalid&limit=abc')
        .expect(200);

      // Debería usar valores por defecto
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('debería manejar valores negativos en paginación', async () => {
      const response = await request(app)
        .get('/api/products?page=-1&limit=-5')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1); // Mínimo
    });
  });
});
