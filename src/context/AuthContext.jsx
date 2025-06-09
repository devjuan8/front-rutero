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
        // Verificar si el token ha expirado
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expirado
          localStorage.removeItem('token');
          setAuth({
            isAuthenticated: false,
            token: null,
            user: null,
            loading: false
          });
          return;
        }
        
        // Configurar el token en los headers para todas las peticiones
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verificar token con el backend (opcional pero recomendado)
        try {
          await api.get('/auth/verificar');
          
          // Si llegamos aquí, el token es válido
          setAuth({
            isAuthenticated: true,
            token,
            user: { id: decodedToken.id },
            loading: false
          });
        } catch (error) {
          // Error de verificación con el backend
          console.error('Error al verificar token con el backend:', error);
          localStorage.removeItem('token');
          setAuth({
            isAuthenticated: false,
            token: null,
            user: null,
            loading: false
          });
        }
      } catch (error) {
        // Error al decodificar el token (token inválido)
        console.error('Token inválido:', error);
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
