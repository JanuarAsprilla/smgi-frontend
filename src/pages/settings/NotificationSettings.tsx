import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Send,
  AlertTriangle,
  Info,
  Activity
} from 'lucide-react';

export default function NotificationSettings() {
  const queryClient = useQueryClient();
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Obtener preferencias
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: notificationService.getPreferences,
  });

  // Actualizar preferencias
  const updateMutation = useMutation({
    mutationFn: notificationService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    },
  });

  const handleToggle = (field: string, value: boolean) => {
    updateMutation.mutate({ [field]: value });
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setTestResult(null);
    try {
      const result = await notificationService.testEmail();
      setTestResult({ type: 'success', message: result.message });
    } catch (error: any) {
      setTestResult({ type: 'error', message: error.response?.data?.error || 'Error al enviar email' });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestSMS = async () => {
    setTestingSMS(true);
    setTestResult(null);
    try {
      const result = await notificationService.testSMS();
      setTestResult({ type: 'success', message: result.message });
    } catch (error: any) {
      setTestResult({ type: 'error', message: error.response?.data?.error || 'Error al enviar SMS' });
    } finally {
      setTestingSMS(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preferencias de Notificaciones</h1>
            <p className="text-sm text-gray-500">
              Configura cómo y cuándo quieres recibir notificaciones
            </p>
          </div>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={`rounded-lg p-4 flex items-start space-x-3 ${
            testResult.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {testResult.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                testResult.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {testResult.message}
            </p>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Canales de Notificación */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
            Canales de Notificación
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Activa o desactiva los canales de comunicación
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones por correo electrónico
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.email_notifications}
                onChange={(e) => handleToggle('email_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleTestEmail}
              disabled={testingEmail || !preferences?.email_notifications}
              className="inline-flex items-center px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingEmail ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Probar Email
                </>
              )}
            </button>
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">SMS</p>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones por mensaje de texto
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.sms_notifications}
                onChange={(e) => handleToggle('sms_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleTestSMS}
              disabled={testingSMS || !preferences?.sms_notifications}
              className="inline-flex items-center px-3 py-1.5 text-sm border border-green-300 text-green-700 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingSMS ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Probar SMS
                </>
              )}
            </button>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start space-x-3">
              <Bell className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Notificaciones Push</p>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones en el navegador
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.push_notifications}
                onChange={(e) => handleToggle('push_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Tipos de Notificaciones - Análisis */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-gray-600" />
            Análisis con IA
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Notificaciones sobre procesos de análisis
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Análisis Completado</p>
              <p className="text-sm text-gray-500">
                Cuando un análisis finaliza exitosamente
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.notify_analysis_complete}
                onChange={(e) => handleToggle('notify_analysis_complete', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Análisis Fallido</p>
              <p className="text-sm text-gray-500">
                Cuando un análisis falla o presenta errores
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.notify_analysis_failed}
                onChange={(e) => handleToggle('notify_analysis_failed', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Tipos de Notificaciones - Alertas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-gray-600" />
            Alertas y Monitoreo
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Notificaciones sobre detecciones y alertas
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-start space-x-2">
              <div className="mt-1">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Alertas Críticas</p>
                <p className="text-sm text-gray-500">
                  Situaciones que requieren atención inmediata
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.notify_alerts_critical}
                onChange={(e) => handleToggle('notify_alerts_critical', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-start space-x-2">
              <div className="mt-1">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Alertas Medias</p>
                <p className="text-sm text-gray-500">
                  Situaciones que requieren revisión
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.notify_alerts_medium}
                onChange={(e) => handleToggle('notify_alerts_medium', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-start space-x-2">
              <div className="mt-1">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Alertas Bajas</p>
                <p className="text-sm text-gray-500">
                  Información general y cambios menores
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.notify_alerts_low}
                onChange={(e) => handleToggle('notify_alerts_low', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Otras Notificaciones */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Info className="h-5 w-5 mr-2 text-gray-600" />
            Otras Notificaciones
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Recursos Compartidos</p>
              <p className="text-sm text-gray-500">
                Cuando alguien comparte un recurso contigo
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.notify_resource_shared}
                onChange={(e) => handleToggle('notify_resource_shared', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Reporte Semanal</p>
              <p className="text-sm text-gray-500">
                Resumen semanal de actividad y estadísticas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences?.notify_weekly_report}
                onChange={(e) => handleToggle('notify_weekly_report', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Acerca de las notificaciones</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Los cambios se guardan automáticamente</li>
              <li>Los SMS solo se envían para alertas críticas</li>
              <li>Puedes probar cada canal con los botones "Probar"</li>
              <li>Las notificaciones se envían según tu configuración</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
