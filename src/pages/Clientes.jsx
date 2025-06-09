import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ClienteForm from '../components/clientes/ClienteForm';
import ClientesList from '../components/clientes/ClientesList';
import api from '../services/api';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import logo from '../assets/lizeth.png';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [clienteActual, setClienteActual] = useState(null);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleNuevoCliente = () => {
    setClienteActual(null);
    setShowForm(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteActual(cliente);
    setShowForm(true);
  };

  const handleEliminarCliente = async (id) => {
    try {
      await api.delete(`/clientes/${id}`);
      setClientes(clientes.filter(cliente => cliente._id !== id));
    } catch (err) {
      setError('Error al eliminar el cliente');
      console.error(err);
    }
  };

  const handleGuardarCliente = async (cliente) => {
    try {
      if (cliente._id) {
        // Actualizar cliente existente
        const response = await api.put(`/clientes/${cliente._id}`, cliente);
        setClientes(clientes.map(c => c._id === cliente._id ? response.data : c));
      } else {
        // Crear nuevo cliente
        const response = await api.post('/clientes', cliente);
        setClientes([...clientes, response.data]);
      }
      setShowForm(false);
      setClienteActual(null);
    } catch (err) {
      setError('Error al guardar el cliente');
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3 mb-2">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-full border-2 border-pink-300 bg-white object-cover shadow" />
          <div>
            <h2 className="text-2xl font-extrabold text-pink-700 font-[Poppins] drop-shadow">Clientes</h2>
            <p className="mt-1 text-pink-500 font-medium">Gestiona la información de tus clientes y sus días de visita</p>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <button
            onClick={fetchClientes}
            className="inline-flex items-center rounded-md border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-700 shadow-sm hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 font-[Poppins]"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={handleNuevoCliente}
            className="inline-flex items-center rounded-md border border-transparent bg-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 font-[Poppins]"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-pink-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pink-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <ClienteForm 
          cliente={clienteActual} 
          onGuardar={handleGuardarCliente} 
          onCancelar={() => setShowForm(false)} 
        />
      ) : (
        <ClientesList 
          clientes={clientes} 
          loading={loading} 
          onEditar={handleEditarCliente} 
          onEliminar={handleEliminarCliente}
        />
      )}
    </DashboardLayout>
  );
}

export default Clientes;
