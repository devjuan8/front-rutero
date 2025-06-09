import { FiX, FiPrinter, FiClipboard, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useState } from 'react';

function PedidoDetalle({ pedido, onCerrar }) {
  const [pedidoActualizado, setPedidoActualizado] = useState(pedido);

  const totalAbonado = pedidoActualizado.abonos?.reduce((acc, a) => acc + a.monto, 0) || 0;
  const saldoRestante = pedidoActualizado.total - totalAbonado;

  const registrarAbono = async () => {
    const result = await Swal.fire({
      title: 'Registrar abono',
      input: 'number',
      inputLabel: 'Monto del abono',
      inputPlaceholder: 'Ej: 10000',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
    });

    const monto = parseFloat(result.value);
    if (result.isConfirmed && !isNaN(monto) && monto > 0) {
      try {
        const res = await api.post(`/pedidos/${pedidoActualizado._id}/abono`, { monto });
        setPedidoActualizado(res.data);

        Swal.fire('Abono registrado', '', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', error.response?.data?.error || 'Error al registrar abono', 'error');
      }
    }
  };


  const descargarFactura = async () => {
    try {
      window.open(`${api.defaults.baseURL}/pedidos/${pedido._id}/factura`, '_blank');
    } catch (error) {
      console.error('Error al descargar factura:', error);
    }
  };

  const descargarOrdenTrabajo = async () => {
    try {
      window.open(`${api.defaults.baseURL}/pedidos/${pedido._id}/orden-trabajo`, '_blank');
    } catch (error) {
      console.error('Error al descargar orden de trabajo:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900">
          Detalles del Pedido
        </h3>
        <button
          onClick={onCerrar}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>

      <div className="px-6 py-4">
        {/* Información general */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">ID del Pedido</h4>
            <p className="mt-1 text-sm text-gray-900">{pedido._id}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Fecha</h4>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(pedido.fechaCreacion).toLocaleString()}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Estado</h4>
            <p className="mt-1">
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${pedido.estado === 'pendiente'
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
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Total</h4>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              ${pedido.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="mt-6">
          <h4 className="text-base font-medium text-gray-900">Información del Cliente</h4>
          <div className="mt-2 border-t border-gray-200 pt-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {pedido.cliente?.nombre || pedido.nombreCliente || 'No disponible'}
                </dd>
              </div>
              {pedido.cliente?.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{pedido.cliente.email}</dd>
                </div>
              )}
              {pedido.cliente?.telefono && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd className="mt-1 text-sm text-gray-900">{pedido.cliente.telefono}</dd>
                </div>
              )}
              {pedido.cliente?.direccion && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                  <dd className="mt-1 text-sm text-gray-900">{pedido.cliente.direccion}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Productos */}
        <div className="mt-6">
          <h4 className="text-base font-medium text-gray-900">Productos</h4>
          <div className="mt-2 border-t border-gray-200 pt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Producto
                  </th>
                  <th scope="col" className="py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cantidad
                  </th>
                  <th scope="col" className="py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Precio
                  </th>
                  <th scope="col" className="py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedido.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 text-sm text-gray-900">
                      <div className="font-medium">{item.nombre}</div>
                      {item.esMayoreo && (
                        <span className="text-xs text-blue-600">Precio mayoreo</span>
                      )}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-500">
                      {item.cantidad}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-500">
                      ${item.precioUnitario.toFixed(2)}
                    </td>
                    <td className="py-4 text-right text-sm font-medium text-gray-900">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="3" className="py-4 text-right text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="py-4 text-right text-base font-semibold text-gray-900">
                    ${pedido.total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Abonos */}
        <div className="mt-6">
          <h4 className="text-base font-medium text-gray-900">Abonos</h4>
          <div className="mt-2 border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-700">
            {pedidoActualizado.abonos?.length > 0 ? (
              pedidoActualizado.abonos.map((abono, index) => (
                <div key={index} className="flex justify-between">
                  <span>{new Date(abono.fecha).toLocaleDateString()}</span>
                  <span>${abono.monto.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aún no hay abonos registrados</p>
            )}

            <div className="border-t border-gray-200 pt-3">
              <p><strong>Total abonado:</strong> ${totalAbonado.toFixed(2)}</p>
              <p><strong>Saldo restante:</strong> ${saldoRestante.toFixed(2)}</p>
            </div>
          </div>
        </div>


        {/* Notas */}
        {pedido.notas && (
          <div className="mt-6">
            <h4 className="text-base font-medium text-gray-900">Notas</h4>
            <div className="mt-2 rounded-md bg-gray-50 p-4">
              <p className="text-sm text-gray-700">{pedido.notas}</p>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex justify-end space-x-3">
          <button
            onClick={registrarAbono}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiCheck className="mr-2 h-4 w-4" />
            Registrar Abono
          </button>
          <button
            onClick={descargarOrdenTrabajo}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiClipboard className="mr-2 h-4 w-4" />
            Orden de Trabajo
          </button>
          <button
            onClick={descargarFactura}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiPrinter className="mr-2 h-4 w-4" />
            Descargar Factura
          </button>
        </div>
      </div>
    </div>
  );
}

export default PedidoDetalle;