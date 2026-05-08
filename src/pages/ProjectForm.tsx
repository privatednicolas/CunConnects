import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, ArrowLeft, Plus, Rocket } from 'lucide-react';
import { pb, getFileUrl } from '../lib/pb';
import { useAuthStore } from '../store/useAuthStore';
import type { Project } from '../lib/database.types';

const schema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  short_description: z.string().min(10, 'Mínimo 10 caracteres').max(200, 'Máximo 200 caracteres'),
  description: z.string().optional(),
  github_url: z.string().url('URL inválida').optional().or(z.literal('')),
  demo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['in_development', 'launched']),
  visibility: z.enum(['public', 'private']),
});
type FormData = z.infer<typeof schema>;

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEdit = !!id;
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'in_development', visibility: 'public' },
  });

  useEffect(() => {
    if (!user) navigate('/login');
    if (isEdit) loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const loadProject = async () => {
    const data = await pb.collection('projects').getOne<Project>(id!, { expand: 'project_tags_via_project' });
    if (data.user !== user?.id) return navigate('/proyectos');
    reset({
      title: data.title,
      short_description: data.short_description || '',
      description: data.description || '',
      github_url: data.github_url || '',
      demo_url: data.demo_url || '',
      status: data.status,
      visibility: data.visibility,
    });
    const existingTags = (data.expand?.['project_tags_via_project'] || []).map((t: {tag: string}) => t.tag);
    setTags(existingTags);
    const coverUrl = getFileUrl(data, data.cover);
    if (coverUrl) setCoverPreview(coverUrl);
  };

  const onDropCover = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setCoverFile(accepted[0]);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCover, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 8) { setTags([...tags, t]); setTagInput(''); }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('user', user.id);
    formData.append('title', data.title);
    formData.append('short_description', data.short_description);
    formData.append('description', data.description || '');
    formData.append('github_url', data.github_url || '');
    formData.append('demo_url', data.demo_url || '');
    formData.append('status', data.status);
    formData.append('visibility', data.visibility);
    if (coverFile) formData.append('cover', coverFile);

    let projectId = id;
    if (isEdit) {
      await pb.collection('projects').update(id!, formData);
      // Delete existing tags
      const existing = await pb.collection('project_tags').getList(1, 100, { filter: `project = "${id}"` });
      await Promise.all(existing.items.map((t) => pb.collection('project_tags').delete(t.id)));
    } else {
      const record = await pb.collection('projects').create<Project>(formData);
      projectId = record.id;
    }

    // Create new tags
    if (projectId && tags.length > 0) {
      await Promise.all(tags.map((tag) => pb.collection('project_tags').create({ project: projectId, tag })));
    }

    setUploading(false);
    navigate(`/proyectos/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />Volver
        </button>
        <div className="mb-8">
          <h1 className="text-2xl font-black">{isEdit ? 'Editar Proyecto' : 'Crear Proyecto'}</h1>
          <p className="text-white/50 text-sm mt-1">{isEdit ? 'Actualiza la información' : 'Comparte tu proyecto con la comunidad'}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FF label="Título del proyecto" error={errors.title?.message}>
            <input {...register('title')} placeholder="Ej: App de gestión de finanzas personales" className={ic(!!errors.title)} />
          </FF>
          <FF label="Descripción corta" error={errors.short_description?.message}>
            <textarea {...register('short_description')} placeholder="Résumelo en 1-2 oraciones..." rows={2} className={`${ic(!!errors.short_description)} resize-none`} />
          </FF>
          <FF label="Descripción completa (opcional)">
            <textarea {...register('description')} placeholder="Describe tu proyecto en detalle..." rows={6} className={`${ic(false)} resize-none`} />
          </FF>
          <div className="grid grid-cols-2 gap-4">
            <FF label="URL de GitHub (opcional)" error={errors.github_url?.message}>
              <input {...register('github_url')} placeholder="https://github.com/..." className={ic(!!errors.github_url)} />
            </FF>
            <FF label="URL de Demo (opcional)" error={errors.demo_url?.message}>
              <input {...register('demo_url')} placeholder="https://..." className={ic(!!errors.demo_url)} />
            </FF>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FF label="Estado">
              <select {...register('status')} className={`${ic(false)} appearance-none`}>
                <option value="in_development">En Desarrollo</option>
                <option value="launched">Lanzado</option>
              </select>
            </FF>
            <FF label="Visibilidad">
              <select {...register('visibility')} className={`${ic(false)} appearance-none`}>
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
            </FF>
          </div>

          <FF label="Tags de tecnología">
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="React, Node.js, Figma..." className={ic(false)} />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 transition-all">
                <Plus size={16} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs rounded-full">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-white transition-colors"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </FF>

          <FF label="Imagen de portada">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all ${isDragActive ? 'border-orange-500/60 bg-orange-500/5' : 'border-white/15 hover:border-white/30'}`}>
              <input {...getInputProps()} />
              {coverPreview ? (
                <div className="relative h-44">
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">Cambiar imagen</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Upload size={24} className="mx-auto mb-2 text-white/30" />
                  <p className="text-white/40 text-sm">Arrastra una imagen o haz click</p>
                  <p className="text-white/25 text-xs mt-1">Recomendado: 1280x720px</p>
                </div>
              )}
            </div>
          </FF>

          <button type="submit" disabled={uploading} className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_25px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2">
            {uploading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            <Rocket size={16} />{isEdit ? 'Guardar cambios' : 'Lanzar proyecto'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FF({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
function ic(hasError: boolean) {
  return `w-full px-4 py-2.5 bg-white/5 border ${hasError ? 'border-rose-500/50' : 'border-white/10'} hover:border-white/20 focus:border-orange-500/50 rounded-xl text-white placeholder-white/25 text-sm outline-none transition-colors`;
}
