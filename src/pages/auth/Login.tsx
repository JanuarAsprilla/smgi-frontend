import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services';
import { useAuthStore } from '../../store/useAuthStore';
import { MapIcon, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => authService.login(username, password),
    onSuccess: (data) => {
      setAuth(data.user, data.access);
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MapIcon className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SMGI</h1>
          <p className="text-gray-600 mt-2">Sistema de Monitoreo Geoespacial Inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loginMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                Usuario o contraseña incorrectos
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Iniciando sesión...
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
