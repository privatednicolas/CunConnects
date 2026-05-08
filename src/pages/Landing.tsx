import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Rocket, Star, Users, ShoppingBag, Zap, Globe, TrendingUp, Heart, Eye } from 'lucide-react';
import HeroScene from '../components/3d/HeroScene';
import FloatingIcons from '../components/3d/FloatingIcons';
import { pb, getFileUrl, imgOrDefault } from '../lib/pb';
import type { Project, Product } from '../lib/database.types';

const CATEGORY_IMGS: Record<string, string> = {
  default: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600',
  tech: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600',
  design: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=600',
  food: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
};

function getImg(url: string | null | undefined, category?: string | null) {
  if (url) return url;
  return CATEGORY_IMGS[category || 'default'] || CATEGORY_IMGS.default;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    pb.collection('projects').getList(1, 6, {
      filter: 'visibility = "public"',
      sort: '-likes_count',
      expand: 'user,project_tags_via_project',
    }).then((res) => setProjects(res.items as Project[]));

    pb.collection('products').getList(1, 6, {
      filter: 'visibility = "public"',
      sort: '-sales_count',
      expand: 'user',
    }).then((res) => setProducts(res.items as Product[]));
  }, []);

  return (
    <div className="bg-gray-950 text-white overflow-x-hidden">
      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-gray-950/30 via-gray-950/10 to-gray-950" />
        {/* Radial glow */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,107,0,0.15),transparent)]" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium"
            >
              <Rocket size={14} />
              La red para emprendedores innovadores
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              Comparte tu visión.
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-orange-300 bg-clip-text text-transparent">
                Construye tu reputación.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              CunConnects es la plataforma donde emprendedores lanzan proyectos, venden productos y construyen su marca personal ante una comunidad que importa.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/proyectos/nuevo"
                className="group flex items-center gap-2 px-7 py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,107,0,0.4)] text-base"
              >
                Lanzar un Proyecto
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/productos/nuevo"
                className="flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all text-base backdrop-blur-sm"
              >
                <ShoppingBag size={16} />
                Agregar un Producto
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex items-center justify-center gap-8 mt-14 text-white/40 text-sm"
            >
              {[['2.4k+', 'Proyectos'], ['840+', 'Productos'], ['5.2k+', 'Creadores']].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="text-xl font-bold text-white/80">{n}</div>
                  <div>{l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </div>

      {/* What is CunConnects */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                ¿Qué es <span className="text-orange-400">CunConnects</span>?
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                Una plataforma todo en uno para que los creadores de hoy construyan el futuro.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Rocket size={24} />,
                  title: 'Proyectos',
                  desc: 'Lanza tus ideas al mundo. Comparte tu visión, forma equipos y recibe apoyo de la comunidad emprendedora.',
                  color: 'from-orange-500/20 to-orange-500/5',
                  border: 'border-orange-500/20',
                  iconBg: 'bg-orange-500/10 text-orange-400',
                },
                {
                  icon: <ShoppingBag size={24} />,
                  title: 'Productos',
                  desc: 'Vende lo que creas. Desde apps hasta productos físicos, llega a miles de compradores potenciales.',
                  color: 'from-rose-500/20 to-rose-500/5',
                  border: 'border-rose-500/20',
                  iconBg: 'bg-rose-500/10 text-rose-400',
                },
                {
                  icon: <Users size={24} />,
                  title: 'Red',
                  desc: 'Conecta con otros innovadores, sigue a los mejores creadores y construye relaciones que impulsen tu carrera.',
                  color: 'from-sky-500/20 to-sky-500/5',
                  border: 'border-sky-500/20',
                  iconBg: 'bg-sky-500/10 text-sky-400',
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className={`relative p-6 rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} backdrop-blur-sm hover:scale-[1.02] transition-transform`}
                >
                  <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-5`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* How it works with 3D */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-950" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cómo funciona</h2>
              <p className="text-white/50 max-w-xl mx-auto">Tres pasos simples para empezar a construir tu presencia</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="h-64 lg:h-96 rounded-2xl overflow-hidden">
                <FloatingIcons />
              </div>

              <div className="space-y-6">
                {[
                  { n: '01', icon: <Zap size={18} />, title: 'Crea tu perfil', desc: 'Configura tu perfil profesional con tu bio, portafolio y redes sociales en minutos.' },
                  { n: '02', icon: <Globe size={18} />, title: 'Lanza tu proyecto o producto', desc: 'Publica tu idea o producto con descripción, imágenes y todos los detalles que necesites.' },
                  { n: '03', icon: <TrendingUp size={18} />, title: 'Crece y conecta', desc: 'Recibe likes, comentarios y ventas. Conecta con otros creadores y expande tu red.' },
                ].map((step) => (
                  <motion.div
                    key={step.n}
                    variants={fadeUp}
                    className="flex gap-5 p-5 rounded-xl bg-white/3 hover:bg-white/5 border border-white/8 transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold group-hover:bg-orange-500/20 transition-colors">
                      {step.n}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        {step.icon}
                        {step.title}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">Proyectos Destacados</h2>
                <p className="text-white/50">Lo más reciente de la comunidad</p>
              </div>
              <Link to="/proyectos" className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1 transition-colors">
                Ver todos <ArrowRight size={14} />
              </Link>
            </motion.div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((p) => (
                  <motion.div key={p.id} variants={fadeUp}>
                    <ProjectCard project={p} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div variants={fadeUp} className="text-center py-20">
                <p className="text-white/30 mb-4">Aún no hay proyectos publicados</p>
                <Link to="/proyectos/nuevo" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
                  Sé el primero en lanzar un proyecto →
                </Link>
              </motion.div>
            )}
          </Section>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/30 to-gray-950">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">Productos Destacados</h2>
                <p className="text-white/50">Descubre lo que la comunidad está vendiendo</p>
              </div>
              <Link to="/productos" className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1 transition-colors">
                Ver todos <ArrowRight size={14} />
              </Link>
            </motion.div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((p) => (
                  <motion.div key={p.id} variants={fadeUp}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div variants={fadeUp} className="text-center py-20">
                <p className="text-white/30 mb-4">Aún no hay productos publicados</p>
                <Link to="/productos/nuevo" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
                  Agrega tu primer producto →
                </Link>
              </motion.div>
            )}
          </Section>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-gray-900 border border-orange-500/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(255,107,0,0.12),transparent)]" />
            <div className="relative z-10">
              <Star className="w-10 h-10 text-orange-400 mx-auto mb-5" />
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                ¿Listo para despegar?
              </h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">
                Únete a miles de emprendedores que ya están construyendo el futuro en CunConnects.
              </p>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,107,0,0.5)] text-base"
              >
                Crear cuenta gratis
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/proyectos/${project.id}`}>
      <div className="group relative rounded-2xl overflow-hidden bg-gray-900 border border-white/8 hover:border-orange-500/30 transition-all hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="relative h-44 overflow-hidden">
          <img
            src={imgOrDefault(getFileUrl(project as Parameters<typeof getFileUrl>[0], project.cover))}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              project.status === 'launched' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'
            }`}>
              {project.status === 'launched' ? 'Lanzado' : 'En Desarrollo'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white mb-1 truncate">{project.title}</h3>
          <p className="text-white/50 text-sm line-clamp-2 mb-3 leading-relaxed">
            {project.short_description || 'Sin descripción'}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.project_tags?.slice(0, 3).map((t) => (
              <span key={t.id} className="px-2 py-0.5 text-xs bg-white/5 text-white/50 rounded-md">
                {t.tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-white/40">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-orange-500/30 flex items-center justify-center text-orange-400 text-[10px] font-bold">
                {project.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span>{project.profiles?.full_name || 'Anónimo'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Heart size={11} /> {project.likes_count}</span>
              <span className="flex items-center gap-1"><Eye size={11} /> {project.views_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0] ? getFileUrl(product as Parameters<typeof getFileUrl>[0], product.images[0]) : null;
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-gray-900 border border-white/8 hover:border-orange-500/30 transition-all hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="relative h-44 overflow-hidden">
        <img
          src={getImg(img, product.category)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 text-xs bg-gray-900/80 backdrop-blur-sm text-white/60 rounded-md border border-white/10">
              {product.category}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{product.name}</h3>
        <p className="text-white/50 text-sm line-clamp-2 mb-3 leading-relaxed">
          {product.description || 'Sin descripción'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-orange-400">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex gap-2">
            <Link
              to={`/productos/${product.id}`}
              className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-lg transition-colors"
            >
              Ver
            </Link>
            <button className="px-3 py-1.5 text-xs bg-orange-500 hover:bg-orange-400 text-white rounded-lg transition-colors font-medium">
              Comprar
            </button>
          </div>
        </div>
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={10} className={s <= Math.round(product.rating_avg) ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
            ))}
            <span className="text-white/40 text-xs ml-1">({product.rating_count})</span>
          </div>
        )}
      </div>
    </div>
  );
}
