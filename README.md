# 🎓 Proyecto Integrador - Backend con Node.js, Express y Firebase

Este proyecto fue desarrollado como parte del **programa Talento Tech** en la especialización de **Back End con Node.js**. Consiste en la construcción de una API RESTful capaz de gestionar productos y autenticar usuarios mediante tokens JWT, con persistencia en **Firebase Firestore** y despliegue en **Vercel**.

---

## ✅ Requerimientos implementados

### 1. Configuración Inicial
- Creé un directorio para alojar el proyecto con un archivo `index.js` como punto de entrada.
- Inicialicé Node.js con `npm init -y`.
- Agregué `"type": "module"` al `package.json` para habilitar ESModules.
- Definí un script llamado `start` para ejecutar el servidor con `npm run start`.

### 2. Instalación de dependencias
Instalé las siguientes dependencias necesarias para el desarrollo del backend:
``` npm install express cors dotenv firebase jsonwebtoken ```

### 3. Configuración del servidor
- Configuré Express en index.js para crear el servidor y para interpretar JSON en los cuerpos de las peticiones.
- Habilité CORS para permitir peticiones desde orígenes externos.
- Agregué un middleware global para manejar rutas desconocidas con estado 404.
- Incorporé un archivo .env para gestionar variables de entorno sensibles.

### 4. Rutas
Dividí las rutas en dos archivos principales: <br>
```products.routes.js```
- ``` GET /api/products``` Lista todos los productos.
- ``` GET /api/products/:id``` Devuelve un producto por ID.
- ``` POST /api/products/create``` Crea un nuevo producto.
- ``` PUT /api/products/:id``` Actualiza un producto por ID.
- ``` DELETE /api/products/:id``` Elimina un producto por ID.


```auth.routes.js ```
- ``` POST /auth/login``` Recibe credenciales y devuelve un token JWT si son válidas.

### 5. Controladores y Servicios
- Implementé una capa de controladores que maneja la lógica de las rutas.
- Separé la lógica de negocio en una capa de servicios, para una mejor organización y reutilización del código.

### 6. Acceso a los datos
- Creé un proyecto en Firebase Firestore y configuré una colección para los productos.
- Añadí un documento inicial para definir la estructura y tipos de datos.
- Escribí funciones en la capa de modelos para interactuar con la base de datos.
- Enlacé los modelos con los servicios para completar el flujo de datos.

### 7. Protección de rutas
- Configuré JWT en el proyecto.
- Implementé un middleware que protege rutas sensibles.
- En el controlador de login, validé credenciales y devolví un Bearer Token si son válidas.

### 8. Despliegue a producción
- Configuré el archivo vercel.json.
- Subí el proyecto a Vercel.
- Realicé el despliegue a producción exitosamente.

🛠 Tecnologías utilizadas
- Node.js
- Express
- Firebase (Firestore)
- JSON Web Tokens (JWT)
- dotenv
- CORS
- Vercel

🚀 Ejecutar en desarrollo
```
npm install
npm run start
```