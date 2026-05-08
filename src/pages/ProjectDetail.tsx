import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ArrowLeft, Github, ExternalLink, Edit, Trash2, Send, Share2 } from 'lucide-react';
import { pb, getFileUrl, imgOrDefault } from '../lib/pb';
import type { Project, Comment } from '../lib/database.types';
import { useAuthStore } from '../store/useAuthStore';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await pb.collection('projects').getOne<Project>(id!, {
        expand: 'user,project_tags_via_project',
      });
      setProject(data);
      setLikeCount(data.likes_count || 0);
      if (user) {
        try {
          await pb.collection('project_likes').getFirstListItem(`project = "${id}" && user = "${user.id}"`);
          setLiked(true);
        } catch { setLiked(false); }
      }
      // increment views
      await pb.collection('projects').update(id!, { views_count: (data.views_count || 0) + 1 });
      fetchComments();
    } catch { /* not found */ }
    setLoading(false);
  };

  const fetchComments = async () => {
    const res = await pb.collection('comments').getList<Comment>(1, 100, {
      filter: `project = "${id}"`,
      sort: 'created',
      expand: 'user',
    });
    setComments(res.items);
  };

  const toggleLike = async () => {
    if (!user) return navigate('/login');
    if (liked) {
      try {
        const existing = await pb.collection('project_likes').getFirstListItem(`project = "${id}" && user = "${user.id}"`);
        await pb.collection('project_likes').delete(existing.id);
      } catch { /* already deleted */ }
      await pb.collection('projects').update(id!, { likes_count: likeCount - 1 });
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await pb.collection('project_likes').create({ project: id, user: user.id });
      await pb.collection('projects').update(id!, { likes_count: likeCount + 1 });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const submitComment = async () => {
    if (!user) return navigate('/login');
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    await pb.collection('comments').create({ project: id, user: user.id, content: commentText.trim() });
    setCommentText('');
    fetchComments();
    setSubmittingComment(false);
  };

  const deleteProject = async () => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    await pb.collection('projects').delete(id!);
    navigate('/proyectos');
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
  if (!project) return <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center text-white/40">Proyecto no encontrado</div>;

  const coverUrl = getFileUrl(project, project.cover);
  const ownerProfile = project.expand?.user;
  const ownerAvatar = ownerProfile ? getFileUrl(ownerProfile, ownerProfile.avatar) : null;
  const tags = project.expand?.['project_tags_via_project'] || [];
  const isOwner = user?.id === project.user;

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/proyectos" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft size={14} />Volver a Proyectos
          </Link>
          <div className="flex gap-2">
            <button onClick={() => navigator.share?.({ title: project.title, url: window.location.href })}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 transition-all">
              <Share2 size={14} />
            </button>
            {isOwner && (
              <>
                <Link to={`/proyectos/${id}/editar`} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/60 transition-all">
                  <Edit size={13} />Editar
                </Link>
                <button onClick={deleteProject} className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-sm text-rose-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cover */}
        <div className="rounded-2xl overflow-hidden mb-8 border border-white/10">
          <img src={imgOrDefault(coverUrl)} alt={project.title} className="w-full h-64 sm:h-80 object-cover" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${project.status === 'launched' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'}`}>
            {project.status === 'launched' ? 'Lanzado' : 'En Desarrollo'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black mb-3">{project.title}</h1>
        <p className="text-white/60 text-base mb-5 leading-relaxed">{project.short_description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((t: {id: string; tag: string}) => (
              <span key={t.id} className="px-3 py-1 text-xs bg-white/5 text-white/60 rounded-full border border-white/10">{t.tag}</span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 transition-all">
              <Github size={14} />GitHub
            </a>
          )}
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-sm text-white font-medium transition-all">
              <ExternalLink size={14} />Ver Demo
            </a>
          )}
        </div>

        <div className="flex items-center gap-4 mb-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleLike}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-sm font-medium ${liked ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/10 text-white/60 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400'}`}>
            <Heart size={15} className={liked ? 'fill-rose-400' : ''} />
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </motion.button>
          <span className="flex items-center gap-1.5 text-white/40 text-sm">
            <Eye size={14} />{project.views_count} vistas
          </span>
        </div>

        {project.description && (
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4">Descripción</h2>
            <div className="p-5 rounded-2xl bg-gray-900 border border-white/8">
              <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
          </div>
        )}

        {ownerProfile && (
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4">Creador</h2>
            <Link to={`/perfil/${ownerProfile.id}`} className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border border-white/8 hover:border-white/15 transition-all w-fit">
              {ownerAvatar ? <img src={ownerAvatar} className="w-11 h-11 rounded-full object-cover" /> : <div className="w-11 h-11 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">{ownerProfile.full_name?.[0]?.toUpperCase()}</div>}
              <div>
                <p className="font-medium text-white">{ownerProfile.full_name}</p>
                <p className="text-white/40 text-xs">{ownerProfile.bio?.slice(0, 60) || 'Ver perfil'}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Comments */}
        <div>
          <h2 className="text-lg font-bold mb-4">Comentarios ({comments.length})</h2>
          {user && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold flex-shrink-0">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                  placeholder="Escribe un comentario..."
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 focus:border-orange-500/40 rounded-xl text-white placeholder-white/25 text-sm outline-none transition-colors" />
                <button onClick={submitComment} disabled={submittingComment || !commentText.trim()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white rounded-xl transition-all">
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-white/30 text-sm py-8 text-center">No hay comentarios aún. ¡Sé el primero!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => {
                const cAvatar = c.expand?.user ? getFileUrl(c.expand.user, c.expand.user.avatar) : null;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    {cAvatar ? <img src={cAvatar} className="w-7 h-7 rounded-full object-cover flex-shrink-0" /> : <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold flex-shrink-0">{c.expand?.user?.full_name?.[0]?.toUpperCase() || 'U'}</div>}
                    <div className="flex-1 p-3 rounded-xl bg-gray-900 border border-white/8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{c.expand?.user?.full_name || 'Anónimo'}</span>
                        <span className="text-white/25 text-xs">{new Date(c.created).toLocaleDateString('es-CO')}</span>
                      </div>
                      <p className="text-white/70 text-sm">{c.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
