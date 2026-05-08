import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Twitter, Linkedin, Github, Globe, MapPin, Edit2, UserPlus, UserMinus, X, Upload } from 'lucide-react';
import { pb, getFileUrl, imgOrDefault } from '../lib/pb';
import type { Profile as ProfileType, Project, Product } from '../lib/database.types';
import { useAuthStore } from '../store/useAuthStore';

type Tab = 'projects' | 'products';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<Tab>('projects');
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const targetId = id || user?.id;
  const isOwnProfile = !id || id === user?.id;

  useEffect(() => {
    if (!targetId) return navigate('/login');
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const fetchProfileData = async () => {
    try {
      const data = await pb.collection('users').getOne<ProfileType>(targetId!);
      setProfile(data);
    } catch { setLoading(false); return; }

    const projRes = await pb.collection('projects').getList<Project>(1, 50, {
      filter: `user = "${targetId}" && visibility = "public"`,
      sort: '-created',
      expand: 'project_tags_via_project',
    });
    setProjects(projRes.items);

    const prodRes = await pb.collection('products').getList<Product>(1, 50, {
      filter: `user = "${targetId}" && visibility = "public"`,
      sort: '-created',
    });
    setProducts(prodRes.items);

    if (user && !isOwnProfile) {
      try {
        await pb.collection('follows').getFirstListItem(`follower = "${user.id}" && following = "${targetId}"`);
        setFollowing(true);
      } catch { setFollowing(false); }
    }
    setLoading(false);
  };

  const toggleFollow = async () => {
    if (!user) return navigate('/login');
    if (following) {
      try {
        const f = await pb.collection('follows').getFirstListItem(`follower = "${user.id}" && following = "${targetId}"`);
        await pb.collection('follows').delete(f.id);
      } catch { /**/ }
      setFollowing(false);
    } else {
      await pb.collection('follows').create({ follower: user.id, following: targetId });
      setFollowing(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
  if (!profile) return <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center text-white/40">Usuario no encontrado</div>;

  const avatarUrl = getFileUrl(profile, profile.avatar);
  const bannerUrl = getFileUrl(profile, profile.banner);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-orange-900/30 to-gray-900">
        {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-28 h-28 rounded-2xl border-4 border-gray-950 overflow-hidden bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-3xl font-black flex-shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : profile.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <h1 className="text-2xl font-black">{profile.full_name || 'Sin nombre'}</h1>
                  {profile.username && <p className="text-white/50 text-sm">@{profile.username}</p>}
                </div>
                <div className="sm:ml-auto flex gap-2">
                  {isOwnProfile ? (
                    <button onClick={() => setEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 transition-all">
                      <Edit2 size={14} />Editar Perfil
                    </button>
                  ) : (
                    <button onClick={toggleFollow} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${following ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/70' : 'bg-orange-500 hover:bg-orange-400 text-white'}`}>
                      {following ? <><UserMinus size={14} />Siguiendo</> : <><UserPlus size={14} />Seguir</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 max-w-lg">
            {profile.bio && <p className="text-white/60 text-sm leading-relaxed mb-3">{profile.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 text-white/40 text-sm">
              {profile.city && <span className="flex items-center gap-1"><MapPin size={13} />{profile.city}</span>}
              {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors"><Globe size={13} />{profile.website.replace(/https?:\/\//, '')}</a>}
              {profile.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-400 transition-colors"><Twitter size={13} />@{profile.twitter}</a>}
              {profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors"><Github size={13} />{profile.github}</a>}
              {profile.linkedin && <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-400 transition-colors"><Linkedin size={13} />{profile.linkedin}</a>}
            </div>
          </div>
          <div className="flex gap-6 mt-5 text-sm">
            <div className="text-center"><div className="text-xl font-bold">{projects.length}</div><div className="text-white/40">Proyectos</div></div>
            <div className="text-center"><div className="text-xl font-bold">{products.length}</div><div className="text-white/40">Productos</div></div>
          </div>
        </div>

        <div className="flex border-b border-white/10 mb-6">
          {([['projects', 'Proyectos'], ['products', 'Productos']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-sm font-medium transition-colors relative ${tab === t ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
              {label}
              {tab === t && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />}
            </button>
          ))}
        </div>

        <div className="pb-16">
          {tab === 'projects' && (
            projects.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p>No hay proyectos publicados</p>
                {isOwnProfile && <Link to="/proyectos/nuevo" className="text-orange-400 hover:text-orange-300 text-sm mt-2 inline-block transition-colors">Crea tu primer proyecto →</Link>}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((p) => {
                  const cover = getFileUrl(p, p.cover);
                  return (
                    <Link key={p.id} to={`/proyectos/${p.id}`} className="group rounded-xl overflow-hidden bg-gray-900 border border-white/8 hover:border-orange-500/30 transition-all">
                      <div className="h-36 overflow-hidden"><img src={imgOrDefault(cover)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                      <div className="p-3"><p className="font-medium text-sm truncate">{p.title}</p><p className="text-white/40 text-xs line-clamp-1 mt-0.5">{p.short_description}</p></div>
                    </Link>
                  );
                })}
              </div>
            )
          )}
          {tab === 'products' && (
            products.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p>No hay productos publicados</p>
                {isOwnProfile && <Link to="/productos/nuevo" className="text-orange-400 hover:text-orange-300 text-sm mt-2 inline-block transition-colors">Agrega tu primer producto →</Link>}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((p) => {
                  const img = p.images?.[0] ? getFileUrl(p, p.images[0]) : null;
                  return (
                    <Link key={p.id} to={`/productos/${p.id}`} className="group rounded-xl overflow-hidden bg-gray-900 border border-white/8 hover:border-orange-500/30 transition-all">
                      <div className="h-36 overflow-hidden"><img src={imgOrDefault(img)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                      <div className="p-3 flex items-center justify-between"><p className="font-medium text-sm truncate">{p.name}</p><span className="text-orange-400 text-sm font-bold">${p.price.toFixed(2)}</span></div>
                    </Link>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      <AnimatePresence>
        {editOpen && (
          <EditProfileModal profile={profile} onClose={() => setEditOpen(false)} onSaved={() => { fetchProfileData(); setEditOpen(false); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSaved }: { profile: ProfileType; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    city: profile.city || '',
    website: profile.website || '',
    twitter: profile.twitter || '',
    linkedin: profile.linkedin || '',
    github: profile.github || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(getFileUrl(profile, profile.avatar));
  const [saving, setSaving] = useState(false);

  const onDropAvatar = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setAvatarFile(accepted[0]);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropAvatar, accept: { 'image/*': [] }, maxFiles: 1 });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (avatarFile) fd.append('avatar', avatarFile);
    await pb.collection('users').update(user.id, fd);
    setSaving(false);
    onSaved();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-bold text-lg">Editar Perfil</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-500/20 flex items-center justify-center text-orange-400 text-xl font-bold flex-shrink-0">
              {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : form.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div {...getRootProps()} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all text-sm text-white/60">
              <input {...getInputProps()} /><Upload size={14} />Cambiar foto
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[['full_name', 'Nombre completo'], ['username', 'Usuario']].map(([k, l]) => (
              <div key={k}>
                <label className="block text-xs text-white/50 mb-1">{l}</label>
                <input value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-orange-500/40 rounded-xl text-white text-sm outline-none transition-colors" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-orange-500/40 rounded-xl text-white text-sm outline-none transition-colors resize-none" />
          </div>

          {[['city', 'Ciudad'], ['website', 'Sitio web'], ['twitter', 'Twitter (sin @)'], ['github', 'GitHub'], ['linkedin', 'LinkedIn']].map(([k, l]) => (
            <div key={k}>
              <label className="block text-xs text-white/50 mb-1">{l}</label>
              <input value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-orange-500/40 rounded-xl text-white text-sm outline-none transition-colors" />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-sm transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-medium rounded-xl text-sm transition-all">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
