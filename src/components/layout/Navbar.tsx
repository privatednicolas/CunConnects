import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Plus, ShoppingBag, Menu, X, Bell, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const avatarLetter = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-950/90 backdrop-blur-xl border-b border-white/10 shadow-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Rocket size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Cun<span className="text-orange-400">Connects</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/productos">Productos</NavLink>
            <NavLink to="/proyectos">Proyectos</NavLink>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/proyectos/nuevo"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all"
                >
                  <Plus size={14} />
                  Proyecto
                </Link>
                <Link
                  to="/productos/nuevo"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-orange-500 hover:bg-orange-400 rounded-lg transition-all font-medium"
                >
                  <ShoppingBag size={14} />
                  Producto
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      avatarLetter
                    )}
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-white font-medium text-sm truncate">{profile?.full_name || 'Usuario'}</p>
                          <p className="text-white/40 text-xs truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <DropdownItem to="/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" />
                          <DropdownItem to="/perfil" icon={<User size={14} />} label="Mi Perfil" />
                          <DropdownItem to="/notificaciones" icon={<Bell size={14} />} label="Notificaciones" />
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <LogOut size={14} />
                            Cerrar Sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5">
                  Entrar
                </Link>
                <Link
                  to="/registro"
                  className="text-sm text-white bg-orange-500 hover:bg-orange-400 px-4 py-1.5 rounded-lg transition-all font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/70 hover:text-white transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-gray-950/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              <MobileNavLink to="/">Inicio</MobileNavLink>
              <MobileNavLink to="/productos">Productos</MobileNavLink>
              <MobileNavLink to="/proyectos">Proyectos</MobileNavLink>
              {user ? (
                <>
                  <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                  <MobileNavLink to="/perfil">Mi Perfil</MobileNavLink>
                  <MobileNavLink to="/proyectos/nuevo">+ Crear Proyecto</MobileNavLink>
                  <MobileNavLink to="/productos/nuevo">+ Agregar Producto</MobileNavLink>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login">Entrar</MobileNavLink>
                  <MobileNavLink to="/registro">Registrarse</MobileNavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`text-sm transition-colors ${
        active ? 'text-orange-400 font-medium' : 'text-white/70 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}

function DropdownItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
