import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, ShoppingBag, Plus } from 'lucide-react';
import { pb, getFileUrl, imgOrDefault } from '../lib/pb';
import type { Product } from '../lib/database.types';
import { useAuthStore } from '../store/useAuthStore';

const CATEGORIES = ['Todos', 'Tecnología', 'Diseño', 'Educación', 'Servicios', 'Físicos', 'Digital', 'Otro'];
const SORTS = [
  { label: 'Más reciente', value: '-created' },
  { label: 'Precio ↑', value: 'price' },
  { label: 'Precio ↓', value: '-price' },
  { label: 'Más vendido', value: '-sales_count' },
];
const PAGE_SIZE = 12;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sort, setSort] = useState('-created');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  useEffect(() => {
    fetchProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchProducts = async (p: number) => {
    setLoading(true);
    let filter = 'visibility = "public"';
    if (search) filter += ` && name ~ "${search}"`;
    if (category !== 'Todos') filter += ` && category = "${category}"`;

    const res = await pb.collection('products').getList<Product>(p, PAGE_SIZE, {
      filter,
      sort,
      expand: 'user',
    });
    setProducts(res.items);
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black mb-1">Productos</h1>
            <p className="text-white/50 text-sm">Descubre lo que la comunidad está vendiendo</p>
          </div>
          {user && (
            <Link to="/productos/nuevo" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-medium rounded-xl transition-all text-sm">
              <Plus size={16} />Agregar Producto
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl text-white placeholder-white/30 text-sm outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal size={15} className="text-white/40 flex-shrink-0 mt-2.5" />
            {SORTS.map((s) => (
              <button key={s.value} onClick={() => setSort(s.value)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${sort === s.value ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${category === c ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product, i) => {
              const imgUrl = product.images?.[0] ? getFileUrl(product, product.images[0]) : null;
              const avatar = product.expand?.user ? getFileUrl(product.expand.user, product.expand.user.avatar) : null;
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={`/productos/${product.id}`} className="group block rounded-2xl bg-gray-900 border border-white/8 hover:border-orange-500/30 overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                    <div className="h-44 overflow-hidden bg-gray-800">
                      <img src={imgOrDefault(imgUrl)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      {product.category && (
                        <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full mb-2 inline-block">{product.category}</span>
                      )}
                      <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-white/50 text-xs mt-1 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span className="text-orange-400 font-bold">${product.price.toFixed(2)}</span>
                        <div className="flex items-center gap-1.5">
                          {avatar ? <img src={avatar} className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-orange-500/20" />}
                          <span className="text-white/40 text-xs">{product.expand?.user?.username || '—'}</span>
                        </div>
                      </div>
                      {product.rating_count > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-white/60 text-xs">{product.rating_avg.toFixed(1)} ({product.rating_count})</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
