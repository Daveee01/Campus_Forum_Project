import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser, onAuthChange, subscribeNotifications } from '../lib/firebase';
import AuthModal from './AuthModal';
import Logo from './Logo';
import Notifications from './Notifications';
import { IconPlus, IconUser, IconLogin, IconLogout, IconBell } from './Icons';

type HeaderProps = {
  onSearch?: (query: string) => void;
  searchQuery?: string;
};

export default function Header({ onSearch, searchQuery = '' }: HeaderProps) {
  // state untuk menyimpan user saat ini (null kalau belum login)
  const [user, setUser] = useState<any>(null);
  // state untuk menampilkan modal auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  // state untuk menampilkan dropdown menu user
  const [showMenu, setShowMenu] = useState(false);
  // state untuk menampilkan dropdown notifikasi
  const [showNotifications, setShowNotifications] = useState(false);
  // state untuk unread notification count
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Pasang listener perubahan auth (Firebase atau fallback localStorage)
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      // callback akan dipanggil saat ada perubahan auth
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const unsub = subscribeNotifications(user.uid, (notifs) => {
      const unread = notifs.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    });

    return () => unsub();
  }, [user]);

  // Logout handler: panggil helper, lalu reset state lokal
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setShowMenu(false);
  };

  // Dipanggil setelah login/registrasi sukses dari modal
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  return (
    <>
      <header className="bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-40 shadow-lg shadow-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Branding: logo + teks */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo compact={false} />
          </Link>

          {/* Search Bar (only on home page) */}
          {isHomePage && onSearch && (
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Cari postingan..."
                  className="w-full px-4 py-2 pl-10 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Right-side navigation */}
          <nav className="flex items-center gap-3">
            {user ? (
              <>
                {/* Tombol buat post (hanya untuk pengguna login) */}
                <Link
                  to="/create"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors flex items-center gap-2"
                >
                  <IconPlus />
                  <span>Buat Post</span>
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowMenu(false);
                    }}
                    className="relative p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    aria-label="Notifications"
                  >
                    <IconBell />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <Notifications onClose={() => setShowNotifications(false)} />
                  )}
                </div>

                {/* Menu user (profil, logout) */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowMenu(!showMenu);
                      setShowNotifications(false);
                    }}
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-600/50"
                    aria-label="User menu"
                  >
                    {/* Gunakan icon user untuk tampilan ringkas */}
                    <IconUser />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl shadow-slate-950/50 animate-in fade-in zoom-in-95 duration-200">
                      <Link
                        to={`/profile/${user.uid}`}
                        className="block px-4 py-3 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        Profil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700 transition-colors border-t border-slate-700 flex items-center gap-2"
                      >
                        <IconLogout />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Jika belum login, tampilkan tombol untuk membuka modal auth
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-all text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-blue-600/50"
              >
                <IconLogin />
                <span>Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Modal login / register (komponen tersendiri) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
