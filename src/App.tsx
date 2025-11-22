import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import Seed from './pages/Seed';

export default function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header ditampilkan di semua halaman kecuali Home (Home punya Header sendiri dengan search) */}
      {!isHomePage && <Header />}
      <main className="flex-1 px-4">
        <div className="max-w-6xl mx-auto py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/seed" element={<Seed />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}
