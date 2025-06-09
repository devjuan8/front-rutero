import { useState } from 'react';
import { FiFileText, FiPrinter, FiClipboard, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import api from '../../services/api';

function PedidosList({ pedidos, loading, onVerDetalle, onActualizarEstado }) {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  const pedidosFiltrados = filtroEstado === 'todos' 
    ? pedidos 
    : pedidos.filter(pedido => pedido.estado === filtroEstado);

  const descargarFactura = async (id) => {
    try {
      window.open(`${api.defaults.baseURL}/pedidos/${id}/factura`, '_blank');
    } catch (error) {
      console.error('Error al descargar factura:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar la factura'
      });
    }
  };

  const descargarOrdenTrabajo = async (id) => {
    try {
      window.open(`${api.defaults.baseURL}/pedidos/${id}/orden-trabajo`, '_blank');
    } catch (error) {
      console.error('Error al descargar orden de trabajo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar la orden de trabajo'
      });
    }
  };

  const confirmarCambioEstado = (id, nuevoEstado) => {
    const textoEstado = nuevoEstado === 'completado' ? 'completar' : 'cancelar';
    
    Swal.fire({
      title: `¿${nuevoEstado === 'completado' ? 'Completar' : 'Cancelar'} pedido?`,
      text: `¿Estás seguro de ${textoEstado} este pedido?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: nuevoEstado === 'completado' ? '#3085d6' : '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${textoEstado}`,
      cancelButtonText: 'No, volver'
    }).then((result) => {
      if (result.isConfirmed) {
        onActualizarEstado(id, nuevoEstado);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <span className="ml-2">Cargando pedidos...</span>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <FiFileText className="h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo pedido.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Filtros */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filtroEstado === 'todos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Todos ({pedidos.length})
          </button>
          <button
            onClick={() => setFiltroEstado('pendiente')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filtroEstado === 'pendiente'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pendientes ({pedidos.filter(p => p.estado === 'pendiente').length})
          </button>
          <button
            onClick={() => setFiltroEstado('completado')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filtroEstado === 'completado'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completados ({pedidos.filter(p => p.estado === 'completado').length})
          </button>
          <button
            onClick={() => setFiltroEstado('cancelado')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filtroEstado === 'cancelado'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelados ({pedidos.filter(p => p.estado === 'cancelado').length})
          </button>
        </nav>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center p-12 text-center">
          <FiFileText className="h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos {filtroEstado !== 'todos' ? filtroEstado + 's' : ''}</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pedido
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{pedido._id.substring(0, 8)}...</div>
                    <div className="text-xs text-gray-500">{pedido.items.length} productos</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {pedido.nombreCliente || (pedido.cliente && pedido.cliente.nombre) || 'Cliente no disponible'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(pedido.fechaCreacion).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ${pedido.total.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      pedido.estado === 'pendiente' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : pedido.estado === 'completado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {pedido.estado === 'pendiente' 
                        ? 'Pendiente' 
                        : pedido.estado === 'completado'
                          ? 'Completado'
                          : 'Cancelado'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onVerDetalle(pedido)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => descargarFactura(pedido._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Descargar factura"
                      >
                        <FiPrinter className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => descargarOrdenTrabajo(pedido._id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Descargar orden de trabajo"
                      >
                        <FiClipboard className="h-5 w-5" />
                      </button>
                      
                      {pedido.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => confirmarCambioEstado(pedido._id, 'completado')}
                            className="text-green-600 hover:text-green-900"
                            title="Marcar como completado"
                          >
                            <FiCheckCircle className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => confirmarCambioEstado(pedido._id, 'cancelado')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancelar pedido"
                          >
                            <FiXCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PedidosList;