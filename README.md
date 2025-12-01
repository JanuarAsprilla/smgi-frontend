# SMGI Frontend

Sistema de Monitoreo Geoespacial Inteligente - Frontend Application

## 📋 Descripción

Frontend desarrollado en React + TypeScript + Vite para el Sistema de Monitoreo Geoespacial Inteligente (SMGI). Esta aplicación se integra completamente con el backend Django para proporcionar una interfaz moderna y responsive para la gestión de datos geoespaciales, monitoreo de cambios, análisis con agentes IA, y automatización de workflows.

## 🚀 Características

- **Autenticación JWT**: Login seguro con refresh automático de tokens
- **Gestión de Capas**: Carga, visualización y exportación de datos geoespaciales (Shapefile, GeoJSON, KML)
- **Agentes IA**: Marketplace de agentes, ejecución, calificación y programación
- **Monitoreo**: Detección de cambios, proyectos de monitoreo y alertas
- **Alertas**: Configuración de reglas, canales y suscripciones
- **Automatización**: Workflows personalizados con triggers y acciones
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Visualización de Mapas**: Integración con Leaflet para visualización geoespacial

## 🛠️ Stack Tecnológico

- **React 19** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Zustand** - State management
- **React Query** - Data fetching y caching
- **Axios** - Cliente HTTP
- **React Router** - Routing
- **Leaflet** - Mapas interactivos
- **AG Grid** - Tablas de datos
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

## 📦 Instalación

### Prerrequisitos

- Node.js >= 18.x
- npm o yarn
- Backend SMGI corriendo en `http://localhost:8000`

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/JanuarAsprilla/smgi-frontend.git
cd smgi-frontend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_FRONTEND_URL=http://localhost:5173
VITE_ENV=development
```

4. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔧 Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye la aplicación para producción
npm run preview      # Preview de la build de producción
npm run lint         # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes React
│   ├── admin/       # Componentes de administración
│   ├── agents/      # Componentes de agentes
│   ├── alerts/      # Componentes de alertas
│   ├── analysis/    # Componentes de análisis
│   ├── automation/  # Componentes de automatización
│   ├── common/      # Componentes comunes
│   ├── layers/      # Componentes de capas
│   ├── layout/      # Componentes de layout
│   ├── map/         # Componentes de mapas
│   ├── monitoring/  # Componentes de monitoreo
│   └── processes/   # Componentes de procesos
├── config/          # Configuración
│   └── api.ts       # Configuración de endpoints API
├── pages/           # Páginas principales
│   ├── admin/       # Páginas de administración
│   ├── agents/      # Páginas de agentes
│   ├── analysis/    # Páginas de análisis
│   ├── auth/        # Páginas de autenticación
│   ├── dashboard/   # Dashboard principal
│   ├── data/        # Páginas de datos
│   ├── layers/      # Páginas de capas
│   ├── map/         # Páginas de mapas
│   ├── monitoring/  # Páginas de monitoreo
│   └── settings/    # Páginas de configuración
├── services/        # Servicios de API
│   ├── agentService.ts
│   ├── alertService.ts
│   ├── analysisService.ts
│   ├── api.ts              # Cliente Axios configurado
│   ├── authService.ts
│   ├── automationService.ts
│   ├── layerService.ts
│   ├── monitoringService.ts
│   ├── notificationService.ts
│   └── userService.ts
├── store/           # Zustand stores
│   └── useAuthStore.ts
├── types/           # Definiciones TypeScript
│   └── index.ts
├── utils/           # Utilidades
│   └── cn.ts
├── App.tsx          # Componente principal
└── main.tsx         # Punto de entrada
```

## 🔌 Integración con Backend

### Endpoints Principales

El frontend se comunica con el backend a través de los siguientes módulos:

#### **Autenticación** (`/api/v1/auth/`)

- `POST /login/` - Login con usuario y contraseña
- `POST /refresh/` - Renovar access token
- `POST /verify/` - Verificar validez de token

#### **Usuarios** (`/api/v1/users/`)

- `GET /users/me/` - Obtener usuario actual
- `POST /users/register/` - Registro de usuario
- `GET /users/pending-approvals/` - Usuarios pendientes (admin)
- `POST /users/{id}/approve-reject/` - Aprobar/rechazar usuario

#### **Geodata** (`/api/v1/geodata/`)

- `GET /layers/` - Listar capas
- `POST /layers/upload/` - Cargar capa (Shapefile, GeoJSON, KML, GeoPackage)
- `POST /layers/{id}/export/` - Exportar capa
- `GET /features/` - Obtener features de una capa
- `GET /datasets/` - Listar datasets

