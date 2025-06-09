import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: true
  });

  const navigate = useNavigate();

  // Verificar token al cargar
  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuth({
          isAuthenticated: false,
          token: null,
          user: null,
          loading: false
        });
        return;
      }
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('token');
          setAuth({
            isAuthenticated: false,
            token: null,
            user: null,
            loading: false
          });
          return;
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Si tu backend NO tiene /auth/verificar, comenta el bloque siguiente:
        try {
          await api.get('/auth/verificar');
          setAuth({
            isAuthenticated: true,
            token,
            user: { id: decodedToken.id },
            loading: false
          });
        } catch (error) {
          // Si el error es 404, asumimos que el endpoint no existe y seguimos autenticado
          if (error.response && error.response.status === 404) {
            setAuth({
              isAuthenticated: true,
              token,
              user: { id: decodedToken.id },
              loading: false
            });
          } else {
            localStorage.removeItem('token');
            setAuth({
              isAuthenticated: false,
              token: null,
              user: null,
              loading: false
            });
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
        setAuth({
          isAuthenticated: false,
          token: null,
          user: null,
          loading: false
        });
      }
    };
    verificarToken();
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      const decodedToken = jwtDecode(token);
      setAuth({ 
        isAuthenticated: true, 
        token, 
        user: { id: decodedToken.id },
        loading: false 
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al decodificar token:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setAuth({ isAuthenticated: false, token: null, user: null, loading: false });
    navigate('/');
  };

  // Mostrar un loader mientras se verifica la autenticación
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
