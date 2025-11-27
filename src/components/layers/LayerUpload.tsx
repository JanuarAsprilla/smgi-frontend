import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileJson, FileArchive, Loader2, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function LayerUpload({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [layerName, setLayerName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        const ext = file.name.toLowerCase();
        return ext.endsWith('.geojson') || ext.endsWith('.json') || ext.endsWith('.zip');
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).filter(file => {
      const ext = file.name.toLowerCase();
      return ext.endsWith('.geojson') || ext.endsWith('.json') || ext.endsWith('.zip');
    });
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', layerName || file.name);
    if (description) {
      formData.append('description', description);
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE_URL}/geodata/layers/upload/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploads(prev => new Map(prev).set(file.name, {
            file,
            progress,
            status: 'uploading',
          }));
        },
      });

      setUploads(prev => new Map(prev).set(file.name, {
        file,
        progress: 100,
        status: 'success',
      }));
    } catch (error: any) {
      setUploads(prev => new Map(prev).set(file.name, {
        file,
        progress: 0,
        status: 'error',
        error: error.response?.data?.detail || 'Error al subir archivo',
      }));
    }
  };

  const handleUpload = async () => {
    for (const file of files) {
      await uploadFile(file);
    }
    
    // Refrescar lista de capas
    queryClient.invalidateQueries({ queryKey: ['layers'] });
    
    // Esperar un momento y cerrar
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getFileIcon = (filename: string) => {
    if (filename.toLowerCase().endsWith('.zip')) {
      return <FileArchive className="h-8 w-8 text-purple-500" />;
    }
    return <FileJson className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Subir Capas</h2>
            <p className="text-sm text-gray-500 mt-1">GeoJSON o Shapefile (ZIP)</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de la capa */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la capa
              </label>
              <input
                type="text"
                value={layerName}
                onChange={(e) => setLayerName(e.target.value)}
                placeholder="Opcional - se usará el nombre del archivo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opcional"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Arrastra archivos aquí o{' '}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                selecciona archivos
                <input
                  type="file"
                  multiple
                  accept=".geojson,.json,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              GeoJSON (.geojson, .json) o Shapefile (.zip)
            </p>
          </div>

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Archivos seleccionados ({files.length})
              </h3>
              {files.map((file, index) => {
                const upload = uploads.get(file.name);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {upload && upload.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${upload.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {upload && upload.status === 'error' && (
                          <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                        )}
                      </div>
                    </div>
                    
                    {upload ? (
                      upload.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : upload.status === 'error' ? (
                        <X className="h-5 w-5 text-red-500" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      )
                    ) : (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Subir {files.length > 0 && `(${files.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
