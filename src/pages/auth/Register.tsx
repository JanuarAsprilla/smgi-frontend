import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '../../services';
import { MapIcon, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Info, Check, X } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    organization: '',
    department: '',
    position: '',
    access_justification: '',
    requested_role_id: '',
    requested_area_id: '',
  });

  // Evitar que las queries redirijan o recarguen la página
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: userService.getRoles,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: userService.getAreas,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const roles = rolesData?.results || rolesData || [];
  const areas = areasData?.results || areasData || [];

  const registerMutation = useMutation({
    mutationFn: userService.register,
    onSuccess: () => {
      // Esperar un momento antes de cambiar de paso para mostrar transición
      setTimeout(() => {
        setStep('success');
      }, 300);
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      const newErrors: Record<string, string> = {};
      
      // Mapear errores del backend a campos del formulario
      if (errorData) {
        Object.keys(errorData).forEach(key => {
          const message = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
          newErrors[key] = message;
        });
      }
      
      // Si no hay errores específicos de campo, mostrar error general
      if (Object.keys(newErrors).length === 0) {
        newErrors.general = error?.message || 'Error al registrar. Por favor intenta nuevamente.';
      }
      
      setErrors(newErrors);
      
      // Scroll al primer error
      setTimeout(() => {
        const firstError = document.querySelector('[data-error="true"]');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    },
  });

  // Validaciones en tiempo real
  const passwordValidation = useMemo(() => {
    const checks = {
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
    };
    return checks;
  }, [formData.password]);

  const passwordsMatch = formData.password === formData.password_confirm && formData.password.length > 0;

  // NO limpiar errores automáticamente para evitar recargas y redirecciones no deseadas

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Usuario es requerido';
        if (value.length < 3) return 'Usuario debe tener al menos 3 caracteres';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Usuario solo puede contener letras, números y guiones bajos';
        break;
      case 'email':
        if (!value.trim()) return 'Email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        break;
      case 'password':
        if (!value) return 'Contraseña es requerida';
        if (value.length < 8) return 'Contraseña debe tener al menos 8 caracteres';
        if (!passwordValidation.uppercase || !passwordValidation.lowercase || !passwordValidation.number) {
          return 'Contraseña debe incluir mayúsculas, minúsculas y números';
        }
        break;
      case 'password_confirm':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        break;
      case 'first_name':
      case 'last_name':
        if (!value.trim()) return 'Este campo es requerido';
        break;
      case 'access_justification':
        if (!value.trim()) return 'Justificación es requerida';
        if (value.length < 20) return 'Justificación debe tener al menos 20 caracteres';
        break;
      case 'requested_role_id':
        if (!value) return 'Debes seleccionar un rol';
        break;
    }
    return undefined;
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = formData[name as keyof typeof formData];
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir envío múltiple
    if (registerMutation.isPending) return;
    
    // Marcar todos los campos como touched
    const allFields = Object.keys(formData);
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    // Validar todos los campos requeridos
    const newErrors: Record<string, string> = {};
    const requiredFields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'access_justification', 'requested_role_id'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll al primer error
      setTimeout(() => {
        const firstError = document.querySelector('[data-error="true"]');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    // Preparar datos para envío
    const data = {
      ...formData,
      requested_role_id: parseInt(formData.requested_role_id),
      requested_area_id: formData.requested_area_id ? parseInt(formData.requested_area_id) : undefined,
    };
    
    registerMutation.mutate(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full animate-in zoom-in duration-300">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Registro Exitoso!
          </h2>
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Verificación de Email
              </p>
              <p className="text-sm text-blue-700">
                Hemos enviado un email de verificación a <strong>{formData.email}</strong>.
                Por favor revisa tu bandeja de entrada y haz click en el enlace.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-900 mb-2">
                Aprobación Pendiente
              </p>
              <p className="text-sm text-yellow-700">
                Tu cuenta será revisada por un administrador. Recibirás un email cuando sea aprobada.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Ir al Login
            </button>
            <button
              onClick={() => setStep('form')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Volver al Formulario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MapIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Registro SMGI</h1>
          <p className="text-gray-600 mt-2">Sistema de Monitoreo Geoespacial Inteligente</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error General */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-error="true">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Error en el registro</h4>
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información de Cuenta */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Información de Cuenta
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div data-error={errors.username ? "true" : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div data-error={errors.email ? "true" : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email && touched.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="col-span-2" data-error={errors.password ? "true" : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.password && touched.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      {passwordValidation.length ? (
                        <Check className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400 mr-1" />
                      )}
                      <span className={passwordValidation.length ? 'text-green-600' : 'text-gray-500'}>
                        Mínimo 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordValidation.uppercase && passwordValidation.lowercase ? (
                        <Check className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400 mr-1" />
                      )}
                      <span className={passwordValidation.uppercase && passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}>
                        Mayúsculas y minúsculas
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordValidation.number ? (
                        <Check className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400 mr-1" />
                      )}
                      <span className={passwordValidation.number ? 'text-green-600' : 'text-gray-500'}>
                        Al menos un número
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && touched.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="col-span-2" data-error={errors.password_confirm ? "true" : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password_confirm')}
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.password_confirm && touched.password_confirm
                        ? 'border-red-300 focus:ring-red-500'
                        : passwordsMatch && formData.password_confirm.length > 0
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordsMatch && formData.password_confirm.length > 0 && (
                  <p className="mt-1 text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Las contraseñas coinciden
                  </p>
                )}
                {errors.password_confirm && touched.password_confirm && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password_confirm}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Información Personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div data-error={errors.first_name ? "true" : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('first_name')}
                  autoComplete="given-name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.first_name && touched.first_name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Tu nombre"
                />
                {errors.first_name && touched.first_name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.first_name}
                  </p>
                )}
              </div>
              <div data-error={errors.last_name ? "true" : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('last_name')}
                  autoComplete="family-name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.last_name && touched.last_name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Tu apellido"
                />
                {errors.last_name && touched.last_name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.last_name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+57 300 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organización</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Rol y Área */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Acceso Solicitado
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div data-error={errors.requested_role_id ? "true" : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol Solicitado <span className="text-red-500">*</span>
                </label>
                <select
                  name="requested_role_id"
                  value={formData.requested_role_id}
                  onChange={handleChange}
                  onBlur={() => handleBlur('requested_role_id')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.requested_role_id && touched.requested_role_id
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Selecciona un rol</option>
                  {roles?.map((role: any) => (
                    role.role_type !== 'super_admin' && (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    )
                  ))}
                </select>
                {errors.requested_role_id && touched.requested_role_id && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.requested_role_id}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área (Opcional)</label>
                <select
                  name="requested_area_id"
                  value={formData.requested_area_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin área específica</option>
                  {areas?.map((area: any) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div data-error={errors.access_justification ? "true" : undefined}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justificación de Acceso <span className="text-red-500">*</span>
              </label>
              <textarea
                name="access_justification"
                value={formData.access_justification}
                onChange={handleChange}
                onBlur={() => handleBlur('access_justification')}
                rows={4}
                placeholder="Describe tu rol, responsabilidades y cómo utilizarás el sistema (mínimo 20 caracteres)..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none ${
                  errors.access_justification && touched.access_justification
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.access_justification && touched.access_justification ? (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.access_justification}
                  </p>
                ) : (
                  <p className={`text-xs ${
                    formData.access_justification.length >= 20 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {formData.access_justification.length >= 20 && (
                      <Check className="h-3 w-3 inline mr-1" />
                    )}
                    {formData.access_justification.length}/20 caracteres mínimos
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link 
              to="/login" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
            <button
              type="submit"
              disabled={registerMutation.isPending || registerMutation.isSuccess}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Registrando...
                </>
              ) : registerMutation.isSuccess ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  ¡Registro Exitoso!
                </>
              ) : (
                <>
                  Registrarse
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
