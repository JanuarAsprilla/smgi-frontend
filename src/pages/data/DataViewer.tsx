import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { layerService } from '../../services/layerService';
import { 
  Table2, 
  Download, 
  Filter, 
  Search, 
  RefreshCw,
  FileSpreadsheet,
  FileJson,
  Database,
  BarChart3,
  Map as MapIcon,
  Loader2
} from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function DataViewer() {
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [gridApi, setGridApi] = useState<any>(null);

  // Obtener capas
  const { data: layersResponse, isLoading: loadingLayers } = useQuery({
    queryKey: ['layers'],
    queryFn: layerService.getLayers,
  });

  const layers = layersResponse?.results || [];

  // Obtener datos de la capa seleccionada
  const { data: layerData, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['layer', selectedLayerId],
    queryFn: () => layerService.getLayer(selectedLayerId!),
    enabled: !!selectedLayerId,
  });

  // Preparar datos para la tabla
  const { rowData, columnDefs } = useMemo(() => {
    if (!layerData?.features) {
      return { rowData: [], columnDefs: [] };
    }

    const features = layerData.features;
    
    if (features.length === 0) {
      return { rowData: [], columnDefs: [] };
    }

    // Extraer todas las propiedades únicas
    const allKeys = new Set<string>();
    features.forEach((feature: any) => {
      Object.keys(feature.properties || {}).forEach(key => allKeys.add(key));
    });

    // Crear columnas
    const cols: ColDef[] = [
      {
        headerName: 'ID',
        field: 'id',
        width: 80,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      ...Array.from(allKeys).map(key => ({
        headerName: key,
        field: `properties.${key}`,
        sortable: true,
        filter: true,
        resizable: true,
        width: 150,
      })),
      {
        headerName: 'Geometría',
        field: 'geom.type',
        width: 120,
        cellRenderer: (params: any) => {
          const type = params.value;
          const colors: Record<string, string> = {
            Point: 'bg-blue-100 text-blue-800',
            LineString: 'bg-green-100 text-green-800',
            Polygon: 'bg-purple-100 text-purple-800',
            MultiPoint: 'bg-blue-100 text-blue-800',
            MultiLineString: 'bg-green-100 text-green-800',
            MultiPolygon: 'bg-purple-100 text-purple-800',
          };
          const color = colors[type] || 'bg-gray-100 text-gray-800';
          return `<span class="px-2 py-1 text-xs font-medium rounded ${color}">${type}</span>`;
        },
      },
    ];

    // Preparar filas
    const rows = features.map((feature: any) => ({
      id: feature.id,
      properties: feature.properties,
      geom: feature.geom,
    }));

    return { rowData: rows, columnDefs: cols };
  }, [layerData]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const onQuickFilterChanged = useCallback(() => {
    gridApi?.setQuickFilter(searchText);
  }, [gridApi, searchText]);

  const exportToCSV = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `${layerData?.name || 'data'}_export.csv`,
      });
    }
  };

  const exportToExcel = () => {
    // TODO: Implementar export a Excel
    alert('Exportación a Excel próximamente');
  };

  const exportToJSON = () => {
    const jsonData = JSON.stringify(rowData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layerData?.name || 'data'}_export.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatistics = () => {
    if (!layerData?.features) return null;

    const features = layerData.features;
    const totalFeatures = features.length;

    // Contar tipos de geometría
    const geomTypes: Record<string, number> = {};
    features.forEach((f: any) => {
      const type = f.geom?.type || 'Unknown';
      geomTypes[type] = (geomTypes[type] || 0) + 1;
    });

    return {
      total: totalFeatures,
      geomTypes,
    };
  };

  const stats = getStatistics();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Table2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visor de Datos</h1>
              <p className="text-sm text-gray-500">Explora y analiza datos geoespaciales</p>
            </div>
          </div>

          {selectedLayerId && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>

              <div className="relative">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                  <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown de exportación */}
                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    Excel
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layer Selector & Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecciona una Capa
            </label>
            <select
              value={selectedLayerId || ''}
              onChange={(e) => setSelectedLayerId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona una capa --</option>
              {layers.map((layer: any) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name} ({layer.feature_count} features)
                </option>
              ))}
            </select>
          </div>

          {selectedLayerId && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Búsqueda Rápida
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    onQuickFilterChanged();
                  }}
                  placeholder="Buscar en todas las columnas..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {selectedLayerId && stats && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Features</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Columnas</p>
                  <p className="text-2xl font-bold text-gray-900">{columnDefs.length - 2}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Tipos de Geometría</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(stats.geomTypes).length}
                  </p>
                </div>
                <MapIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div>
                <p className="text-xs text-gray-600 mb-1">Distribución</p>
                <div className="space-y-1">
                  {Object.entries(stats.geomTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{type}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-white p-4">
        {loadingLayers ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : !selectedLayerId ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Table2 className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona una Capa
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Elige una capa del selector para ver y analizar sus datos en formato tabular
            </p>
          </div>
        ) : loadingData ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Cargando datos...</p>
            </div>
          </div>
        ) : rowData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Database className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sin Datos
            </h3>
            <p className="text-sm text-gray-500">
              Esta capa no tiene features para mostrar
            </p>
          </div>
        ) : (
          <div className="ag-theme-alpine h-full">
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
              onGridReady={onGridReady}
              pagination={true}
              paginationPageSize={50}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              animateRows={true}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {selectedLayerId && rowData.length > 0 && (
        <div className="bg-gray-50 border-t px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>
                Mostrando <strong>{rowData.length}</strong> features
              </span>
              <span>•</span>
              <span>
                <strong>{columnDefs.length - 2}</strong> columnas
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros activos: 0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
