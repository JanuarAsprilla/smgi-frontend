/**
 * LayerUpload Component - Versión mejorada con múltiples fuentes
 * SMGI Frontend - Sistema de Monitoreo Geoespacial Inteligente
 * 
 * REEMPLAZA tu archivo /src/components/layers/LayerUpload.tsx con este
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layerService } from '../../services/layerService';
import { useToast } from '../ui/Toast';
import {
  Upload,
  X,
  CheckCircle,
  Globe,
  Database,
  FileUp,
  Link,
  Loader2,
  Info,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type TabType = 'file' | 'url' | 'arcgis' | 'database';

interface LayerUploadProps {
  onClose: () => void;
  onSuccess?: () => void;
}

// ============================================================================
// Tab Button Component
// ============================================================================

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description?: string;
}> = ({ active, onClick, icon, label, description }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 p-4 text-left rounded-xl border-2 transition-all ${
      active
        ? 'border-blue-500 bg-blue-50 shadow-md'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
        {icon}
      </div>
      <div>
        <p className={`font-medium ${active ? 'text-blue-700' : 'text-gray-700'}`}>{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  </button>
);

// ============================================================================
// File Upload Tab
// ============================================================================

const FileUploadTab: React.FC<{
  onUpload: (formData: FormData) => void;
  isLoading: boolean;
}> = ({ onUpload, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

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
  };

  const handleSubmit = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name.replace(/\.[^/.]+$/, ''));
    if (description) formData.append('description', description);

    onUpload(formData);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : file
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="font-medium text-green-700">{file.name}</p>
            <p className="text-sm text-green-600 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="mt-3 text-sm text-red-600 hover:text-red-700"
            >
              Cambiar archivo
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Arrastra un archivo aquí o haz click para seleccionar
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".geojson,.json,.shp,.zip,.kml,.gpkg,.gml"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
              Seleccionar archivo
            </label>
            <p className="text-xs text-gray-500 mt-3">
              Formatos: GeoJSON, Shapefile (ZIP), KML, GeoPackage, GML
            </p>
          </>
        )}
      </div>

      {/* Name & Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la capa *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nombre de la capa"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Descripción opcional"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || !name || isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <FileUp className="h-5 w-5" />
            Subir Capa
          </>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// URL Service Tab
// ============================================================================

const URLServiceTab: React.FC<{
  onSubmit: (data: any) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [serviceType, setServiceType] = useState<string>('wms');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [layers, setLayers] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  const serviceTypes = [
    { value: 'wms', label: 'WMS - Web Map Service', icon: '🗺️', example: 'https://example.com/wms' },
    { value: 'wfs', label: 'WFS - Web Feature Service', icon: '📍', example: 'https://example.com/wfs' },
    { value: 'wmts', label: 'WMTS - Web Map Tile Service', icon: '🔲', example: 'https://example.com/wmts' },
    { value: 'geojson', label: 'GeoJSON URL', icon: '📄', example: 'https://example.com/data.geojson' },
    { value: 'xyz', label: 'XYZ Tiles', icon: '🗾', example: 'https://example.com/tiles/{z}/{x}/{y}.png' },
  ];

  const selectedService = serviceTypes.find(s => s.value === serviceType);

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      service_type: serviceType,
      url,
      layers: layers || undefined,
      username: username || undefined,
      password: password || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Servicio *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {serviceTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setServiceType(type.value)}
              className={`p-3 text-left rounded-lg border-2 transition-all ${
                serviceType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-lg mr-2">{type.icon}</span>
              <span className="text-sm font-medium">{type.label.split(' - ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL del Servicio *
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={selectedService?.example || 'https://...'}
        />
        <p className="text-xs text-gray-500 mt-1">
          Ejemplo: {selectedService?.example}
        </p>
      </div>

      {/* Layer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Capa *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nombre para identificar la capa"
        />
      </div>

      {/* Layers (for WMS/WFS) */}
      {(serviceType === 'wms' || serviceType === 'wfs') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capas a cargar
          </label>
          <input
            type="text"
            value={layers}
            onChange={(e) => setLayers(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="capa1,capa2 (separadas por coma)"
          />
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Descripción opcional"
        />
      </div>

      {/* Authentication Toggle */}
      <button
        type="button"
        onClick={() => setShowAuth(!showAuth)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        {showAuth ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {showAuth ? 'Ocultar autenticación' : 'Agregar autenticación (opcional)'}
      </button>

      {showAuth && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!url || !name || isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Link className="h-5 w-5" />
            Conectar Servicio
          </>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// ArcGIS Tab
// ============================================================================

const ArcGISTab: React.FC<{
  onSubmit: (data: any) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [connectionType, setConnectionType] = useState<'url' | 'itemId'>('url');
  const [serviceUrl, setServiceUrl] = useState('');
  const [itemId, setItemId] = useState('');
  const [layerIndex, setLayerIndex] = useState(0);
  const [name, setName] = useState('');
  const [description] = useState('');
  const [token, setToken] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      service_url: connectionType === 'url' ? serviceUrl : undefined,
      item_id: connectionType === 'itemId' ? itemId : undefined,
      layer_index: layerIndex,
      token: token || undefined,
      sync_enabled: syncEnabled,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div className="text-sm text-orange-700">
          <p className="font-medium">Conectar con ArcGIS Online o Enterprise</p>
          <p className="mt-1">Puedes conectar usando la URL del servicio o el Item ID.</p>
        </div>
      </div>

      {/* Connection Type */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConnectionType('url')}
          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
            connectionType === 'url'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          Por URL
        </button>
        <button
          type="button"
          onClick={() => setConnectionType('itemId')}
          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
            connectionType === 'itemId'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          Por Item ID
        </button>
      </div>

      {/* URL or Item ID */}
      {connectionType === 'url' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL del Feature/Map Service *
          </label>
          <input
            type="url"
            value={serviceUrl}
            onChange={(e) => setServiceUrl(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://services.arcgis.com/.../FeatureServer"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ArcGIS Item ID *
          </label>
          <input
            type="text"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="a1b2c3d4e5f6..."
          />
        </div>
      )}

      {/* Layer Index */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Índice de Capa
        </label>
        <input
          type="number"
          min={0}
          value={layerIndex}
          onChange={(e) => setLayerIndex(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Índice de la capa dentro del servicio (0 = primera capa)
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Capa *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nombre para identificar la capa"
        />
      </div>

      {/* Token (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Token de Acceso (si es privado)
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Token de ArcGIS (opcional)"
        />
      </div>

      {/* Sync Option */}
      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
        <input
          type="checkbox"
          checked={syncEnabled}
          onChange={(e) => setSyncEnabled(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <div>
          <p className="font-medium text-gray-700">Habilitar sincronización</p>
          <p className="text-xs text-gray-500">Mantener la capa actualizada automáticamente</p>
        </div>
      </label>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={(!serviceUrl && !itemId) || !name || isLoading}
        className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Globe className="h-5 w-5" />
            Conectar ArcGIS
          </>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// Database Tab
// ============================================================================

const DatabaseTab: React.FC<{
  onSubmit: (data: any) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(5432);
  const [database, setDatabase] = useState('');
  const [schema, setSchema] = useState('public');
  const [table, setTable] = useState('');
  const [geometryColumn, setGeometryColumn] = useState('geom');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [description] = useState('');

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      host,
      port,
      database,
      schema,
      table,
      geometry_column: geometryColumn,
      username,
      password,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
        <Database className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
        <div className="text-sm text-purple-700">
          <p className="font-medium">Conexión a PostgreSQL/PostGIS</p>
          <p className="mt-1">Conecta directamente a tu base de datos espacial.</p>
        </div>
      </div>

      {/* Connection Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Host *
          </label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="localhost"
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Puerto
          </label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(parseInt(e.target.value) || 5432)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Base de Datos *
        </label>
        <input
          type="text"
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="nombre_bd"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schema
          </label>
          <input
            type="text"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="public"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tabla *
          </label>
          <input
            type="text"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="nombre_tabla"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Columna de Geometría
        </label>
        <input
          type="text"
          value={geometryColumn}
          onChange={(e) => setGeometryColumn(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="geom"
        />
      </div>

      {/* Credentials */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usuario *
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="postgres"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Layer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Capa *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Nombre para identificar la capa"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!host || !database || !table || !username || !password || !name || isLoading}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Database className="h-5 w-5" />
            Conectar Base de Datos
          </>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function LayerUpload({ onClose, onSuccess }: LayerUploadProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('file');

  // File Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => layerService.uploadLayer(formData),
    onSuccess: (data) => {
      toast.success('¡Capa cargada exitosamente!', `La capa "${data.name}" se ha agregado al sistema.`);
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      onSuccess?.();
      setTimeout(onClose, 1500);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al subir la capa';
      toast.error('Error al cargar capa', errorMsg);
    },
  });

  // URL Service Mutation
  const urlMutation = useMutation({
    mutationFn: (data: any) => layerService.createFromURL(data),
    onSuccess: (data) => {
      toast.success('¡Servicio conectado!', `La capa "${data.name}" se ha conectado exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      onSuccess?.();
      setTimeout(onClose, 1500);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al conectar el servicio';
      toast.error('Error de conexión', errorMsg);
    },
  });

  // ArcGIS Mutation
  const arcgisMutation = useMutation({
    mutationFn: (data: any) => layerService.createFromArcGIS(data),
    onSuccess: (data) => {
      toast.success('¡ArcGIS conectado!', `La capa "${data.name}" se ha importado exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      onSuccess?.();
      setTimeout(onClose, 1500);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al conectar con ArcGIS';
      toast.error('Error de conexión', errorMsg);
    },
  });

  // Database Mutation
  const databaseMutation = useMutation({
    mutationFn: (data: any) => layerService.createFromDatabase(data),
    onSuccess: (data) => {
      toast.success('¡Base de datos conectada!', `La capa "${data.name}" se ha importado exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      onSuccess?.();
      setTimeout(onClose, 1500);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al conectar con la base de datos';
      toast.error('Error de conexión', errorMsg);
    },
  });

  const isLoading = uploadMutation.isPending || urlMutation.isPending || arcgisMutation.isPending || databaseMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={!isLoading ? onClose : undefined}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Agregar Nueva Capa</h2>
                  <p className="text-blue-100 text-sm">Selecciona el origen de los datos</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <TabButton
                active={activeTab === 'file'}
                onClick={() => setActiveTab('file')}
                icon={<FileUp className="h-5 w-5" />}
                label="Archivo"
                description="SHP, GeoJSON, KML"
              />
              <TabButton
                active={activeTab === 'url'}
                onClick={() => setActiveTab('url')}
                icon={<Link className="h-5 w-5" />}
                label="Servicio Web"
                description="WMS, WFS, WMTS"
              />
              <TabButton
                active={activeTab === 'arcgis'}
                onClick={() => setActiveTab('arcgis')}
                icon={<Globe className="h-5 w-5" />}
                label="ArcGIS"
                description="Online/Enterprise"
              />
              <TabButton
                active={activeTab === 'database'}
                onClick={() => setActiveTab('database')}
                icon={<Database className="h-5 w-5" />}
                label="Base de Datos"
                description="PostgreSQL/PostGIS"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'file' && (
              <FileUploadTab
                onUpload={(formData) => uploadMutation.mutate(formData)}
                isLoading={uploadMutation.isPending}
              />
            )}
            {activeTab === 'url' && (
              <URLServiceTab
                onSubmit={(data) => urlMutation.mutate(data)}
                isLoading={urlMutation.isPending}
              />
            )}
            {activeTab === 'arcgis' && (
              <ArcGISTab
                onSubmit={(data) => arcgisMutation.mutate(data)}
                isLoading={arcgisMutation.isPending}
              />
            )}
            {activeTab === 'database' && (
              <DatabaseTab
                onSubmit={(data) => databaseMutation.mutate(data)}
                isLoading={databaseMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}