import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiLogOut, FiChevronRight, FiX
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/lizeth.png';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/clientes', name: 'Clientes', icon: <FiUsers className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-pink-100 via-pink-200 to-purple-200 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo y botón de cerrar en móviles */}
          <div className="flex items-center justify-between border-b px-6 py-6 bg-white/60">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Logo" className="h-12 w-12 rounded-full border-2 border-pink-300 bg-white object-cover shadow" />
              <span className="text-xl font-bold text-pink-700 font-[Poppins] drop-shadow">Lizeth</span>
            </div>
            <button 
              className="rounded-full p-1 text-pink-500 hover:bg-pink-100"
              onClick={onClose}
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center rounded-md px-4 py-3 text-base font-medium transition-colors font-[Poppins] ${
                      location.pathname === item.path
                        ? 'bg-pink-200 text-pink-700 shadow'
                        : 'text-gray-700 hover:bg-pink-100'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                    {location.pathname === item.path && (
                      <FiChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Botón de cerrar sesión */}
          <div className="border-t p-4 bg-white/60">
            <button
              onClick={logout}
              className="flex w-full items-center rounded-md px-4 py-3 text-base font-medium text-pink-700 hover:bg-pink-100 font-[Poppins]"
            >
              <FiLogOut className="h-5 w-5" />
              <span className="ml-3">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
