import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Heart, Eye, Rocket } from 'lucide-react';
import { pb, getFileUrl, imgOrDefault } from '../lib/pb';
import type { Project } from '../lib/database.types';
import { useAuthStore } from '../store/useAuthStore';

const STATUSES = ['Todos', 'En Desarrollo', 'Lanzado'];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const fetchProjects = async () => {
    setLoading(true);
    let filter = 'visibility = "public"';
    if (search) filter += ` && title ~ "${search}"`;
    if (status === 'En Desarrollo') filter += ' && status = "in_development"';
    if (status === 'Lanzado') filter += ' && status = "launched"';

    const res = await pb.collection('projects').getList<Project>(1, 50, {
      filter,
      sort: '-created',
      expand: 'user,project_tags_via_project,project_likes_via_project',
    });
    setProjects(res.items);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black mb-1">Proyectos</h1>
            <p className="text-white/50 text-sm">Descubre lo que la comunidad está construyendo</p>
          </div>
          {user && (
            <Link to="/proyectos/nuevo" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-medium rounded-xl transition-all text-sm">
              <Plus size={16} />Crear Proyecto
            </Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar proyectos..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl text-white placeholder-white/30 text-sm outline-none transition-colors" />
          </div>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${status === s ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Rocket size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No se encontraron proyectos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, i) => {
              const coverUrl = getFileUrl(project, project.cover);
              const ownerAvatar = project.expand?.user ? getFileUrl(project.expand.user, project.expand.user.avatar) : null;
              const tags = project.expand?.['project_tags_via_project'] || [];
              const likeCount = (project.expand?.['project_likes_via_project'] || []).length || project.likes_count;

              return (
                <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/proyectos/${project.id}`} className="group block rounded-2xl bg-gray-900 border border-white/8 hover:border-orange-500/30 overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                    <div className="h-44 overflow-hidden bg-gray-800">
                      <img src={imgOrDefault(coverUrl)} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">{project.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${project.status === 'launched' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
                          {project.status === 'launched' ? 'Lanzado' : 'En Dev'}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs line-clamp-2 mb-3">{project.short_description}</p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tags.slice(0, 3).map((t: {tag: string; id: string}) => (
                            <span key={t.id} className="text-xs text-orange-400 bg-orange-500/8 px-2 py-0.5 rounded-full">{t.tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          {ownerAvatar ? <img src={ownerAvatar} className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-orange-500/20" />}
                          <span className="text-white/40 text-xs">{project.expand?.user?.username || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/40 text-xs">
                          <span className="flex items-center gap-1"><Heart size={11} />{likeCount}</span>
                          <span className="flex items-center gap-1"><Eye size={11} />{project.views_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
