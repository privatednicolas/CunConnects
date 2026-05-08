import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, ArrowLeft, Edit, Trash2, Share2 } from 'lucide-react';
import { pb, getFileUrl, imgOrDefault } from '../lib/pb';
import type { Product, Review } from '../lib/database.types';
import { useAuthStore } from '../store/useAuthStore';
import ProductSphere from '../components/3d/ProductSphere';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await pb.collection('products').getOne<Product>(id!, { expand: 'user' });
      setProduct(data);
      fetchReviews();
      fetchRelated(data.category);
    } catch {
      // not found
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    const res = await pb.collection('reviews').getList<Review>(1, 50, {
      filter: `product = "${id}"`,
      sort: '-created',
      expand: 'user',
    });
    setReviews(res.items);
  };

  const fetchRelated = async (category: string) => {
    if (!category) return;
    const res = await pb.collection('products').getList<Product>(1, 4, {
      filter: `category = "${category}" && visibility = "public" && id != "${id}"`,
      expand: 'user',
    });
    setRelated(res.items);
  };

  const submitReview = async () => {
    if (!user) return navigate('/login');
    setSubmitting(true);
    // Check if user already reviewed
    try {
      const existing = await pb.collection('reviews').getFirstListItem(`product = "${id}" && user = "${user.id}"`);
      await pb.collection('reviews').update(existing.id, { rating: reviewRating, content: reviewText });
    } catch {
      await pb.collection('reviews').create({ product: id, user: user.id, rating: reviewRating, content: reviewText });
    }
    setReviewText('');
    setReviewRating(5);
    fetchReviews();
    setSubmitting(false);
  };

  const deleteProduct = async () => {
    if (!confirm('¿Eliminar este producto?')) return;
    await pb.collection('products').delete(id!);
    navigate('/productos');
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center text-white/40">Producto no encontrado</div>
  );

  const images = product.images?.length
    ? product.images.map((f) => getFileUrl(product, f) || '')
    : [imgOrDefault(null)];
  const isOwner = user?.id === product.user;
  const ownerProfile = product.expand?.user;
  const ownerAvatar = ownerProfile ? getFileUrl(ownerProfile, ownerProfile.avatar) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/productos" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />Volver a Productos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="relative h-72 rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-white/10">
              <ProductSphere color="#ff6b00" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <img src={imgOrDefault(images[selectedImg])} alt={product.name} className="w-full h-64 object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-orange-500' : 'border-white/10 hover:border-white/30'}`}>
                    <img src={imgOrDefault(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.category && (
              <span className="text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full mb-3 inline-block">{product.category}</span>
            )}
            <h1 className="text-3xl font-black mb-2">{product.name}</h1>
            {product.rating_count > 0 && (
              <div className="flex items-center gap-1.5 mb-4">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} className={s <= Math.round(product.rating_avg) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
                ))}
                <span className="text-white/50 text-sm">{product.rating_avg.toFixed(1)} ({product.rating_count} reseñas)</span>
              </div>
            )}
            <p className="text-3xl font-black text-orange-400 mb-4">${product.price.toFixed(2)}</p>
            <p className="text-white/70 leading-relaxed mb-6">{product.description}</p>
            <div className="flex gap-2 mb-6">
              <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-lg">Stock: {product.stock}</span>
              <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-lg">{product.sales_count} vendidos</span>
            </div>

            {isOwner ? (
              <div className="flex gap-2">
                <Link to={`/productos/${id}/editar`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all">
                  <Edit size={15} />Editar
                </Link>
                <button onClick={deleteProduct} className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-rose-400 text-sm transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_25px_rgba(255,107,0,0.4)]">
                  <ShoppingBag size={16} />Comprar ahora
                </button>
                <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 transition-all">
                  <Share2 size={15} />
                </button>
              </div>
            )}

            {ownerProfile && (
              <Link to={`/perfil/${ownerProfile.id}`} className="flex items-center gap-3 mt-6 p-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 transition-all">
                {ownerAvatar ? <img src={ownerAvatar} className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-orange-500/20" />}
                <div>
                  <p className="text-sm font-medium">{ownerProfile.full_name}</p>
                  <p className="text-white/40 text-xs">@{ownerProfile.username}</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6">Reseñas</h2>
          {user && !isOwner && (
            <div className="p-5 rounded-2xl bg-gray-900 border border-white/8 mb-6">
              <p className="text-sm font-medium mb-3">Deja tu reseña</p>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onMouseEnter={() => setHoveredRating(s)} onMouseLeave={() => setHoveredRating(0)} onClick={() => setReviewRating(s)}>
                    <Star size={20} className={s <= (hoveredRating || reviewRating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
                  </button>
                ))}
              </div>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                placeholder="Cuéntanos tu experiencia..." rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm outline-none resize-none mb-3" />
              <button onClick={submitReview} disabled={submitting || !reviewText.trim()}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all">
                {submitting ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </div>
          )}
          {reviews.length === 0 ? (
            <p className="text-white/40 text-sm">Aún no hay reseñas.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => {
                const rAvatar = r.expand?.user ? getFileUrl(r.expand.user, r.expand.user.avatar) : null;
                return (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-gray-900 border border-white/8">
                    <div className="flex items-center gap-3 mb-2">
                      {rAvatar ? <img src={rAvatar} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-orange-500/20" />}
                      <div>
                        <p className="text-sm font-medium">{r.expand?.user?.full_name || 'Usuario'}</p>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} size={11} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />)}</div>
                      </div>
                    </div>
                    {r.content && <p className="text-white/70 text-sm">{r.content}</p>}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => {
                const img = p.images?.[0] ? getFileUrl(p, p.images[0]) : null;
                return (
                  <Link key={p.id} to={`/productos/${p.id}`} className="group rounded-2xl bg-gray-900 border border-white/8 hover:border-orange-500/30 overflow-hidden transition-all">
                    <div className="h-32 overflow-hidden"><img src={imgOrDefault(img)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate group-hover:text-orange-400 transition-colors">{p.name}</p>
                      <p className="text-orange-400 font-bold text-sm mt-1">${p.price.toFixed(2)}</p>
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
