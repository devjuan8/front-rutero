import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

function ProductoForm({ producto, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precioMayoreo: '',
    imagen: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (producto) {
      setFormData({
        _id: producto._id,
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio || '',
        precioMayoreo: producto.precioMayoreo || '',
        imagen: producto.imagen || ''
      });
    }
  }, [producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.precio || isNaN(formData.precio) || Number(formData.precio) < 0) {
      newErrors.precio = 'El precio debe ser un número positivo';
    }
    
    if (formData.precioMayoreo && (isNaN(formData.precioMayoreo) || Number(formData.precioMayoreo) < 0)) {
      newErrors.precioMayoreo = 'El precio de mayoreo debe ser un número positivo';
    }
    
   
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convertir valores numéricos
      const productoData = {
        ...formData,
        precio: Number(formData.precio),
        precioMayoreo: formData.precioMayoreo ? Number(formData.precioMayoreo) : undefined
      };
      
      onGuardar(productoData);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {producto ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.nombre ? 'border-red-300' : ''
              }`}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
              Precio <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="precio"
                id="precio"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                className={`pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.precio ? 'border-red-300' : ''
                }`}
              />
            </div>
            {errors.precio && (
              <p className="mt-1 text-sm text-red-600">{errors.precio}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="precioMayoreo" className="block text-sm font-medium text-gray-700">
              Precio Mayoreo
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="precioMayoreo"
                id="precioMayoreo"
                min="0"
                step="0.01"
                value={formData.precioMayoreo}
                onChange={handleChange}
                className={`pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.precioMayoreo ? 'border-red-300' : ''
                }`}
              />
            </div>
            {errors.precioMayoreo && (
              <p className="mt-1 text-sm text-red-600">{errors.precioMayoreo}</p>
            )}
          </div>
          
         
          
          <div className="sm:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="descripcion"
              id="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            ></textarea>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
              URL de Imagen
            </label>
            <input
              type="text"
              name="imagen"
              id="imagen"
              value={formData.imagen}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {formData.imagen && (
              <div className="mt-2">
                <img 
                  src={formData.imagen} 
                  alt="Vista previa" 
                  className="h-32 w-32 object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen';
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
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
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductoForm;