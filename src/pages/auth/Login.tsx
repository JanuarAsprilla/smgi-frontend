import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services';
import { useAuthStore } from '../../store/useAuthStore';
import { MapIcon, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ username: boolean; password: boolean }>({ username: false, password: false });

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (username && errors.username) {
      setErrors(prev => ({ ...prev, username: undefined }));
    }
  }, [username]);

  useEffect(() => {
    if (password && errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [password]);

  const loginMutation = useMutation({
    mutationFn: () => authService.login(username, password),
    onSuccess: (data) => {
      setAuth(data.user, data.access);
      // Pequeño delay para mostrar transición suave
      setTimeout(() => navigate('/'), 150);
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      const errorMessage = errorData?.detail || errorData?.error || errorData?.message;
      
      // Identificar tipo de error específico
      if (errorMessage?.toLowerCase().includes('username') || errorMessage?.toLowerCase().includes('usuario')) {
        setErrors({ username: 'Usuario no encontrado o incorrecto' });
      } else if (errorMessage?.toLowerCase().includes('password') || errorMessage?.toLowerCase().includes('contraseña')) {
        setErrors({ password: 'Contraseña incorrecta' });
      } else if (error?.response?.status === 401) {
        setErrors({ general: 'Credenciales incorrectas. Por favor verifica tu usuario y contraseña.' });
      } else if (error?.response?.status === 403) {
        setErrors({ general: 'Tu cuenta está inactiva o pendiente de aprobación. Contacta al administrador.' });
      } else if (error?.code === 'ERR_NETWORK' || !error?.response) {
        setErrors({ general: 'Error de conexión. Verifica tu conexión a internet o que el servidor esté disponible.' });
      } else {
        setErrors({ general: errorMessage || 'Error al iniciar sesión. Por favor intenta nuevamente.' });
      }
    },
  });

  const validateField = (field: 'username' | 'password', value: string) => {
    if (!value.trim()) {
      return `${field === 'username' ? 'Usuario' : 'Contraseña'} es requerido`;
    }
    if (field === 'username' && value.length < 3) {
      return 'El usuario debe tener al menos 3 caracteres';
    }
    if (field === 'password' && value.length < 4) {
      return 'La contraseña debe tener al menos 4 caracteres';
    }
    return undefined;
  };

  const handleBlur = (field: 'username' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'username' ? username : password;
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como touched
    setTouched({ username: true, password: true });
    
    // Validar todos los campos
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    
    if (usernameError || passwordError) {
      setErrors({
        username: usernameError,
        password: passwordError,
      });
      return;
    }
    
    // Limpiar errores previos
    setErrors({});
    
    // Realizar login
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MapIcon className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SMGI</h1>
          <p className="text-gray-600 mt-2">Sistema de Monitoreo Geoespacial Inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Usuario */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => handleBlur('username')}
              autoComplete="username"
              className={`w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 ${
                errors.username && touched.username
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Ingresa tu usuario"
            />
            {errors.username && touched.username && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.username}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                autoComplete="current-password"
                className={`w-full px-3 py-2 pr-10 border rounded-md transition-colors focus:outline-none focus:ring-2 ${
                  errors.password && touched.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Error General */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Error al iniciar sesión</h4>
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de Éxito (cuando está cargando después del éxito) */}
          {loginMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                <p className="text-sm font-medium text-green-800">¡Inicio de sesión exitoso! Redirigiendo...</p>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending || loginMutation.isSuccess}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Iniciando sesión...
              </>
            ) : loginMutation.isSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Redirigiendo...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/register" className="text-sm text-blue-600 hover:text-blue-700">
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
