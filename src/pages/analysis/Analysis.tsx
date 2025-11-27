import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analysisService } from '../../services/analysisService';
import { BrainCircuitIcon, Loader2, CheckCircle2, XCircle, Clock, PlusIcon, Eye } from 'lucide-react';
import CreateAnalysis from '../../components/analysis/CreateAnalysis';

export default function Analysis() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: analysisService.getAnalyses,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis con IA</h1>
          <p className="mt-1 text-sm text-gray-500">
            Análisis geoespaciales realizados por agentes de IA
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Análisis
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {[
          { label: 'Total', value: data?.count || 0, color: 'blue' },
          { label: 'Completados', value: data?.results.filter(a => a.status === 'completed').length || 0, color: 'green' },
          { label: 'En Proceso', value: data?.results.filter(a => a.status === 'running').length || 0, color: 'yellow' },
          { label: 'Fallidos', value: data?.results.filter(a => a.status === 'failed').length || 0, color: 'red' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de análisis */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {data?.results.map((analysis) => (
            <li key={analysis.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {getStatusIcon(analysis.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        Análisis #{analysis.id}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(analysis.status)}`}>
                        {analysis.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Tipo: <span className="font-medium">{analysis.analysis_type}</span>
                    </p>
                    {analysis.started_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Iniciado: {new Date(analysis.started_at).toLocaleString('es-ES')}
                      </p>
                    )}
                    {analysis.completed_at && (
                      <p className="text-xs text-gray-400">
                        Completado: {new Date(analysis.completed_at).toLocaleString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>

                {analysis.result && analysis.status === 'completed' && (
                  <button 
                    onClick={() => setSelectedAnalysis(analysis.id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Resultado
                  </button>
                )}
              </div>

              {/* Mostrar resultado si está seleccionado */}
              {selectedAnalysis === analysis.id && analysis.result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Resultado del Análisis</h4>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(analysis.result, null, 2)}
                  </pre>
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Ocultar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {!data?.results.length && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BrainCircuitIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay análisis</h3>
          <p className="mt-1 text-sm text-gray-500">
            Crea tu primer análisis con IA.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Crear Primer Análisis
          </button>
        </div>
      )}

      {/* Modal de crear análisis */}
      {showCreate && <CreateAnalysis onClose={() => setShowCreate(false)} />}
    </div>
  );
}
