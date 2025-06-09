import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const DIAS_SEMANA = [
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'
];

function ClienteForm({ cliente, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    diasDeVisita: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        _id: cliente._id,
        nombre: cliente.nombre || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        diasDeVisita: cliente.diasDeVisita || [],
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleDiasChange = (dia) => {
    setFormData((prev) => {
      const dias = prev.diasDeVisita.includes(dia)
        ? prev.diasDeVisita.filter((d) => d !== dia)
        : [...prev.diasDeVisita, dia];
      return { ...prev, diasDeVisita: dias };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
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

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-pink-200">
      <div className="px-6 py-4 border-b border-pink-200 bg-gradient-to-r from-pink-100 to-purple-100">
        <h3 className="text-lg font-extrabold text-pink-700 font-[Poppins] drop-shadow">
          {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-pink-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-400 focus:ring-pink-400 sm:text-sm ${errors.nombre ? 'border-red-300' : ''}`}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-pink-700">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              id="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-400 focus:ring-pink-400 sm:text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="direccion" className="block text-sm font-medium text-pink-700">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              id="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-400 focus:ring-pink-400 sm:text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-pink-700 mb-1">
              Días de visita
            </label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map((dia) => (
                <label key={dia} className="inline-flex items-center text-sm text-pink-700">
                  <input
                    type="checkbox"
                    checked={formData.diasDeVisita.includes(dia)}
                    onChange={() => handleDiasChange(dia)}
                    className="form-checkbox text-pink-500 mr-1 focus:ring-pink-400"
                  />
                  {dia.charAt(0).toUpperCase() + dia.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex items-center rounded-md border border-pink-300 bg-white px-4 py-2 text-sm font-medium text-pink-700 shadow-sm hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            <FiX className="mr-2 h-4 w-4" />
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center rounded-md border border-transparent bg-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            <FiSave className="mr-2 h-4 w-4" />
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClienteForm;