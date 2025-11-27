export default function DemoBanner() {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-yellow-800">
          <span className="font-semibold">Modo Demo</span> - 
          Datos de prueba. Para conectar con el backend real, cambia DEMO_MODE a false en los servicios.
        </p>
      </div>
    </div>
  );
}
