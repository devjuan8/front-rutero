import { useState, useEffect } from 'react';
import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';

function PedidoForm({ onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    cliente: '',
    items: [{ producto: '', cantidad: 1, esMayoreo: false }],
    notas: ''
  });
  
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errors, setErrors] = useState({});
  const [total, setTotal] = useState(0);

  // Cargar clientes y productos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, productosRes] = await Promise.all([
          api.get('/clientes'),
          api.get('/productos')
        ]);
        
        setClientes(clientesRes.data.filter(c => c.estado === 'activo'));
        setProductos(productosRes.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoadingClientes(false);
        setLoadingProductos(false);
      }
    };
    
    fetchData();
  }, []);

  // Calcular total cuando cambian los items
  useEffect(() => {
    calcularTotal();
  }, [formData.items]);

  const calcularTotal = () => {
    let nuevoTotal = 0;
    
    formData.items.forEach(item => {
      if (item.producto && item.cantidad) {
        const productoSeleccionado = productos.find(p => p._id === item.producto);
        if (productoSeleccionado) {
          const precio = item.esMayoreo && productoSeleccionado.precioMayoreo 
            ? productoSeleccionado.precioMayoreo 
            : productoSeleccionado.precio;
          
          nuevoTotal += precio * item.cantidad;
        }
      }
    });
    
    setTotal(nuevoTotal);
  };

  const handleClienteChange = (e) => {
    setFormData({
      ...formData,
      cliente: e.target.value
    });
    
    if (errors.cliente) {
      setErrors({
        ...errors,
        cliente: null
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Si cambia el producto o el tipo de precio, actualizar el precio unitario
    if (field === 'producto' || field === 'esMayoreo') {
      const productoSeleccionado = productos.find(p => p._id === (field === 'producto' ? value : newItems[index].producto));
      if (productoSeleccionado) {
        // Solo actualizar el tipo de precio, el cálculo del subtotal se hace en calcularTotal
        newItems[index].esMayoreo = field === 'esMayoreo' ? value : newItems[index].esMayoreo;
      }
    }
    
    setFormData({
      ...formData,
      items: newItems
    });
    
    // Limpiar errores
    if (errors.items && errors.items[index] && errors.items[index][field]) {
      const newErrors = { ...errors };
      newErrors.items[index][field] = null;
      setErrors(newErrors);
    }
  };

  const agregarItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { producto: '', cantidad: 1, esMayoreo: false }]
    });
  };

  const eliminarItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      setFormData({
        ...formData,
        items: newItems
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cliente) {
      newErrors.cliente = 'Debe seleccionar un cliente';
    }
    
    const itemErrors = [];
    let hasItemErrors = false;
    
    formData.items.forEach((item, index) => {
      const itemError = {};
      
      if (!item.producto) {
        itemError.producto = 'Debe seleccionar un producto';
        hasItemErrors = true;
      }
      
      if (!item.cantidad || item.cantidad < 1) {
        itemError.cantidad = 'La cantidad debe ser mayor a 0';
        hasItemErrors = true;
      }
      
      itemErrors[index] = itemError;
    });
    
    if (hasItemErrors) {
      newErrors.items = itemErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onGuardar(formData);
    }
  };

  if (loadingClientes || loadingProductos) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900">Nuevo Pedido</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Selección de cliente */}
        <div className="mb-6">
          <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">
            Cliente <span className="text-red-500">*</span>
          </label>
          <select
            id="cliente"
            name="cliente"
            value={formData.cliente}
            onChange={handleClienteChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.cliente ? 'border-red-300' : ''
            }`}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map(cliente => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
          {errors.cliente && (
            <p className="mt-1 text-sm text-red-600">{errors.cliente}</p>
          )}
        </div>
        
        {/* Lista de productos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Productos</h4>
            <button
              type="button"
              onClick={agregarItem}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiPlus className="mr-1 h-4 w-4" />
              Agregar producto
            </button>
          </div>
          
          {formData.items.map((item, index) => (
            <div key={index} className="mb-4 rounded-md border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                {/* Producto */}
                <div className="sm:col-span-5">
                  <label htmlFor={`producto-${index}`} className="block text-sm font-medium text-gray-700">
                    Producto <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`producto-${index}`}
                    value={item.producto}
                    onChange={(e) => handleItemChange(index, 'producto', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.items && errors.items[index] && errors.items[index].producto ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map(producto => (
                      <option key={producto._id} value={producto._id}>
                        {producto.nombre} - ${producto.precio.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {errors.items && errors.items[index] && errors.items[index].producto && (
                    <p className="mt-1 text-sm text-red-600">{errors.items[index].producto}</p>
                  )}
                </div>
                
                {/* Cantidad */}
                <div className="sm:col-span-2">
                  <label htmlFor={`cantidad-${index}`} className="block text-sm font-medium text-gray-700">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id={`cantidad-${index}`}
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || '')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.items && errors.items[index] && errors.items[index].cantidad ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.items && errors.items[index] && errors.items[index].cantidad && (
                    <p className="mt-1 text-sm text-red-600">{errors.items[index].cantidad}</p>
                  )}
                </div>
                
                {/* Precio mayoreo */}
                <div className="sm:col-span-3">
                  <div className="flex items-center h-full mt-6">
                    <input
                      type="checkbox"
                      id={`mayoreo-${index}`}
                      checked={item.esMayoreo}
                      onChange={(e) => handleItemChange(index, 'esMayoreo', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`mayoreo-${index}`} className="ml-2 block text-sm text-gray-700">
                      Precio mayoreo
                    </label>
                  </div>
                </div>
                
                {/* Subtotal */}
                <div className="sm:col-span-1">
                  {item.producto && (
                    <div className="flex items-center h-full mt-6 justify-end">
                      <button
                        type="button"
                        onClick={() => eliminarItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Información de precio */}
                {item.producto && (
                  <div className="sm:col-span-12 mt-2">
                    <div className="text-sm text-gray-500">
                      {(() => {
                        const productoSeleccionado = productos.find(p => p._id === item.producto);
                        if (productoSeleccionado) {
                          const precio = item.esMayoreo && productoSeleccionado.precioMayoreo 
                            ? productoSeleccionado.precioMayoreo 
                            : productoSeleccionado.precio;
                          
                          const subtotal = precio * item.cantidad;
                          
                          return (
                            <>
                              Precio unitario: ${precio.toFixed(2)} × {item.cantidad} = ${subtotal.toFixed(2)}
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Notas */}
        <div className="mb-6">
          <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
            Notas o instrucciones especiales
          </label>
          <textarea
            id="notas"
            name="notas"
            rows="3"
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          ></textarea>
        </div>
        
        {/* Total */}
        <div className="mb-6 rounded-md bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Total:</span>
            <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiX className="mr-2 h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiSave className="mr-2 h-4 w-4" />
              Guardar Pedido
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  export default PedidoForm;