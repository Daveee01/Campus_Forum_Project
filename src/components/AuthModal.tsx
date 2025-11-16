// AuthModal: unified login / register modal used across the app.
// - `mode` toggles between 'login' and 'register'
// - On successful auth it calls `onAuthSuccess` (Header listens and updates UI)
// The modal uses the small auth helpers exported from `src/lib/firebase.ts`.
import { useState, ReactElement } from "react";
import { loginUser, registerUser } from "../lib/firebase";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
};

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}: AuthModalProps): ReactElement | null {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [major, setMajor] = useState("");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Panggil helper login dari `src/lib/firebase.ts`.
      // Jika sukses, beri tahu parent lewat `onAuthSuccess` supaya UI header ter-refresh.
      await loginUser(email, password);
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Login gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username minimal 3 karakter");
      return;
    }

    setLoading(true);
    try {
      // Registrasi: kirim seluruh data mahasiswa sebagai satu objek.
      // registerUser akan menangani penyimpanan di Firestore atau localStorage (fallback).
      await registerUser({
        email,
        password,
        username,
        fullname,
        major,
        university,
        year,
        phone,
      });

      // Setelah registrasi sukses, beri tahu parent dan tutup modal.
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Registrasi gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "login" ? "Login" : "Daftar"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm focus:border-blue-500"
                  placeholder="nama@kampus.ac.id"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm focus:border-blue-500"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm"
                    placeholder="Nama"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm"
                  placeholder="nama@kampus.ac.id"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Universitas
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm"
                  placeholder="Universitas"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Program Studi
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm"
                    placeholder="Jurusan"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Tahun
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm"
                  >
                    <option value="">Pilih Tahun</option>
                    <option value="2024">Tahun 1 (2024)</option>
                    <option value="2023">Tahun 2 (2023)</option>
                    <option value="2022">Tahun 3 (2022)</option>
                    <option value="2021">Tahun 4 (2021)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm"
                  placeholder="08xx"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Konfirmasi
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>
          )}

          {/* Toggle */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center text-sm text-gray-400">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Daftar di sini
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
