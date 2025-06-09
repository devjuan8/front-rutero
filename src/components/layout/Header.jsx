import { FiMenu } from 'react-icons/fi';
import logo from '../../assets/lizeth.png';

function Header({ onToggleSidebar }) {
  return (
    <header className="bg-gradient-to-r from-pink-100 via-pink-200 to-purple-200 border-b shadow-md">
      <div className="flex h-20 items-center justify-between px-4">
        <button
          className="rounded-full p-2 text-pink-500 hover:bg-pink-100 focus:outline-none border border-pink-200 shadow-sm"
          onClick={onToggleSidebar}
          aria-label="Abrir/cerrar menú"
        >
          <FiMenu className="h-7 w-7" />
        </button>

        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Logo"
            className="h-14 w-14 rounded-full border-4 border-pink-300 bg-white object-cover shadow-lg"
          />
          <span className="hidden md:inline-block text-2xl font-extrabold text-pink-700 tracking-wide drop-shadow-lg font-[Poppins]">
            Rutero Lizeth
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
