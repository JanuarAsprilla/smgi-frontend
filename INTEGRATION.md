# Integración Frontend-Backend SMGI

## 🔗 Resumen de la Integración

Este documento describe la integración completa entre el frontend React/TypeScript y el backend Django del Sistema de Monitoreo Geoespacial Inteligente (SMGI).

## ✅ Estado de la Integración

### ✔️ Completado

1. **Configuración de API**

   - ✅ Base URL configurable via variables de entorno
   - ✅ Endpoints completos para todos los módulos
   - ✅ Cliente Axios configurado con interceptores

2. **Autenticación JWT**

   - ✅ Login y registro
   - ✅ Refresh automático de tokens
   - ✅ Manejo de expiración
   - ✅ Logout seguro

3. **Tipos TypeScript**

   - ✅ Tipos completos para todas las entidades del backend
   - ✅ Interfaces para requests y responses
   - ✅ Tipos genéricos (PaginatedResponse, ErrorResponse)

4. **Servicios API**

   - ✅ `authService` - Autenticación completa
   - ✅ `userService` - Gestión de usuarios y aprobaciones
   - ✅ `layerService` - Geodata, capas, features, datasets
   - ✅ `agentService` - Agentes, ejecuciones, marketplace
   - ✅ `monitoringService` - Proyectos, monitores, detecciones
   - ✅ `alertService` - Alertas, reglas, canales
   - ✅ `automationService` - Workflows, ejecuciones
   - ✅ `notificationService` - Notificaciones y preferencias

5. **Manejo de Errores**

   - ✅ Interceptor para errores 401 (Unauthorized)
   - ✅ Refresh automático de tokens
   - ✅ Logging de errores 403, 404, 500
   - ✅ Cola de requests durante refresh

6. **Documentación**
   - ✅ README actualizado
   - ✅ Guía de uso con ejemplos
   - ✅ Documentación de integración

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│          Frontend (React + TypeScript)      │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │         UI Components                 │  │
│  └──────────────┬───────────────────────┘  │
│                 │                            │
│  ┌──────────────▼───────────────────────┐  │
│  │     Services Layer                    │  │
│  │  - authService                        │  │
│  │  - agentService                       │  │
│  │  - monitoringService                  │  │
│  │  - etc...                             │  │
│  └──────────────┬───────────────────────┘  │
│                 │                            │
│  ┌──────────────▼───────────────────────┐  │
│  │     Axios Instance (api.ts)          │  │
│  │  - Request Interceptor               │  │
│  │  - Response Interceptor              │  │
│  │  - Token Management                  │  │
│  └──────────────┬───────────────────────┘  │
└─────────────────┼───────────────────────────┘
                  │
                  │ HTTP/HTTPS
                  │
┌─────────────────▼───────────────────────────┐
│         Backend (Django + DRF)              │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │         API Endpoints                 │  │
│  │  /api/v1/auth/                       │  │
│  │  /api/v1/users/                      │  │
│  │  /api/v1/geodata/                    │  │
│  │  /api/v1/agents/                     │  │
│  │  /api/v1/monitoring/                 │  │
│  │  /api/v1/alerts/                     │  │
│  │  /api/v1/automation/                 │  │
│  │  /api/v1/notifications/              │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🔑 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as Backend API
    participant DB as Database

    U->>F: Login (username, password)
    F->>API: POST /api/v1/auth/login/
    API->>DB: Verificar credenciales
    DB-->>API: Usuario válido
    API-->>F: {access, refresh, user}
    F->>F: Guardar tokens en localStorage
    F->>API: GET /api/v1/users/me/ (con token)
    API-->>F: Datos completos del usuario
    F-->>U: Dashboard

    Note over F,API: Token expira después de 60 min

    U->>F: Acción que requiere autenticación
    F->>API: Request con token expirado
    API-->>F: 401 Unauthorized
    F->>F: Interceptor detecta 401
    F->>API: POST /api/v1/auth/refresh/ (refresh token)
    API-->>F: {access: new_token}
    F->>F: Actualizar access token
    F->>API: Reintentar request original
    API-->>F: Success
    F-->>U: Respuesta exitosa