#### **Agentes** (`/api/v1/agents/`)

- `GET /agents/` - Listar agentes
- `POST /agents/{id}/execute/` - Ejecutar agente
- `GET /agents/marketplace/` - Marketplace de agentes públicos
- `POST /agents/{id}/rate/` - Calificar agente
- `GET /executions/` - Historial de ejecuciones
- `POST /schedules/` - Programar ejecución

#### **Monitoreo** (`/api/v1/monitoring/`)

- `GET /projects/` - Proyectos de monitoreo
- `POST /monitors/` - Crear monitor
- `POST /monitors/{id}/execute/` - Ejecutar monitor manualmente
- `GET /detections/` - Detecciones de cambios
- `POST /detections/{id}/review/` - Revisar detección

#### **Alertas** (`/api/v1/alerts/`)

- `GET /alerts/` - Listar alertas
- `POST /alerts/{id}/acknowledge/` - Reconocer alerta
- `POST /alerts/{id}/resolve/` - Resolver alerta
- `GET /rules/` - Reglas de alertas
- `GET /channels/` - Canales de alertas

#### **Automatización** (`/api/v1/automation/`)

- `GET /workflows/` - Listar workflows
- `POST /workflows/{id}/execute/` - Ejecutar workflow
- `POST /workflows/{id}/activate/` - Activar workflow
- `GET /executions/` - Historial de ejecuciones

#### **Notificaciones** (`/api/v1/notifications/`)

- `GET /` - Listar notificaciones
- `POST /{id}/mark-as-read/` - Marcar como leída
- `POST /mark-all-as-read/` - Marcar todas como leídas
- `GET /unread-count/` - Contador de no leídas
- `GET /preferences/` - Preferencias de notificación

### Autenticación

El frontend utiliza JWT para autenticación. Los tokens se almacenan en `localStorage`:

```typescript
// Login
const response = await authService.login(username, password);
// Guarda automáticamente access_token y refresh_token

// Los tokens se incluyen automáticamente en todas las requests
// mediante el interceptor de Axios

// Refresh automático
// Si una request recibe 401, el interceptor intenta renovar el token
// automáticamente usando el refresh_token
```

### Manejo de Errores

El interceptor de Axios maneja automáticamente:

- **401 Unauthorized**: Intenta renovar el token o redirige a login
- **403 Forbidden**: Muestra error de permisos
- **404 Not Found**: Registra recurso no encontrado
- **500 Server Error**: Registra error del servidor

## 🔐 Seguridad

- Todos los endpoints (excepto login/register) requieren autenticación
- Los tokens JWT expiran en 60 minutos
- Refresh automático de tokens antes de expiración
- CORS configurado para `localhost:3000` y `localhost:5173`
- Validación de permisos según rol de usuario

## 👥 Roles de Usuario

- **Admin**: Acceso completo, aprobación de usuarios
- **Manager**: Gestión de proyectos y workflows
- **Analyst**: Creación de análisis y monitoreo
- **Developer**: Desarrollo de agentes
- **Viewer**: Solo visualización

## 🌍 Integración con Mapas

Utiliza **Leaflet** y **React-Leaflet** para visualización de mapas:

```typescript
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

// Visualizar capa GeoJSON
<MapContainer center={[0, 0]} zoom={2}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <GeoJSON data={geoJsonData} />
</MapContainer>;
```

## 📊 Gestión de Estado

- **Zustand**: Estado global de autenticación
- **React Query**: Cache y sincronización de datos del servidor
- **Local Storage**: Persistencia de tokens y preferencias

## 🚦 Próximos Pasos

1. Implementar WebSockets para notificaciones en tiempo real
2. Agregar tests unitarios y de integración
3. Implementar PWA para funcionamiento offline
4. Mejorar visualización de mapas con capas raster
5. Agregar dashboard de analytics avanzado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🔗 Enlaces

- **Backend**: [https://github.com/JanuarAsprilla/smgi-backend](https://github.com/JanuarAsprilla/smgi-backend)
- **Documentación del Backend**: Ver `docs/FRONTEND_INTEGRATION.md` en el repositorio del backend
- **API Docs (Swagger)**: http://localhost:8000/api/schema/swagger-ui/
- **API Docs (ReDoc)**: http://localhost:8000/api/schema/redoc/

## 📧 Contacto

Januar Asprilla - [GitHub](https://github.com/JanuarAsprilla)

---

**¡Desarrollado con ❤️ para el monitoreo geoespacial inteligente!**
