import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';

// Componente protegido
const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Rutas de la aplicación
function AppRoutes() {
  const { auth, login } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={auth.isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} 
      />
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/clientes" 
        element={<ProtectedRoute><Clientes /></ProtectedRoute>} 
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
