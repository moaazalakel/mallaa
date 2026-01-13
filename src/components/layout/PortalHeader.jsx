import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { IoLogOutOutline, IoMenu } from 'react-icons/io5';
import { useEffect, useRef, useState } from 'react';

const PortalHeader = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!showUserMenu) return;

    const onPointerDown = (e) => {
      const el = userMenuRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setShowUserMenu(false);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showUserMenu]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-40" dir="rtl">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <IoMenu size={24} className="text-[#211551]" />
          </button>
          <Link to="/" className="text-2xl font-bold text-[#211551]">
            منصة الملاءة
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="text-right">
                <div className="text-sm font-medium text-[#211551]">{user?.name || user?.username}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <IoLogOutOutline size={18} />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;
