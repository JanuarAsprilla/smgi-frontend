import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { CheckCircle2, XCircle, Loader2, MapIcon } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = searchParams.get('token');

  const verifyMutation = useMutation({
    mutationFn: userService.verifyEmail,
    onSuccess: () => {
      setStatus('success');
    },
    onError: () => {
      setStatus('error');
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus('error');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <MapIcon className="h-12 w-12 text-blue-600" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verificando Email...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu cuenta.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Email Verificado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu email ha sido verificado exitosamente.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Un administrador revisará tu solicitud y te notificaremos por email
              cuando tu cuenta sea aprobada.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Ir al Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error de Verificación
            </h2>
            <p className="text-gray-600 mb-6">
              El enlace de verificación es inválido o ha expirado.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Por favor solicita un nuevo enlace de verificación o contacta al administrador.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Ir al Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
