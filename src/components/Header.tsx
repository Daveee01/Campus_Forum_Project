import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, logoutUser, onAuthChange } from '../lib/firebase';
import AuthModal from './AuthModal';
import Logo from './Logo';
import { IconPlus, IconUser, IconLogin, IconLogout } from './Icons';

export default function Header() {
  // state untuk menyimpan user saat ini (null kalau belum login)
  const [user, setUser] = useState<any>(null);
  // state untuk menampilkan modal auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  // state untuk menampilkan dropdown menu user
  const [showMenu, setShowMenu] = useState(false);

  // Pasang listener perubahan auth (Firebase atau fallback localStorage)
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      // callback akan dipanggil saat ada perubahan auth
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

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
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Branding: logo + teks */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo compact={false} />
          </Link>

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

                {/* Menu user (profil, logout) */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-sm font-bold transition-colors"
                    aria-label="User menu"
                  >
                    {/* Gunakan icon user untuk tampilan ringkas */}
                    <IconUser />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                      <Link
                        to={`/profile/${user.uid}`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        Profil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors border-t border-slate-700 flex items-center gap-2"
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors text-sm flex items-center gap-2"
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
