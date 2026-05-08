import { Link } from 'react-router-dom';
import { Rocket, Twitter, Github, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
                <Rocket size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl">
                Cun<span className="text-orange-400">Connects</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              La red para emprendedores, innovadores y creadores. Lanza proyectos, vende productos y construye tu reputación profesional.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <SocialLink href="#" icon={<Twitter size={15} />} />
              <SocialLink href="#" icon={<Github size={15} />} />
              <SocialLink href="#" icon={<Linkedin size={15} />} />
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Plataforma</h4>
            <div className="space-y-2">
              <FooterLink to="/proyectos">Proyectos</FooterLink>
              <FooterLink to="/productos">Productos</FooterLink>
              <FooterLink to="/dashboard">Dashboard</FooterLink>
              <FooterLink to="/perfil">Perfil</FooterLink>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Empresa</h4>
            <div className="space-y-2">
              <FooterLink to="#">Acerca de</FooterLink>
              <FooterLink to="#">Blog</FooterLink>
              <FooterLink to="#">Términos</FooterLink>
              <FooterLink to="#">Privacidad</FooterLink>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-sm">
            © 2026 CunConnects. Todos los derechos reservados.
          </p>
          <p className="text-white/30 text-sm flex items-center gap-1">
            Hecho con <Heart size={12} className="text-rose-400 fill-rose-400" /> para emprendedores
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="block text-sm text-white/50 hover:text-white/80 transition-colors">
      {children}
    </Link>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
    >
      {icon}
    </a>
  );
}
