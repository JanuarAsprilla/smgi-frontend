import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  MapIcon, 
  LayersIcon, 
  BrainCircuitIcon, 
  BellIcon, 
  LayoutDashboardIcon, 
  LogOutIcon, 
  PlayCircle, 
  AlertTriangleIcon, 
  Bot, 
  Users, 
  Map, 
  Database, 
  Settings,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar dropdowns al cambiar de ruta
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navegación agrupada por categorías
  const navigationGroups = {
    main: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
      { name: 'Mapa', href: '/map', icon: Map },
    ],
    geodata: [
      { name: 'Capas', href: '/layers', icon: LayersIcon },
      { name: 'Datos', href: '/data', icon: Database },
    ],
    analysis: [
      { name: 'Procesos', href: '/processes', icon: PlayCircle },
      { name: 'Análisis', href: '/analysis', icon: BrainCircuitIcon },
      { name: 'Agentes IA', href: '/agents', icon: Bot },
    ],
    monitoring: [
      { name: 'Monitoreo', href: '/monitoring', icon: BellIcon },
      { name: 'Alertas', href: '/alerts', icon: AlertTriangleIcon },
    ],
    system: [
      { name: 'Usuarios', href: '/admin/users', icon: Users },
      { name: 'Ajustes', href: '/settings/notifications', icon: Settings },
    ],
  };

  const isActive = (href: string) => location.pathname === href;
  const isGroupActive = (items: any[]) => items.some(item => isActive(item.href));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50" ref={navRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y Brand */}
            <div className="flex items-center">
              <div className="shrink-0 flex items-center">
                <MapIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">SMGI</span>
              </div>

              {/* Desktop Navigation - Enlaces principales + Dropdowns */}
              <div className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-1">
                {/* Dashboard - Enlace directo */}
                <Link
                  to="/"
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive('/')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboardIcon className="h-4 w-4 mr-1.5" />
                  Dashboard
                </Link>

                {/* Mapa - Enlace directo */}
                <Link
                  to="/map"
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive('/map')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Map className="h-4 w-4 mr-1.5" />
                  Mapa
                </Link>

                {/* Dropdown: Geodatos */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'geodata' ? null : 'geodata');
                    }}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isGroupActive(navigationGroups.geodata)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Database className="h-4 w-4 mr-1.5" />
                    Geodatos
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${openDropdown === 'geodata' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'geodata' && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1">
                      {navigationGroups.geodata.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isActive(item.href) 
                              ? 'text-blue-700 bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown: Análisis */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'analysis' ? null : 'analysis');
                    }}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isGroupActive(navigationGroups.analysis)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BrainCircuitIcon className="h-4 w-4 mr-1.5" />
                    Análisis
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${openDropdown === 'analysis' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'analysis' && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1">
                      {navigationGroups.analysis.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isActive(item.href) 
                              ? 'text-blue-700 bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown: Monitoreo */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'monitoring' ? null : 'monitoring');
                    }}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isGroupActive(navigationGroups.monitoring)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BellIcon className="h-4 w-4 mr-1.5" />
                    Monitoreo
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${openDropdown === 'monitoring' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'monitoring' && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1">
                      {navigationGroups.monitoring.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isActive(item.href) 
                              ? 'text-blue-700 bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown: Administración */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'system' ? null : 'system');
                    }}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isGroupActive(navigationGroups.system)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="h-4 w-4 mr-1.5" />
                    Admin
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${openDropdown === 'system' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'system' && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1">
                      {navigationGroups.system.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isActive(item.href) 
                              ? 'text-blue-700 bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center space-x-3">
              <span className="hidden md:block text-sm text-gray-700 font-medium">
                {user?.username || 'Usuario'}
              </span>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <LogOutIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Salir</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* Main */}
              {navigationGroups.main.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}

              {/* Geodatos Section */}
              <div className="pt-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Geodatos
                </div>
                {navigationGroups.geodata.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Análisis Section */}
              <div className="pt-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Análisis
                </div>
                {navigationGroups.analysis.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Monitoreo Section */}
              <div className="pt-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Monitoreo
                </div>
                {navigationGroups.monitoring.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Sistema Section */}
              <div className="pt-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Sistema
                </div>
                {navigationGroups.system.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile User Menu */}
              <div className="pt-4 border-t mt-4">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.username || 'Usuario'}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOutIcon className="h-4 w-4 mr-2" />
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
