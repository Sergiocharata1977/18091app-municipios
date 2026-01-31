import { useAuth } from '@/contexts/AuthContext';
import { Clock, LogOut, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface PersonnelInfo {
  nombres: string;
  apellidos: string;
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [personnelInfo, setPersonnelInfo] = useState<PersonnelInfo | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Fetch personnel info if user has personnel_id
  useEffect(() => {
    async function fetchPersonnelInfo() {
      if (!user?.personnel_id) return;

      try {
        const response = await fetch(
          `/api/rrhh/personnel/${user.personnel_id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setPersonnelInfo({
              nombres: data.data.nombres,
              apellidos: data.data.apellidos,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching personnel info:', error);
      }
    }

    fetchPersonnelInfo();
  }, [user?.personnel_id]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  if (!user) return null;

  // Get first letter of email or name for avatar
  const avatarLetter = personnelInfo
    ? personnelInfo.nombres.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U';

  // Display name: personnel full name or email
  const displayName = personnelInfo
    ? `${personnelInfo.nombres} ${personnelInfo.apellidos}`
    : user.email;

  return (
    <div className="relative" ref={menuRef}>
      {/* User Info + Avatar Button */}
      <div className="flex items-center gap-3">
        {/* User Name/Email */}
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
            {displayName}
          </p>
          {personnelInfo && (
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {user.email}
            </p>
          )}
        </div>

        {/* Avatar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
          aria-label="Menú de usuario"
        >
          {avatarLetter}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
            {personnelInfo && (
              <p className="text-xs text-emerald-600 mt-1">
                ✓ Vinculado a Personal
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation('/mi-contexto')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
            >
              <User className="w-4 h-4 text-emerald-600" />
              Mi Contexto
            </button>

            <button
              onClick={() => handleNavigation('/historial-conversaciones')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              Historial de Conversaciones
            </button>

            <button
              onClick={() => handleNavigation('/perfil')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
            >
              <Settings className="w-4 h-4 text-emerald-600" />
              Mi Perfil
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
