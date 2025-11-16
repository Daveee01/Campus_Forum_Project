// Profile page: shows public student data and allows the owner to edit their profile.
// Kini mengambil data nyata dari session (localStorage fallback) atau Firestore via helper.
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCurrentUser, fetchUserById } from '../lib/firebase';

export default function Profile() {
  const { userId } = useParams();
  const currentUser = getCurrentUser();
  const profileKey = userId || currentUser?.uid || currentUser?.email;

  const [user, setUser] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      // Jika tidak ada profileKey, gunakan currentUser langsung (mungkin anonymous)
      if (!profileKey) {
        if (mounted) {
          setUser(currentUser || null);
          setEditData(currentUser || null);
          setLoading(false);
        }
        return;
      }

      const u = await fetchUserById(profileKey);
      if (mounted) {
        // Jika tidak ketemu, fallback ke session
        const result = u ?? currentUser ?? null;
        setUser(result);
        setEditData(result);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [profileKey]);

  const isOwnProfile = Boolean(currentUser && user && (currentUser.uid === user.uid || currentUser.email === user.email));

  const handleSave = () => {
    // Sementara simpan lokal dulu. Nantinya update ke Firestore via helper baru.
    setUser(editData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Memuat profil...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-400">Profil tidak ditemukan.</div>
    );
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-6">
        ← Kembali
      </Link>

      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={user.avatar}
              alt={user.fullname}
              className="w-24 h-24 rounded-full border-2 border-blue-600"
            />
            {isOwnProfile && isEditing && (
              <button className="text-sm text-blue-400 hover:text-blue-300">
                Ubah Foto
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{user.fullname}</h1>
            <p className="text-gray-400 text-sm mb-4">@{user.username}</p>

            {isEditing && isOwnProfile ? (
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={editData?.bio || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Bio"
                />
              </div>
            ) : (
              <p className="text-gray-300 text-sm mb-4">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div>
                <div className="font-bold text-white">{user.posts ?? 0}</div>
                <div className="text-xs text-gray-400">Posts</div>
              </div>
              <div>
                <div className="font-bold text-white">{user.followers ?? 0}</div>
                <div className="text-xs text-gray-400">Followers</div>
              </div>
              <div>
                <div className="font-bold text-white">{user.following ?? 0}</div>
                <div className="text-xs text-gray-400">Following</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      ✓ Simpan
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
                    >
                      × Batal
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    Edit Profile
                  </button>
                )
              ) : (
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                    Follow
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Data Mahasiswa</h2>
        
        {isEditing && isOwnProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Nama Lengkap</label>
                <input
                  type="text"
                  value={editData?.fullname || ''}
                  onChange={(e) => setEditData({ ...editData, fullname: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Username</label>
                <input
                  type="text"
                  value={editData?.username || ''}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={editData?.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Universitas</label>
                <input
                  type="text"
                  value={editData?.university || ''}
                  onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Program Studi</label>
                <input
                  type="text"
                  value={editData?.major || ''}
                  onChange={(e) => setEditData({ ...editData, major: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Tahun Angkatan</label>
                <input
                  type="text"
                  value={editData?.year || ''}
                  onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">No. Telepon</label>
                <input
                  type="tel"
                  value={editData?.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Nama Lengkap</p>
              <p className="text-white font-medium">{user.fullname}</p>
            </div>
            <div>
              <p className="text-gray-400">Username</p>
              <p className="text-white font-medium">@{user.username}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-400">Universitas</p>
              <p className="text-white font-medium">{user.university}</p>
            </div>
            <div>
              <p className="text-gray-400">Program Studi</p>
              <p className="text-white font-medium">{user.major}</p>
            </div>
            <div>
              <p className="text-gray-400">Tahun Angkatan</p>
              <p className="text-white font-medium">{user.year}</p>
            </div>
            <div>
              <p className="text-gray-400">No. Telepon</p>
              <p className="text-white font-medium">{user.phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Posts */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Posting Terbaru</h2>
        <div className="text-center py-8 text-gray-500 text-sm">
          Fitur untuk melihat posts dari user segera hadir!
        </div>
      </div>
    </div>
  );
}
