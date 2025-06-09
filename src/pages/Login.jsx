import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/lizeth.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-200 to-purple-200 p-0">
      <div className="w-full max-w-md flex justify-center items-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-pink-200 w-full max-w-sm">
          {/* Encabezado personalizado */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-r from-pink-400 via-pink-300 to-purple-300 p-8 pb-6">
            <img
              src={logo}
              alt="Logo"
              className="h-24 w-24 rounded-full shadow-lg mb-4 border-4 border-pink-200 bg-white object-cover"
              style={{ background: '#fff' }}
            />
            <h1 className="text-3xl font-extrabold text-white text-center tracking-wide font-[Poppins] drop-shadow-lg">
              Rutero Lizeth
            </h1>
            <p className="text-pink-100 mt-2 text-center text-base font-medium font-[Poppins]">
              Organiza y planea tus visitas diarias con estilo
            </p>
          </div>
          {/* Formulario */}
          <div className="p-8 pt-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-pink-50 text-pink-600 p-4 rounded-lg flex items-center text-sm border border-pink-200">
                  <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-2 font-[Poppins]">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-pink-300" />
                  </div>
                  <input
                    type="input"
                    className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors bg-pink-50 text-base font-[Poppins] placeholder-pink-300"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-2 font-[Poppins]">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-pink-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0v2m0 4h.01M17 16v-1a5 5 0 00-10 0v1m10 0a2 2 0 01-2 2H9a2 2 0 01-2-2" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors bg-pink-50 text-base font-[Poppins] placeholder-pink-300"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center items-center bg-gradient-to-r from-pink-500 via-pink-400 to-purple-400 text-white font-bold py-3 rounded-lg hover:from-pink-600 hover:to-purple-500 transition-colors shadow text-base font-[Poppins] drop-shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Entrar al Rutero'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
