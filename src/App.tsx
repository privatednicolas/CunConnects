import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { pb } from './lib/pb';
import type { Profile } from './lib/database.types';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Restaurar sesión si hay token guardado
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model as Profile);
    }
    setLoading(false);

    // Escuchar cambios de auth
    const unsub = pb.authStore.onChange((_token, model) => {
      setUser(model as Profile | null);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ children, showFooter = true }: { children: React.ReactNode; showFooter?: boolean }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout><Landing /></Layout>} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/registro" element={<Auth mode="register" />} />

            <Route path="/productos" element={<Layout><Products /></Layout>} />
            <Route path="/productos/nuevo" element={<Layout showFooter={false}><ProductForm /></Layout>} />
            <Route path="/productos/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/productos/:id/editar" element={<Layout showFooter={false}><ProductForm /></Layout>} />

            <Route path="/proyectos" element={<Layout><Projects /></Layout>} />
            <Route path="/proyectos/nuevo" element={<Layout showFooter={false}><ProjectForm /></Layout>} />
            <Route path="/proyectos/:id" element={<Layout><ProjectDetail /></Layout>} />
            <Route path="/proyectos/:id/editar" element={<Layout showFooter={false}><ProjectForm /></Layout>} />

            <Route path="/perfil" element={<Layout><Profile /></Layout>} />
            <Route path="/perfil/:id" element={<Layout><Profile /></Layout>} />

            <Route path="/dashboard" element={<Layout showFooter={false}><Dashboard /></Layout>} />

            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-black text-white/10 mb-4">404</p>
        <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-white/50 mb-6">La página que buscas no existe o fue movida.</p>
        <a href="/" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-medium rounded-xl transition-all">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
