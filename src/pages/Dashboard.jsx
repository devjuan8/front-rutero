import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import { FiCalendar, FiCheck, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const DIAS_SEMANA = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

function contarDiasSinDomingos(fechaInicio, fechaFin) {
  let dias = 0;
  let fecha = new Date(fechaInicio);
  fecha.setHours(0,0,0,0);
  const fin = new Date(fechaFin);
  fin.setHours(0,0,0,0);
  while (fecha < fin) {
    if (fecha.getDay() !== 0) dias++;
    fecha.setDate(fecha.getDate() + 1);
  }
  return dias;
}

function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [rutaHoy, setRutaHoy] = useState(null); // null mientras carga
  const [rutaManana, setRutaManana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [alertas, setAlertas] = useState([]);

  // Cargar todos los clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await api.get('/clientes');
        setClientes(res.data);
      } catch (err) {
        setError('Error al cargar clientes');
      }
    };
    fetchClientes();
  }, []);

  // Cargar rutas de hoy y mañana desde el backend
  const fetchRutas = async () => {
    setLoading(true);
    try {
      const [hoyRes, mananaRes] = await Promise.all([
        api.get('/ruta/hoy'),
        api.get('/ruta/manana'),
      ]);
      setRutaHoy(hoyRes.data);
      setRutaManana(mananaRes.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la ruta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  // Agregar cliente a la ruta de hoy (persistente)
  const agregarAlaRutaHoy = async (clienteId) => {
    if (!rutaHoy) return;
    setGuardando(true);
    try {
      const nuevosClientes = [
        ...((rutaHoy.clientes || []).map(c => ({ cliente: c.cliente._id || c.cliente, visitado: c.visitado })))
        , { cliente: clienteId, visitado: false }
      ];
      const res = await api.put('/ruta/hoy', { clientes: nuevosClientes });
      setRutaHoy(res.data);
    } catch (err) {
      setError('Error al agregar cliente a la ruta');
    } finally {
      setGuardando(false);
    }
  };

  // Quitar cliente de la ruta de hoy (persistente)
  const quitarDeRutaHoy = async (clienteId) => {
    if (!rutaHoy) return;
    setGuardando(true);
    try {
      const nuevosClientes = (rutaHoy.clientes || []).filter(c => (c.cliente._id || c.cliente) !== clienteId)
        .map(c => ({ cliente: c.cliente._id || c.cliente, visitado: c.visitado }));
      const res = await api.put('/ruta/hoy', { clientes: nuevosClientes });
      setRutaHoy(res.data);
    } catch (err) {
      setError('Error al quitar cliente de la ruta');
    } finally {
      setGuardando(false);
    }
  };

  // Marcar cliente como visitado (persistente)
  const marcarVisitado = async (clienteId) => {
    setGuardando(true);
    try {
      const res = await api.post('/ruta/hoy/visitado', { clienteId });
      setRutaHoy(res.data);
    } catch (err) {
      setError('Error al marcar como visitado');
    } finally {
      setGuardando(false);
    }
  };

  // Clientes que pueden agregarse a la ruta de hoy
  const clientesDisponibles = clientes.filter(c =>
    rutaHoy && !(rutaHoy.clientes || []).some(rc => (rc.cliente._id || rc.cliente) === c._id)
  );

  // Calcular clientes no visitados en más de 10 días (sin contar domingos)
  useEffect(() => {
    if (!clientes || !rutaHoy) return;
    // Buscar última visita de cada cliente en la ruta de hoy
    const hoy = new Date();
    const alertasClientes = clientes.map(cliente => {
      // Buscar si el cliente está en la ruta de hoy y fue visitado
      const enRutaHoy = (rutaHoy.clientes || []).find(rc => (rc.cliente._id || rc.cliente) === cliente._id);
      let ultimaVisita = null;
      if (enRutaHoy && enRutaHoy.visitado) {
        ultimaVisita = new Date(rutaHoy.fecha);
      } else if (cliente.ultimaVisita) {
        ultimaVisita = new Date(cliente.ultimaVisita);
      } else if (cliente.updatedAt) {
        ultimaVisita = new Date(cliente.updatedAt);
      }
      if (!ultimaVisita) return null;
      const diasSinVisita = contarDiasSinDomingos(ultimaVisita, hoy);
      if (diasSinVisita > 10) {
        return { nombre: cliente.nombre, dias: diasSinVisita };
      }
      return null;
    }).filter(Boolean);
    setAlertas(alertasClientes);
  }, [clientes, rutaHoy]);

  // Cargar rutas históricas para alertas de clientes no visitados
  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const rutasRes = await api.get('/ruta/todas');
        const rutas = rutasRes.data;
        // Mapear último día visitado por cliente
        const ultimoVisita = {};
        rutas.forEach(ruta => {
          (ruta.clientes || []).forEach(c => {
            if (c.visitado && c.cliente && c.cliente._id) {
              const id = c.cliente._id;
              if (!ultimoVisita[id] || new Date(ruta.fecha) > new Date(ultimoVisita[id])) {
                ultimoVisita[id] = ruta.fecha;
              }
            }
          });
        });
        // Calcular alertas
        const hoy = new Date();
        const alertasClientes = clientes.filter(cliente => {
          const last = ultimoVisita[cliente._id];
          if (!last) return true; // Nunca visitado
          const dias = contarDiasSinDomingos(last, hoy);
          return dias >= 10;
        });
        setAlertas(alertasClientes);
      } catch (err) {
        // No mostrar error, solo no mostrar alertas
        setAlertas([]);
      }
    };
    if (clientes.length > 0) fetchAlertas();
  }, [clientes, rutaHoy]);

  // Sugerencia de clientes para la ruta de mañana si no hay ruta persistida
  const getClientesSugeridosManana = () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const diaSemanaManana = DIAS_SEMANA[manana.getDay()];
    return clientes.filter(c => c.diasDeVisita && c.diasDeVisita.includes(diaSemanaManana));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-6">
        {/* ALERTAS DE CLIENTES */}
        {alertas.length > 0 && (
          <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-center mb-2">
              <FiAlertTriangle className="text-yellow-500 mr-2" />
              <span className="font-bold text-yellow-700">Clientes no visitados en más de 10 días</span>
            </div>
            <ul className="list-disc ml-6 text-yellow-800 text-sm">
              {alertas.map(c => (
                <li key={c._id}>{c.nombre}</li>
              ))}
            </ul>
          </div>
        )}
        <h2 className="text-2xl font-extrabold text-pink-700 mb-4 flex items-center gap-2 font-[Poppins]">
          <FiCalendar className="text-pink-400" /> Ruta de hoy
        </h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading || rutaHoy === null ? (
          <div className="text-pink-400">Cargando...</div>
        ) : (!rutaHoy.clientes || rutaHoy.clientes.length === 0) ? (
          <div className="text-pink-400">No hay clientes asignados para hoy.</div>
        ) : (
          <ul className="divide-y divide-pink-100 bg-white rounded-lg shadow mb-6">
            {rutaHoy.clientes.map((c, idx) => (
              <li key={c.cliente._id || c.cliente} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="font-medium text-pink-800">{c.cliente.nombre || clientes.find(cl => cl._id === (c.cliente._id || c.cliente))?.nombre}</span>
                  {c.visitado && <span className="ml-2 text-green-600 text-xs">Visitado</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => marcarVisitado(c.cliente._id || c.cliente)} disabled={c.visitado || guardando} className="px-2 py-1 bg-pink-500 text-white rounded disabled:opacity-50">Marcar visitado</button>
                  <button onClick={() => quitarDeRutaHoy(c.cliente._id || c.cliente)} className="text-red-400 hover:text-red-700"><FiTrash2 /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-pink-700 mb-2 font-[Poppins]">Agregar cliente a la ruta de hoy</h3>
          <div className="flex flex-wrap gap-2">
            {clientesDisponibles.map(c => (
              <button key={c._id} onClick={() => agregarAlaRutaHoy(c._id)} disabled={guardando} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-pink-200 disabled:opacity-40">{c.nombre}</button>
            ))}
          </div>
        </div>
        <h2 className="text-xl font-bold mt-8 mb-2 flex items-center text-pink-700 font-[Poppins]"><FiCalendar className="mr-2" /> Ruta de mañana</h2>
        <div className="space-y-2">
          {loading || rutaManana === null ? (
            <div className="text-pink-400">Cargando...</div>
          ) : (!rutaManana.clientes || rutaManana.clientes.length === 0) ? (
            <div>
              <div className="text-pink-400 mb-2">No hay clientes asignados para mañana.</div>
              <div className="bg-pink-50 border border-pink-200 rounded p-3">
                <div className="font-bold text-pink-700 mb-1">Sugerencia de clientes para mañana:</div>
                <ul className="list-disc ml-5 text-pink-700">
                  {getClientesSugeridosManana().length === 0 ? (
                    <li>No hay clientes con visita programada para mañana.</li>
                  ) : getClientesSugeridosManana().map(c => (
                    <li key={c._id}>{c.nombre}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-pink-100 bg-white rounded-lg shadow">
              {rutaManana.clientes.map(c => (
                <li key={c.cliente._id || c.cliente} className="px-4 py-2">{c.cliente.nombre || clientes.find(cl => cl._id === (c.cliente._id || c.cliente))?.nombre}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