```

## 📊 Flujo de Datos

### Ejemplo: Cargar y Visualizar Capas

```typescript
// 1. Usuario solicita ver capas
const { data } = await layerService.getLayers({
  is_active: true,
  layer_type: 'vector'
});

// 2. Backend retorna lista paginada
{
  count: 50,
  next: "http://localhost:8000/api/v1/geodata/layers/?page=2",
  previous: null,
  results: [
    {
      id: 1,
      name: "Capa de ejemplo",
      layer_type: "vector",
      geometry_type: "Polygon",
      feature_count: 150,
      // ...
    }
  ]
}

// 3. Usuario selecciona una capa
const layer = await layerService.getLayer(1);

// 4. Cargar features de la capa
const features = await layerService.getFeatures({ layer: 1 });

// 5. Convertir a GeoJSON para visualización
const geojson = {
  type: 'FeatureCollection',
  features: features.results.map(f => ({
    type: 'Feature',
    geometry: f.geometry,
    properties: f.properties,
  })),
};

// 6. Renderizar en mapa con Leaflet
<GeoJSON data={geojson} />
```

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Frontend URL (para CORS)
VITE_FRONTEND_URL=http://localhost:5173

# WebSocket URL (para notificaciones en tiempo real)
VITE_WS_URL=ws://localhost:8000

# Environment
VITE_ENV=development
```

### Backend CORS

El backend debe estar configurado para permitir requests desde el frontend:

```python
# config/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    # Agregar URLs de producción
]

CORS_ALLOW_CREDENTIALS = True
```

## 🔐 Seguridad

### Headers de Request

Todas las requests autenticadas incluyen:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLC...
Content-Type: application/json
```

### Token Refresh

- **Access Token**: Expira en 60 minutos
- **Refresh Token**: Expira en 7 días
- El interceptor maneja automáticamente el refresh cuando el access token expira
- Si el refresh token también expira, el usuario es redirigido al login

### Almacenamiento de Tokens

Los tokens se almacenan en `localStorage`:

- `access_token`: Token de acceso
- `refresh_token`: Token de renovación

**Nota de Seguridad**: En producción, considerar usar `httpOnly` cookies para mayor seguridad.

## 📡 Endpoints por Módulo

### Autenticación

- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/refresh/` - Renovar token
- `POST /api/v1/auth/verify/` - Verificar token

### Usuarios

- `GET /api/v1/users/users/me/` - Usuario actual
- `POST /api/v1/users/users/register/` - Registro
- `GET /api/v1/users/users/pending-approvals/` - Usuarios pendientes
- `POST /api/v1/users/users/{id}/approve-reject/` - Aprobar/rechazar

### Geodata

- `GET /api/v1/geodata/layers/` - Listar capas
- `POST /api/v1/geodata/layers/upload/` - Cargar capa
- `POST /api/v1/geodata/layers/{id}/export/` - Exportar capa
- `GET /api/v1/geodata/features/` - Features de capa

### Agentes

- `GET /api/v1/agents/agents/` - Listar agentes
- `POST /api/v1/agents/agents/{id}/execute/` - Ejecutar agente
- `GET /api/v1/agents/agents/marketplace/` - Marketplace
- `POST /api/v1/agents/agents/{id}/rate/` - Calificar

### Monitoreo

- `GET /api/v1/monitoring/projects/` - Proyectos
- `POST /api/v1/monitoring/monitors/` - Crear monitor
- `GET /api/v1/monitoring/detections/` - Detecciones
- `POST /api/v1/monitoring/detections/{id}/review/` - Revisar

### Alertas

- `GET /api/v1/alerts/alerts/` - Listar alertas
- `POST /api/v1/alerts/alerts/{id}/acknowledge/` - Reconocer
- `GET /api/v1/alerts/rules/` - Reglas de alertas

### Automatización

- `GET /api/v1/automation/workflows/` - Workflows
- `POST /api/v1/automation/workflows/{id}/execute/` - Ejecutar
- `POST /api/v1/automation/workflows/{id}/activate/` - Activar

### Notificaciones

- `GET /api/v1/notifications/` - Listar notificaciones
- `POST /api/v1/notifications/{id}/mark-as-read/` - Marcar leída
- `GET /api/v1/notifications/unread-count/` - Contador no leídas

## 🧪 Testing de la Integración

### 1. Verificar Backend

```bash
# Asegurarse de que el backend esté corriendo
cd smgi-backend
python manage.py runserver
```

Verificar en: http://localhost:8000/api/v1/

### 2. Verificar Frontend

```bash
# En directorio del frontend
npm run dev
```

Verificar en: http://localhost:5173

### 3. Test de Login

```typescript
// En la consola del navegador
import { authService } from "./services/authService";

const response = await authService.login("admin", "admin123");
console.log("Usuario:", response.user);
console.log("Token:", response.access);
```

### 4. Test de Endpoints

```typescript
// Probar listar capas
import { layerService } from "./services/layerService";

const layers = await layerService.getLayers();
console.log("Capas:", layers);

// Probar marketplace de agentes
import { agentService } from "./services/agentService";

const agents = await agentService.getMarketplace();
console.log("Agentes:", agents);
```

## 🐛 Troubleshooting

### Error: CORS

**Problema**: `Access to XMLHttpRequest blocked by CORS policy`

**Solución**:

1. Verificar que el backend tenga configurado CORS correctamente
2. Asegurarse de que la URL del frontend esté en `CORS_ALLOWED_ORIGINS`
3. Verificar que `CORS_ALLOW_CREDENTIALS = True`

### Error: 401 Unauthorized

**Problema**: Todas las requests retornan 401

**Solución**:

1. Verificar que el token no haya expirado
2. Revisar que el interceptor esté funcionando
3. Verificar que el refresh token sea válido
4. Intentar login nuevamente

### Error: Network Error

**Problema**: No se puede conectar al backend

**Solución**:

1. Verificar que el backend esté corriendo en `http://localhost:8000`
2. Verificar la variable de entorno `VITE_API_BASE_URL`
3. Verificar conectividad de red

### Error: 500 Internal Server Error

**Problema**: El backend retorna error 500

**Solución**:

1. Revisar logs del backend: `python manage.py runserver`
2. Verificar que la base de datos esté corriendo
3. Verificar migraciones: `python manage.py migrate`
4. Verificar variables de entorno del backend

## 📝 Próximos Pasos

### Mejoras Pendientes

- [ ] Implementar WebSockets para notificaciones en tiempo real
- [ ] Agregar tests unitarios para servicios
- [ ] Implementar retry logic con exponential backoff
- [ ] Agregar manejo de rate limiting
- [ ] Implementar caché con React Query
- [ ] Agregar soporte para múltiples idiomas
- [ ] Implementar modo offline con Service Workers
- [ ] Agregar analytics y logging

### Features Adicionales

- [ ] Upload de archivos grandes con progreso
- [ ] Exportación masiva de datos
- [ ] Visualización avanzada de mapas (capas raster)
- [ ] Dashboard de analytics en tiempo real
- [ ] Integración con servicios externos (Google Earth Engine, etc.)

## 🔗 Referencias

- **Backend Repository**: https://github.com/JanuarAsprilla/smgi-backend
- **Frontend Repository**: https://github.com/JanuarAsprilla/smgi-frontend
- **API Docs (Swagger)**: http://localhost:8000/api/schema/swagger-ui/
- **API Docs (ReDoc)**: http://localhost:8000/api/schema/redoc/
- **Backend Integration Guide**: Ver `docs/FRONTEND_INTEGRATION.md` en el backend

## 📧 Soporte

Para preguntas o problemas con la integración:

- Crear un issue en GitHub
- Consultar la documentación del backend
- Revisar los ejemplos en `USAGE_GUIDE.md`

---

**Última actualización**: Noviembre 30, 2025
