import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, ArrowLeft, Eye, ShoppingBag } from 'lucide-react';
import { pb, getFileUrl } from '../lib/pb';
import { useAuthStore } from '../store/useAuthStore';
import type { Product } from '../lib/database.types';

const CATEGORIES = ['Tecnología', 'Diseño', 'Educación', 'Servicios', 'Físicos', 'Digital', 'Otro'];

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  price: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, 'Precio inválido'),
  category: z.string().min(1, 'Selecciona categoría'),
  stock: z.string().refine((v) => !isNaN(parseInt(v)) && parseInt(v) >= 0, 'Stock inválido'),
  visibility: z.enum(['public', 'private']),
});
type FormData = z.infer<typeof schema>;

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEdit = !!id;
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { visibility: 'public', stock: '0', price: '0' },
  });
  const watchAll = watch();

  useEffect(() => {
    if (!user) navigate('/login');
    if (isEdit) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const loadProduct = async () => {
    const data = await pb.collection('products').getOne<Product>(id!);
    if (data.user !== user?.id) return navigate('/productos');
    reset({
      name: data.name,
      description: data.description || '',
      price: data.price.toString(),
      category: data.category || '',
      stock: data.stock.toString(),
      visibility: data.visibility,
    });
    // Load existing image previews
    const existingPreviews = (data.images || []).map((f: string) => getFileUrl(data, f) || '');
    setPreviews(existingPreviews.filter(Boolean));
  };

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.slice(0, 5 - files.length);
    setFiles((f) => [...f, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((p) => [...p, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 5,
  });

  const removeImage = (i: number) => {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('user', user.id);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('stock', data.stock);
    formData.append('visibility', data.visibility);
    files.forEach((file) => formData.append('images', file));

    let productId = id;
    if (isEdit) {
      await pb.collection('products').update(id!, formData);
    } else {
      const record = await pb.collection('products').create<Product>(formData);
      productId = record.id;
    }

    setUploading(false);
    navigate(`/productos/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />Volver
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">{isEdit ? 'Editar Producto' : 'Agregar Producto'}</h1>
            <p className="text-white/50 text-sm mt-1">{isEdit ? 'Actualiza la información' : 'Comparte tu producto con la comunidad'}</p>
          </div>
          <button onClick={() => setPreview(!preview)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 transition-all">
            <Eye size={14} />{preview ? 'Editar' : 'Vista previa'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-5">
            <FF label="Nombre del producto" error={errors.name?.message}>
              <input {...register('name')} placeholder="Ej: Plantilla de presentación premium" className={ic(!!errors.name)} />
            </FF>
            <FF label="Descripción" error={errors.description?.message}>
              <textarea {...register('description')} placeholder="Describe tu producto..." rows={4} className={`${ic(!!errors.description)} resize-none`} />
            </FF>
            <div className="grid grid-cols-2 gap-4">
              <FF label="Precio (USD)" error={errors.price?.message}>
                <input {...register('price')} type="number" step="0.01" placeholder="0.00" className={ic(!!errors.price)} />
              </FF>
              <FF label="Stock" error={errors.stock?.message}>
                <input {...register('stock')} type="number" placeholder="0" className={ic(!!errors.stock)} />
              </FF>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FF label="Categoría" error={errors.category?.message}>
                <select {...register('category')} className={`${ic(!!errors.category)} appearance-none`}>
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FF>
              <FF label="Visibilidad">
                <select {...register('visibility')} className={`${ic(false)} appearance-none`}>
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                </select>
              </FF>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Imágenes ({previews.length}/5)</label>
              {previews.length < 5 && (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-orange-500/60 bg-orange-500/5' : 'border-white/15 hover:border-white/30'}`}>
                  <input {...getInputProps()} />
                  <Upload size={24} className="mx-auto mb-2 text-white/30" />
                  <p className="text-white/40 text-sm">Arrastra imágenes o haz click para seleccionar</p>
                  <p className="text-white/25 text-xs mt-1">PNG, JPG, WEBP hasta 5MB</p>
                </div>
              )}
              {previews.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={uploading} className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_25px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2">
              {uploading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              <ShoppingBag size={16} />{isEdit ? 'Guardar cambios' : 'Publicar producto'}
            </button>
          </form>

          <div className="lg:col-span-2">
            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">Vista previa</p>
            <motion.div animate={{ opacity: preview ? 1 : 0.6, scale: preview ? 1 : 0.98 }} className="rounded-2xl overflow-hidden bg-gray-900 border border-white/8">
              <div className="h-48 bg-gray-800 overflow-hidden">
                {previews[0] ? <img src={previews[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/15"><ShoppingBag size={32} /></div>}
              </div>
              <div className="p-4">
                <p className="font-semibold text-white truncate">{watchAll.name || 'Nombre del producto'}</p>
                <p className="text-white/50 text-xs mt-1 line-clamp-2">{watchAll.description || 'Descripción...'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-orange-400 font-bold text-lg">${parseFloat(watchAll.price || '0').toFixed(2)}</span>
                  {watchAll.category && <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-md">{watchAll.category}</span>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
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
