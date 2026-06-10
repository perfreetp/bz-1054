import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Brands from '@/pages/Brands';
import Compare from '@/pages/Compare';
import PostDetail from '@/pages/PostDetail';
import VotePage from '@/pages/VotePage';
import Questions from '@/pages/Questions';
import Admin from '@/pages/Admin';
import LiveDashboard from '@/pages/LiveDashboard';
import { useStore } from '@/store';

export default function App() {
  const setTheme = useStore((s) => s.setTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'cyber' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/live-dashboard" element={<LiveDashboard />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}
