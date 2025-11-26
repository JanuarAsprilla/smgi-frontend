import { BellIcon } from 'lucide-react';

export default function Monitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoreo</h1>
        <p className="mt-1 text-sm text-gray-500">Sistema de monitoreo y alertas en tiempo real</p>
      </div>

      <div className="text-center py-12 bg-white rounded-lg shadow">
        <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Próximamente</h3>
        <p className="mt-1 text-sm text-gray-500">El sistema de monitoreo estará disponible pronto.</p>
      </div>
    </div>
  );
}
