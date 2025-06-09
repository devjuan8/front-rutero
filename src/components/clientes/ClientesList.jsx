import { FiUser, FiEdit2, FiTrash2, FiMapPin, FiPhone } from 'react-icons/fi';

function ClientesList({ clientes, loading, onEditar, onEliminar }) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <span className="ml-2">Cargando clientes...</span>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <FiUser className="h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza agregando un nuevo cliente.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-pink-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-pink-100">
            <thead className="bg-pink-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-pink-700">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-pink-700">
                  Teléfono
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-pink-700">
                  Dirección
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-pink-700">
                  Días de visita
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-pink-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 bg-white">
              {clientes.map((cliente) => (
                <tr key={cliente._id} className="hover:bg-pink-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-pink-100 flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-pink-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-pink-800">{cliente.nombre}</div>
                        <div className="text-xs text-pink-400">
                          {cliente.createdAt ? new Date(new Date(cliente.createdAt).getTime() + (new Date().getTimezoneOffset() * 60000)).toLocaleDateString() : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {cliente.telefono && (
                      <div className="flex items-center text-sm text-pink-800">
                        <FiPhone className="mr-2 h-4 w-4 text-pink-400" />
                        {cliente.telefono}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {cliente.direccion && (
                      <div className="flex items-center text-sm text-pink-800">
                        <FiMapPin className="mr-2 h-4 w-4 text-pink-400" />
                        {cliente.direccion}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {cliente.diasDeVisita && cliente.diasDeVisita.length > 0 ? (
                        cliente.diasDeVisita.map((dia) => (
                          <span key={dia} className="bg-pink-100 text-pink-700 rounded px-2 py-0.5 text-xs font-medium">
                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-pink-400">Sin días</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditar(cliente)}
                        className="rounded bg-pink-50 p-1.5 text-pink-600 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEliminar(cliente._id)}
                        className="rounded bg-pink-50 p-1.5 text-red-500 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClientesList;