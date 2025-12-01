# Guía de Uso de los Servicios API

Esta guía proporciona ejemplos prácticos de cómo usar los servicios del frontend para interactuar con el backend SMGI.

## 📚 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Capas y Geodata](#capas-y-geodata)
- [Agentes](#agentes)
- [Monitoreo](#monitoreo)
- [Alertas](#alertas)
- [Automatización](#automatización)
- [Notificaciones](#notificaciones)

---

## 🔐 Autenticación

### Login

```typescript
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

const handleLogin = async (username: string, password: string) => {
  try {
    const response = await authService.login(username, password);

    // Actualizar el store global
    const { setAuth } = useAuthStore.getState();
    setAuth(response.user, response.access);

    console.log("Usuario autenticado:", response.user);
  } catch (error) {
    console.error("Error de login:", error);
  }
};
```

### Obtener Usuario Actual

```typescript
const getCurrentUser = async () => {
  try {
    const user = await authService.getCurrentUser();
    console.log("Usuario actual:", user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
  }
};
```

### Logout

```typescript
const handleLogout = () => {
  const { logout } = useAuthStore.getState();
  authService.logout();
  logout();
  // Redirigir a login
  window.location.href = "/login";
};
```

---

## 👥 Usuarios

### Registro de Usuario

```typescript
import { userService } from "@/services/userService";

const handleRegister = async () => {
  try {
    const response = await userService.register({
      username: "nuevo_usuario",
      email: "usuario@example.com",
      password: "password123",
      password_confirm: "password123",
      first_name: "Nombre",
      last_name: "Apellido",
      phone: "+57 300 123 4567",
      organization: "Mi Organización",
      department: "IT",
      position: "Analista",
      access_justification:
        "Necesito acceso para análisis de datos geoespaciales",
      requested_role_id: 3, // Analyst
    });

    console.log("Usuario registrado:", response);
  } catch (error) {
    console.error("Error en registro:", error);
  }
};
```

### Aprobar Usuario (Admin)

```typescript
const handleApproveUser = async (userId: number) => {
  try {
    await userService.approveReject(userId, {
      action: "approve",
      role_id: 3, // Analyst
      area_id: 1,
    });

    console.log("Usuario aprobado");
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
  }
};
```

---

## 🗺️ Capas y Geodata

### Listar Capas

```typescript
import { layerService } from "@/services/layerService";

const loadLayers = async () => {
  try {
    const response = await layerService.getLayers({
      is_active: true,
      layer_type: "vector",
      ordering: "-created_at",
    });

    console.log(`Total de capas: ${response.count}`);
    console.log("Capas:", response.results);
  } catch (error) {
    console.error("Error al cargar capas:", error);
  }
};
```

### Cargar Shapefile

```typescript
const handleUploadShapefile = async (files: FileList) => {
  const formData = new FormData();

  // Agregar todos los archivos del shapefile (.shp, .shx, .dbf, .prj)
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  formData.append("name", "Mi Capa");
  formData.append("description", "Descripción de la capa");
  formData.append("layer_type", "vector");
  formData.append("is_public", "false");

  try {
    const layer = await layerService.uploadLayer(formData);
    console.log("Capa cargada:", layer);
  } catch (error) {
    console.error("Error al cargar shapefile:", error);
  }
};
```

### Exportar Capa

```typescript
const handleExportLayer = async (layerId: number) => {
  try {
    // Exportar como Shapefile y GeoJSON
    const result = await layerService.exportLayer(layerId, {
      format: "both",
      filename: "mi_capa_exportada",
      crs: "EPSG:4326",
    });

    console.log("Archivos generados:", result.files);

    // Descargar archivos
    result.files.forEach((file) => {
      window.open(file.download_url, "_blank");
    });
  } catch (error) {
    console.error("Error al exportar capa:", error);
  }
};
```

### Obtener Features de una Capa

```typescript
const loadFeatures = async (layerId: number) => {
  try {
    const response = await layerService.getFeatures({ layer: layerId });

    console.log(`Total de features: ${response.count}`);
    console.log("Features:", response.results);

    // Convertir a GeoJSON FeatureCollection
    const geojson = {
      type: "FeatureCollection",
      features: response.results.map((f) => ({
        type: "Feature",
        geometry: f.geometry,
        properties: f.properties,
      })),
    };

    return geojson;
  } catch (error) {
    console.error("Error al cargar features:", error);
  }
};
```

---

## 🤖 Agentes

### Listar Agentes del Marketplace

```typescript
import { agentService } from "@/services/agentService";

const loadMarketplace = async () => {
  try {
    const response = await agentService.getMarketplace({
      status: "published",
      ordering: "-rating_avg",
    });

    console.log("Agentes en marketplace:", response.results);
  } catch (error) {
    console.error("Error al cargar marketplace:", error);
  }
};
```

### Ejecutar un Agente

```typescript
const handleExecuteAgent = async (agentId: number, layerId: number) => {
  try {
    const execution = await agentService.executeAgent(agentId, {
      parameters: {
        layer_id: layerId,
        threshold: 0.8,
        algorithm: "random_forest",
      },
    });

    console.log("Ejecución iniciada:", execution);

    // Polling para ver el estado
    const checkStatus = setInterval(async () => {
      const updated = await agentService.getExecution(execution.id);

      if (updated.status === "completed") {
        console.log("Ejecución completada:", updated.result);
        clearInterval(checkStatus);
      } else if (updated.status === "failed") {
        console.error("Ejecución fallida:", updated.error_message);
        clearInterval(checkStatus);
      }
    }, 5000); // Check cada 5 segundos
  } catch (error) {
    console.error("Error al ejecutar agente:", error);
  }
};
```

### Crear un Agente

```typescript
const handleCreateAgent = async () => {
  try {
    const agent = await agentService.createAgent({
      name: "Mi Agente de Análisis",
      description: "Agente para análisis de densidad",
      category: 1,
      agent_type: "analysis",
      code: `
def analyze(layer_data, parameters):
    # Código del agente
    threshold = parameters.get('threshold', 0.5)
    # ... lógica de análisis
    return {
        'success': True,
        'result': analysis_result
    }
      `,
      parameters_schema: {
        threshold: {
          type: "number",
          min: 0,
          max: 1,
          default: 0.5,
        },
      },
      is_public: false,
    });

    console.log("Agente creado:", agent);
  } catch (error) {
    console.error("Error al crear agente:", error);
  }
};
```

### Programar Ejecución de Agente

```typescript
const handleScheduleAgent = async (agentId: number) => {
  try {
    const schedule = await agentService.createSchedule({
      agent: agentId,
      name: "Análisis Diario",
      schedule_type: "cron",
      schedule_config: {
        cron: "0 2 * * *", // Todos los días a las 2 AM
      },
      parameters: {
        layer_id: 5,
        threshold: 0.7,
      },
      is_active: true,
    });

    console.log("Programación creada:", schedule);
  } catch (error) {
    console.error("Error al programar agente:", error);
  }
};
```

---

## 🔍 Monitoreo

### Crear Proyecto de Monitoreo

```typescript
import { monitoringService } from "@/services/monitoringService";

const handleCreateProject = async () => {
  try {
    const project = await monitoringService.createProject({
      name: "Monitoreo de Deforestación",
      description: "Proyecto para monitorear cambios en cobertura forestal",
      area_of_interest: {
        type: "Polygon",
        coordinates: [
          [
            [-74.0, 4.5],
            [-74.0, 5.0],
            [-73.5, 5.0],
            [-73.5, 4.5],
            [-74.0, 4.5],
          ],
        ],
      },
      start_date: "2024-01-01",
    });

    console.log("Proyecto creado:", project);
  } catch (error) {
    console.error("Error al crear proyecto:", error);
  }
};
```

### Crear Monitor

```typescript
const handleCreateMonitor = async (projectId: number, layerId: number) => {
  try {
    const monitor = await monitoringService.createMonitor({
      project: projectId,
      name: "Monitor de Cambio Forestal",
      description: "Detecta cambios en cobertura forestal",
      monitor_type: "change_detection",
      layer: layerId,
      check_interval: 1440, // 24 horas en minutos
      configuration: {
        threshold: 0.15,
        algorithm: "ndvi_diff",
      },
      is_active: true,
    });

    console.log("Monitor creado:", monitor);
  } catch (error) {
    console.error("Error al crear monitor:", error);
  }
};
```

### Ver Detecciones

```typescript
const loadDetections = async () => {
  try {
    const response = await monitoringService.getDetections({
      status: "pending",
      severity: "high",
      ordering: "-detected_at",
    });

    console.log("Detecciones pendientes:", response.results);
  } catch (error) {
    console.error("Error al cargar detecciones:", error);
  }
};
```

### Revisar Detección

```typescript
const handleReviewDetection = async (detectionId: number) => {
  try {
    await monitoringService.reviewDetection(detectionId, {
      status: "confirmed",
      review_notes: "Cambio confirmado mediante análisis manual",
    });

    console.log("Detección revisada");
  } catch (error) {
    console.error("Error al revisar detección:", error);
  }
};
```

---

## 🚨 Alertas

### Crear Regla de Alerta

```typescript
import { alertService } from "@/services/alertService";

const handleCreateAlertRule = async () => {
  try {
    const rule = await alertService.createRule({
      name: "Alerta de Deforestación Crítica",
      description: "Alerta cuando se detecta deforestación > 10 hectáreas",
      rule_type: "threshold",
      conditions: {
        metric: "area_lost",
        operator: "greater_than",
        threshold: 10,
        unit: "hectares",
      },
      severity: "critical",
      channels: [1, 2], // IDs de canales (email, SMS)
      is_active: true,
    });

    console.log("Regla de alerta creada:", rule);
  } catch (error) {
    console.error("Error al crear regla:", error);
  }
};
```

### Crear Canal de Alerta

```typescript
const handleCreateEmailChannel = async () => {
  try {
    const channel = await alertService.createChannel({
      name: "Email Principal",
      description: "Canal de email para alertas críticas",
      channel_type: "email",
      configuration: {
        recipients: ["admin@example.com", "team@example.com"],
        subject_prefix: "[SMGI Alert]",
      },
      is_active: true,
    });

    console.log("Canal de alerta creado:", channel);
  } catch (error) {
    console.error("Error al crear canal:", error);
  }
};
```

### Reconocer Alerta

```typescript
const handleAcknowledgeAlert = async (alertId: number) => {
  try {
    await alertService.acknowledgeAlert(alertId);
    console.log("Alerta reconocida");
  } catch (error) {
    console.error("Error al reconocer alerta:", error);
  }
};
```

---

## ⚙️ Automatización

### Crear Workflow

```typescript
import { automationService } from "@/services/automationService";

const handleCreateWorkflow = async () => {
  try {
    const workflow = await automationService.createWorkflow({
      name: "Workflow de Análisis Automático",
      description: "Ejecuta análisis cuando se detectan cambios",
      trigger_type: "event",
      workflow_definition: {
        trigger: {
          event: "detection.created",
          conditions: {
            severity: ["high", "critical"],
          },
        },
        tasks: [
          {
            id: "task1",
            type: "agent_execution",
            agent_id: 5,
            parameters: {
              layer_id: "{{detection.layer}}",
            },
          },
          {
            id: "task2",
            type: "send_notification",
            channels: [1],
            message: "Análisis completado: {{task1.result}}",
          },
        ],
      },
      status: "active",
      is_public: false,
    });

    console.log("Workflow creado:", workflow);
  } catch (error) {
    console.error("Error al crear workflow:", error);
  }
};
```

### Ejecutar Workflow Manualmente

```typescript
const handleExecuteWorkflow = async (workflowId: number) => {
  try {
    const execution = await automationService.executeWorkflow(workflowId, {
      parameters: {
        layer_id: 10,
        threshold: 0.85,
      },
    });

    console.log("Workflow ejecutándose:", execution);
  } catch (error) {
    console.error("Error al ejecutar workflow:", error);
  }
};
```

---

## 🔔 Notificaciones

### Obtener Notificaciones No Leídas

```typescript
import { notificationService } from "@/services/notificationService";

const loadUnreadNotifications = async () => {
  try {
    const response = await notificationService.getNotifications({
      is_read: false,
      ordering: "-created_at",
    });

    console.log("Notificaciones no leídas:", response.results);
  } catch (error) {
    console.error("Error al cargar notificaciones:", error);
  }
};
```

### Marcar Notificación como Leída

```typescript
const handleMarkAsRead = async (notificationId: number) => {
  try {
    await notificationService.markAsRead(notificationId);
    console.log("Notificación marcada como leída");
  } catch (error) {
    console.error("Error al marcar notificación:", error);
  }
};
```

### Actualizar Preferencias de Notificación

```typescript
const handleUpdatePreferences = async () => {
  try {
    await notificationService.updatePreferences({
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      notification_frequency: "realtime",
      quiet_hours_start: "22:00",
      quiet_hours_end: "07:00",
    });

    console.log("Preferencias actualizadas");
  } catch (error) {
    console.error("Error al actualizar preferencias:", error);
  }
};
```

### Conectar WebSocket para Notificaciones en Tiempo Real

```typescript
const setupNotifications = (userId: number) => {
  const ws = notificationService.connectWebSocket(userId, (notification) => {
    console.log("Nueva notificación:", notification);

    // Mostrar toast o actualizar UI
    showToast(notification.title, notification.message);
  });

  // Cleanup al desmontar
  return () => {
    ws.close();
  };
};
```

---

## 🎯 Uso con React Query

Para un mejor manejo de estado y caché, puedes usar React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { layerService } from "@/services/layerService";

// Query para listar capas
const useLayers = (filters?: LayerFilters) => {
  return useQuery({
    queryKey: ["layers", filters],
    queryFn: () => layerService.getLayers(filters),
  });
};

// Mutation para crear capa
const useCreateLayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => layerService.uploadLayer(formData),
    onSuccess: () => {
      // Invalidar caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["layers"] });
    },
  });
};

// Uso en componente
const LayersList = () => {
  const { data, isLoading, error } = useLayers({ is_active: true });
  const createLayer = useCreateLayer();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Capas ({data?.count})</h2>
      {data?.results.map((layer) => (
        <div key={layer.id}>{layer.name}</div>
      ))}
    </div>
  );
};
```

---

## 📝 Notas Importantes

1. **Manejo de Errores**: Siempre usa try-catch para manejar errores de API
2. **Autenticación**: Los tokens se manejan automáticamente por el interceptor
3. **Paginación**: Usa los parámetros `page` y `page_size` en los filtros
4. **Ordenamiento**: Usa `-` para orden descendente (ej: `-created_at`)
5. **Permisos**: Verifica que el usuario tenga los permisos necesarios antes de llamar endpoints protegidos

---

¿Necesitas más ejemplos o aclaraciones? Consulta la documentación del backend en:

- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
