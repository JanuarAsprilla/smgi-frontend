# Guía de Migración - Integración Backend

Esta guía te ayudará a migrar tu código existente para usar los nuevos servicios integrados con el backend.

## 🔄 Cambios Necesarios

### 1. Actualizar Imports de Servicios

#### Antes:

```typescript
import api from "./services/api";

const getLayers = async () => {
  const { data } = await api.get("/geodata/layers/");
  return data;
};
```

#### Después:

```typescript
import { layerService } from "./services";

const getLayers = async () => {
  const data = await layerService.getLayers({ is_active: true });
  return data;
};
```

### 2. Actualizar Rutas de Autenticación

#### Antes:

```typescript
await api.post("/auth/login/", { username, password });
```

#### Después:

```typescript
import { authService } from "./services";

const response = await authService.login(username, password);
// Maneja automáticamente el guardado de tokens y obtención del usuario
```

### 3. Actualizar Tipos

#### Antes:

```typescript
interface User {
  id: number;
  username: string;
  email: string;
}
```

#### Después:

```typescript
import type { User } from "./types";
// Ya incluye todos los campos del backend
```

### 4. Usar Nuevos Servicios de Agentes

#### Antes:

```typescript
const agents = await api.get("/agents/agents/");
```

#### Después:

```typescript
import { agentService } from "./services";

// Listar agentes con filtros
const agents = await agentService.getAgents({
  agent_type: "analysis",
  status: "published",
  ordering: "-created_at",
});

// Ejecutar agente
const execution = await agentService.executeAgent(agentId, {
  parameters: { layer_id: 5, threshold: 0.8 },
});

// Marketplace
const marketplace = await agentService.getMarketplace();
```

## 📝 Actualizar Componentes Existentes

### Componente de Login

```typescript
// pages/auth/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { useAuthStore } from "@/store/useAuthStore";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(
        credentials.username,
        credentials.password
      );

      setAuth(response.user, response.access);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Formulario de login */}</form>;
};
```

### Componente de Listado de Capas

```typescript
// pages/layers/Layers.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { layerService } from "@/services";
import type { Layer, LayerFilters } from "@/types";

const Layers = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<LayerFilters>({
    is_active: true,
    ordering: "-created_at",
  });

  // Query para listar capas
  const { data, isLoading, error } = useQuery({
    queryKey: ["layers", filters],
    queryFn: () => layerService.getLayers(filters),
  });

  // Mutation para eliminar capa
  const deleteMutation = useMutation({
    mutationFn: (id: number) => layerService.deleteLayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layers"] });
    },
  });

  if (isLoading) return <div>Cargando capas...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Capas ({data?.count})</h1>
      {data?.results.map((layer) => (
        <div key={layer.id}>
          <h3>{layer.name}</h3>
          <p>Features: {layer.feature_count}</p>
          <button onClick={() => deleteMutation.mutate(layer.id)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Componente de Marketplace de Agentes

```typescript
// pages/agents/AgentManager.tsx
import { useQuery } from "@tanstack/react-query";
import { agentService } from "@/services";

const AgentManager = () => {
  const { data: marketplace, isLoading } = useQuery({
    queryKey: ["agents", "marketplace"],
    queryFn: () =>
      agentService.getMarketplace({
        ordering: "-rating_avg",
      }),
  });

  const handleExecuteAgent = async (agentId: number) => {
    try {
      const execution = await agentService.executeAgent(agentId, {
        parameters: { layer_id: 5 },
      });

      console.log("Ejecución iniciada:", execution);
      // Mostrar notificación o actualizar UI
    } catch (error) {
      console.error("Error al ejecutar agente:", error);
    }
  };

  return (
    <div>
      <h1>Marketplace de Agentes</h1>
      {marketplace?.results.map((agent) => (
        <div key={agent.id}>
          <h3>{agent.name}</h3>
          <p>Rating: {agent.rating_avg || "N/A"} ⭐</p>
          <button onClick={() => handleExecuteAgent(agent.id)}>Ejecutar</button>
        </div>
      ))}
    </div>
  );
};
```

### Componente de Monitoreo

```typescript
// pages/monitoring/Monitoring.tsx
import { useQuery } from "@tanstack/react-query";
import { monitoringService } from "@/services";

const Monitoring = () => {
  const { data: detections } = useQuery({
    queryKey: ["detections", "pending"],
    queryFn: () =>
      monitoringService.getDetections({
        status: "pending",
        ordering: "-detected_at",
      }),
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const handleReview = async (
    detectionId: number,
    status: "confirmed" | "false_positive"
  ) => {
    try {
      await monitoringService.reviewDetection(detectionId, {
        status,
        review_notes: "Revisado manualmente",
      });

      // Refrescar datos
      queryClient.invalidateQueries({ queryKey: ["detections"] });
    } catch (error) {
      console.error("Error al revisar detección:", error);
    }
  };

  return (
    <div>
      <h1>Detecciones Pendientes ({detections?.count || 0})</h1>
      {detections?.results.map((detection) => (
        <div key={detection.id}>
          <h3>Detección #{detection.id}</h3>
          <p>Severidad: {detection.severity}</p>
          <button onClick={() => handleReview(detection.id, "confirmed")}>
            Confirmar
          </button>
          <button onClick={() => handleReview(detection.id, "false_positive")}>
            Falso Positivo
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Componente de Notificaciones

```typescript
// components/common/NotificationBell.tsx
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services";
import { useEffect, useState } from "react";

const NotificationBell = () => {
  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, // Cada minuto
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () =>
      notificationService.getNotifications({
        is_read: false,
        ordering: "-created_at",
      }),
  });

  const handleMarkAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div>
      <button>🔔 {unreadCount?.unread_count || 0}</button>
      <div>
        {notifications?.results.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleMarkAsRead(notification.id)}
          >
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔧 Configuración Adicional

### Setup de React Query

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Protected Routes

```typescript
// components/common/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    requiredRole &&
    !requiredRole.includes(user.profile?.role.role_type || "")
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

## ✅ Checklist de Migración

- [ ] Actualizar variables de entorno (`.env`)
- [ ] Actualizar imports de servicios
- [ ] Actualizar imports de tipos
- [ ] Implementar manejo de errores
- [ ] Configurar React Query
- [ ] Actualizar componentes de autenticación
- [ ] Actualizar componentes de capas
- [ ] Actualizar componentes de agentes
- [ ] Actualizar componentes de monitoreo
- [ ] Actualizar componentes de alertas
- [ ] Implementar protected routes
- [ ] Probar todas las funcionalidades
- [ ] Verificar manejo de permisos por rol
- [ ] Documentar cambios específicos del proyecto

## 🧪 Testing

Después de migrar, probar:

1. **Login/Logout**: Verificar que funciona correctamente
2. **Token Refresh**: Esperar 60 minutos y verificar que se renueva automáticamente
3. **Listado de datos**: Verificar que se cargan correctamente con paginación
4. **Creación de recursos**: Probar crear capas, agentes, monitores, etc.
5. **Actualización de recursos**: Probar editar recursos existentes
6. **Eliminación de recursos**: Probar eliminar con confirmación
7. **Permisos**: Verificar que los roles funcionan correctamente
8. **Errores**: Verificar que se manejan apropiadamente

## 📝 Notas

- Todos los servicios retornan Promises
- Usar `async/await` o `.then/.catch`
- Los errores de red se propagan automáticamente
- El refresh de tokens es transparente para el usuario
- Usar React Query para mejor UX con caché y estado de loading

---

¿Necesitas ayuda con la migración? Consulta `USAGE_GUIDE.md` para más ejemplos.
