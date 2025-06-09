import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProductoForm from '../components/productos/ProductoForm';
import ProductosList from '../components/productos/ProductosList';
import api from '../services/api';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productoActual, setProductoActual] = useState(null);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/productos');
      setProductos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleNuevoProducto = () => {
    setProductoActual(null);
    setShowForm(true);
  };

  const handleEditarProducto = (producto) => {
    setProductoActual(producto);
    setShowForm(true);
  };

  const handleEliminarProducto = async (id) => {
    try {
      await api.delete(`/productos/${id}`);
      setProductos(productos.filter(producto => producto._id !== id));
    } catch (err) {
      setError('Error al eliminar el producto');
      console.error(err);
    }
  };

  const handleGuardarProducto = async (producto) => {
    try {
      if (producto._id) {
        // Actualizar producto existente
        const response = await api.put(`/productos/${producto._id}`, producto);
        setProductos(productos.map(p => p._id === producto._id ? response.data : p));
      } else {
        // Crear nuevo producto
        const response = await api.post('/productos', producto);
        setProductos([...productos, response.data]);
      }
      setShowForm(false);
      setProductoActual(null);
    } catch (err) {
      setError('Error al guardar el producto');
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Productos</h2>
          <p className="mt-1 text-gray-600">Gestiona tu inventario de productos</p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <button
            onClick={fetchProductos}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={handleNuevoProducto}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Nuevo Producto
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
        <ProductoForm 
          producto={productoActual} 
          onGuardar={handleGuardarProducto} 
          onCancelar={() => setShowForm(false)} 
        />
      ) : (
        <ProductosList 
          productos={productos} 
          loading={loading} 
          onEditar={handleEditarProducto} 
          onEliminar={handleEliminarProducto} 
        />
      )}
    </DashboardLayout>
  );
}

export default Productos;