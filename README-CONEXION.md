Conectar frontend (Launchix) con backend Laravel

1) Configurar URL del backend
- Por defecto, el frontend asume http://localhost:8000 como base y /api como prefijo de API.
- Puedes cambiarlo sin reconstruir el frontend, usando localStorage en el navegador:
  - API_BASE_URL: URL de tu backend (p.ej. http://localhost:8001)
  - API_PREFIX: prefijo (p.ej. /api)
  - API_WITH_CREDENTIALS: 'true' para usar cookies (Sanctum) o 'false' para no usarlas
  - API_AUTH_STRATEGY: 'sanctum' o 'token'
  - API_TOKEN: Token Bearer si usas estrategia 'token'

2) Backend Laravel: CORS y Sanctum
- Instala y configura CORS (config/cors.php):
  'paths' => ['api/*', 'sanctum/csrf-cookie'],
  'allowed_methods' => ['*'],
  'allowed_origins' => ['http://localhost', 'http://127.0.0.1', 'http://localhost:5173', 'http://localhost:8080'],
  'supports_credentials' => true, // si usas cookies

- Si usas Sanctum con cookies:
  - APP_URL y SANCTUM_STATEFUL_DOMAINS deben incluir el origen del frontend
  - Middleware en api: \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class

3) Estrategias de auth desde el frontend
- Cookies (Sanctum): setea API_WITH_CREDENTIALS='true' y API_AUTH_STRATEGY='sanctum'
  - El frontend pedirá /sanctum/csrf-cookie antes de métodos no-GET
- Token Bearer: setea API_AUTH_STRATEGY='token' y API_TOKEN='TU_TOKEN'

4) Probar conexión rápida
- Abre la consola del navegador en cualquier vista y ejecuta:
  localStorage.setItem('API_BASE_URL', 'http://localhost:8000');
  localStorage.setItem('API_PREFIX', '/api');
  localStorage.setItem('API_WITH_CREDENTIALS', 'false');
  location.reload();

- Luego prueba una ruta pública, p.ej. en Productos o Servicios,
  y revisa la consola del navegador para ver logs 📡 [API]

5) Rutas esperadas
- Productos: GET /api/products (ajusta según tu backend)
- Servicios: GET /api/services
- Login/Registro: POST /api/login, POST /api/register (o /login con Sanctum)

6) Problemas comunes
- CORS bloqueado: revisa config/cors.php y allowed_origins
- Cookie CSRF: si usas cookies, /sanctum/csrf-cookie debe responder 204 y setear XSRF-TOKEN
- Prefijo/API base incorrectos: ajusta en localStorage y recarga
