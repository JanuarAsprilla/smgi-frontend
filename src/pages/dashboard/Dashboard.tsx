import { useQuery } from '@tanstack/react-query';
import { layerService } from '../../services/layerService';
import { analysisService } from '../../services/analysisService';
import { LayersIcon, BrainCircuitIcon, TrendingUpIcon, MapPinIcon } from 'lucide-react';

export default function Dashboard() {
  const { data: layersData } = useQuery({
    queryKey: ['layers'],
    queryFn: layerService.getLayers,
  });

  const { data: analysesData } = useQuery({
    queryKey: ['analyses'],
    queryFn: analysisService.getAnalyses,
  });

  const stats = [
    {
      name: 'Total Capas',
      value: layersData?.count || 0,
      icon: LayersIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Análisis Completados',
      value: analysesData?.results.filter(a => a.status === 'completed').length || 0,
      icon: BrainCircuitIcon,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'En Proceso',
      value: analysesData?.results.filter(a => a.status === 'running').length || 0,
      icon: TrendingUpIcon,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      name: 'Features',
      value: layersData?.results.reduce((sum, layer) => sum + (layer.feature_count || 0), 0) || 0,
      icon: MapPinIcon,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Vista general del sistema de monitoreo</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Capas Recientes</h3>
        {layersData?.results.length ? (
          <div className="space-y-3">
            {layersData.results.slice(0, 5).map((layer) => (
              <div key={layer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <LayersIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{layer.name}</p>
                    <p className="text-xs text-gray-500">
                      {layer.geometry_type} • {layer.feature_count || 0} features
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  layer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {layer.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay capas disponibles</p>
        )}
      </div>
    </div>
  );
}
