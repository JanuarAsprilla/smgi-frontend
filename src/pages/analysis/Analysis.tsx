import { useQuery } from '@tanstack/react-query';
import { analysisService } from '../../services/analysisService';
import { BrainCircuitIcon, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Analysis() {
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Análisis con IA</h1>
        <p className="mt-1 text-sm text-gray-500">Análisis geoespaciales realizados por agentes de IA</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {data?.results.map((analysis) => (
            <li key={analysis.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {getStatusIcon(analysis.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">Análisis #{analysis.id}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(analysis.status)}`}>
                        {analysis.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Tipo: {analysis.analysis_type}</p>
                    {analysis.started_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Iniciado: {new Date(analysis.started_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {analysis.result && (
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver resultado
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {!data?.results.length && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BrainCircuitIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay análisis</h3>
          <p className="mt-1 text-sm text-gray-500">Crea tu primer análisis con IA.</p>
        </div>
      )}
    </div>
  );
}
