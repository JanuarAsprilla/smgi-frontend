import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layerService } from '../../services/layerService';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface LayerUploadProps {
  onClose: () => void;
}

export default function LayerUpload({ onClose }: LayerUploadProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => layerService.uploadLayer(formData),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Error al subir la capa';
      setError(errorMsg);
      console.error('Upload error:', error.response?.data);
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('description', description);

    console.log('Uploading:', { file: file.name, name, description });
    uploadMutation.mutate(formData);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Capa subida exitosamente!</h3>
            <p className="text-gray-600">La capa se ha procesado correctamente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Subir Capa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra un archivo aquí o haz click para seleccionar
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".geojson,.json,.shp,.zip,.kml,.gpkg"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
              >
                Seleccionar archivo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formatos: GeoJSON, Shapefile (ZIP), KML, GeoPackage
              </p>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo seleccionado: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la capa"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción de la capa"
              rows={3}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error al subir la capa</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending || !file}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? 'Subiendo...' : 'Subir Capa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
