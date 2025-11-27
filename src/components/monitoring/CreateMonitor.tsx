
interface CreateMonitorProps {

  onClose: () => void;

}



export default function CreateMonitor({ onClose }: CreateMonitorProps) {

  return (

    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">

      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">

        <div className="mt-3">

          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">

            Crear Nuevo Monitor

          </h3>

          <p className="text-sm text-gray-500 mb-4">

            Funcionalidad en desarrollo

          </p>

          <button

            onClick={onClose}

            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none"

          >

            Cerrar

          </button>

        </div>

      </div>

    </div>

  );

}

