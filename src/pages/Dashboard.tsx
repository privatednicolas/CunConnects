import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Rocket, ShoppingBag, Heart, Eye, TrendingUp, Bell, ArrowRight } from 'lucide-react';
import { pb, getFileUrl } from '../lib/pb';
import type { Project, Product, Notification } from '../lib/database.types';
import { useAuthStore } from '../store/useAuthStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CHART_DATA = [
  { name: 'Ene', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
  { name: 'Abr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    const [projRes, prodRes, notifRes] = await Promise.all([
      pb.collection('projects').getList<Project>(1, 5, {
        filter: `user = "${user!.id}"`,
        sort: '-created',
        expand: 'project_tags_via_project',
      }),
      pb.collection('products').getList<Product>(1, 5, {
        filter: `user = "${user!.id}"`,
        sort: '-created',
      }),
      pb.collection('notifications').getList<Notification>(1, 5, {
        filter: `user = "${user!.id}"`,
        sort: '-created',
      }),
    ]);
    setProjects(projRes.items);
    setProducts(prodRes.items);
    setNotifications(notifRes.items);
    setLoading(false);
  };

  const totalLikes = projects.reduce((s, p) => s + (p.likes_count || 0), 0);
  const totalRevenue = products.reduce((s, p) => s + p.price * (p.sales_count || 0), 0);
  const totalSales = products.reduce((s, p) => s + (p.sales_count || 0), 0);

  const markRead = async (id: string) => {
    await pb.collection('notifications').update(id, { read: true });
    setNotifications((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-black">
            Hola, <span className="text-orange-400">{user?.full_name?.split(' ')[0] || 'emprendedor'}</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">Aquí tienes un resumen de tu actividad</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Proyectos', value: projects.length, icon: <Rocket size={18} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', link: '/proyectos' },
            { label: 'Productos', value: products.length, icon: <ShoppingBag size={18} />, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', link: '/productos' },
            { label: 'Total Likes', value: totalLikes, icon: <Heart size={18} />, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
            { label: 'Ventas', value: totalSales, icon: <TrendingUp size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`p-5 rounded-2xl bg-gray-900 border ${stat.border} transition-all`}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>{stat.icon}</div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-white/50 text-sm mt-0.5">{stat.label}</p>
              {stat.link && (
                <Link to={stat.link} className="text-xs text-white/30 hover:text-white/60 transition-colors mt-1 inline-flex items-center gap-1">
                  Ver todos <ArrowRight size={10} />
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-gray-900 border border-white/8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold">Ingresos por mes</h2>
              <span className="text-orange-400 font-bold text-lg">${totalRevenue.toFixed(2)}</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={CHART_DATA} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-5 rounded-2xl bg-gray-900 border border-white/8">
            <h2 className="font-bold mb-5">Accesos rápidos</h2>
            <div className="space-y-2">
              <QuickAction to="/proyectos/nuevo" icon={<Rocket size={15} />} label="Crear Proyecto" desc="Lanza una nueva idea" color="bg-orange-500" />
              <QuickAction to="/productos/nuevo" icon={<ShoppingBag size={15} />} label="Agregar Producto" desc="Vende algo nuevo" color="bg-rose-500" />
              <QuickAction to="/perfil" icon={<Eye size={15} />} label="Ver Perfil" desc="Como te ven otros" color="bg-sky-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-gray-900 border border-white/8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Mis Proyectos</h2>
              <Link to="/proyectos" className="text-orange-400 text-xs hover:text-orange-300 transition-colors">Ver todos</Link>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-white/30 text-sm mb-3">No tienes proyectos aún</p>
                <Link to="/proyectos/nuevo" className="text-orange-400 text-sm hover:text-orange-300 transition-colors">Crear tu primer proyecto →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => {
                  const coverUrl = getFileUrl(p, p.cover);
                  return (
                    <Link key={p.id} to={`/proyectos/${p.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                        {coverUrl ? <img src={coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-500/20 flex items-center justify-center text-orange-400"><Rocket size={14} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-orange-400 transition-colors">{p.title}</p>
                        <p className="text-white/40 text-xs">{p.likes_count} likes · {p.views_count} vistas</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'launched' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
                        {p.status === 'launched' ? 'Lanzado' : 'En Dev'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-white/8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold">Notificaciones</h2>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={28} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/30 text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <button key={n.id} onClick={() => markRead(n.id)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors ${n.read ? 'opacity-50' : 'hover:bg-white/3'}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-white/20' : 'bg-orange-400'}`} />
                    <div>
                      <p className="text-sm">{n.message}</p>
                      <p className="text-white/30 text-xs mt-0.5">{format(new Date(n.created), "d 'de' MMM", { locale: es })}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {products.length > 0 && (
          <div className="mt-6 p-5 rounded-2xl bg-gray-900 border border-white/8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Mis Productos</h2>
              <Link to="/productos" className="text-orange-400 text-xs hover:text-orange-300 transition-colors">Ver todos</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {products.map((p) => {
                const imgUrl = p.images?.[0] ? getFileUrl(p, p.images[0]) : null;
                return (
                  <Link key={p.id} to={`/productos/${p.id}`} className="group flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/3 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                      {imgUrl ? <img src={imgUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-rose-500/20 flex items-center justify-center text-rose-400"><ShoppingBag size={12} /></div>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate group-hover:text-orange-400 transition-colors">{p.name}</p>
                      <p className="text-orange-400 text-xs font-bold">${p.price.toFixed(2)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label, desc, color }: { to: string; icon: React.ReactNode; label: string; desc: string; color: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 transition-all group">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-sm font-medium group-hover:text-white transition-colors">{label}</p>
        <p className="text-white/40 text-xs">{desc}</p>
      </div>
      <ArrowRight size={13} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
    </Link>
  );
}
