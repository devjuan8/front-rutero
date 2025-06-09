import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PedidoForm from '../components/pedidos/PedidoForm';
import PedidosList from '../components/pedidos/PedidosList';
import PedidoDetalle from '../components/pedidos/PedidoDetalle';
import api from '../services/api';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import Swal from 'sweetalert2';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [verDetalle, setVerDetalle] = useState(false);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pedidos');
      setPedidos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleNuevoPedido = () => {
    setShowForm(true);
    setVerDetalle(false);
  };

  const handleVerDetalle = (pedido) => {
    setPedidoSeleccionado(pedido);
    setVerDetalle(true);
    setShowForm(false);
  };

  const handleGuardarPedido = async (pedidoData) => {
    try {
      const response = await api.post('/pedidos', pedidoData);
      setPedidos([response.data, ...pedidos]);
      setShowForm(false);
      
      Swal.fire({
        title: '¡Pedido creado!',
        text: '¿Deseas descargar la factura ahora?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, descargar',
        cancelButtonText: 'No, más tarde'
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(`${api.defaults.baseURL}/pedidos/${response.data._id}/factura`, '_blank');
        }
      });
    } catch (err) {
      setError('Error al crear el pedido');
      console.error(err);
    }
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      const response = await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
      
      // Actualizar la lista de pedidos
      setPedidos(pedidos.map(pedido => 
        pedido._id === id ? { ...pedido, estado: nuevoEstado } : pedido
      ));
      
      // Si estamos viendo el detalle del pedido actualizado, actualizarlo también
      if (pedidoSeleccionado && pedidoSeleccionado._id === id) {
        setPedidoSeleccionado({ ...pedidoSeleccionado, estado: nuevoEstado });
      }
      
      Swal.fire({
        title: 'Estado actualizado',
        text: `El pedido ha sido ${nuevoEstado === 'completado' ? 'completado' : 'cancelado'} correctamente`,
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });
    } catch (err) {
      setError(`Error al ${nuevoEstado === 'completado' ? 'completar' : 'cancelar'} el pedido`);
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Pedidos</h2>
          <p className="mt-1 text-gray-600">Gestiona tus pedidos y genera facturas</p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <button
            onClick={fetchPedidos}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={handleNuevoPedido}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <PedidoForm 
          onGuardar={handleGuardarPedido} 
          onCancelar={() => setShowForm(false)} 
        />
      ) : verDetalle ? (
        <PedidoDetalle 
          pedido={pedidoSeleccionado} 
          onCerrar={() => setVerDetalle(false)} 
        />
      ) : (
        <PedidosList 
          pedidos={pedidos} 
          loading={loading} 
          onVerDetalle={handleVerDetalle}
          onActualizarEstado={handleActualizarEstado}
        />
      )}
    </DashboardLayout>
  );
}

export default Pedidos;