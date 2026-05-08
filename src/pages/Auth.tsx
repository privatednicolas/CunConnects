import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Rocket, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { pb } from '../lib/pb';
import AuthScene from '../components/3d/AuthScene';
import type { ClientResponseError } from 'pocketbase';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres'),
  username: z.string().min(3, 'Mínimo 3 caracteres').regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y _'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthProps {
  mode: 'login' | 'register';
}

export default function Auth({ mode }: AuthProps) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      await pb.collection('users').authWithPassword(data.email, data.password);
      navigate('/dashboard');
    } catch (e) {
      const err = e as ClientResponseError;
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.confirm,
        username: data.username,
        full_name: data.full_name,
        role: 'member',
      });
      await pb.collection('users').authWithPassword(data.email, data.password);
      setSuccess('Cuenta creada exitosamente. Redirigiendo...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (e) {
      const err = e as ClientResponseError;
      const firstMsg = err.data?.data
        ? Object.values(err.data.data as Record<string, {message: string}>)[0]?.message
        : null;
      setError(firstMsg || err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0"><AuthScene /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/10 to-gray-900/60" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <Link to="/" className="flex items-center gap-2 mb-auto pt-8">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Rocket size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">Cun<span className="text-orange-400">Connects</span></span>
          </Link>
          <div>
            <h2 className="text-3xl font-black text-white mb-3">Tu próximo gran proyecto<br />empieza aquí.</h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Miles de emprendedores ya están construyendo su futuro en CunConnects. Únete a la comunidad.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Rocket size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">Cun<span className="text-orange-400">Connects</span></span>
          </Link>

          <h1 className="text-2xl font-black text-white mb-1">
            {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h1>
          <p className="text-white/50 text-sm mb-8">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <Link to={isLogin ? '/registro' : '/login'} className="text-orange-400 hover:text-orange-300 transition-colors">
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </Link>
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle size={15} />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle size={15} />{success}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <Field label="Email" error={loginForm.formState.errors.email?.message}>
                <input {...loginForm.register('email')} type="email" placeholder="tu@email.com" className={inputCls(!!loginForm.formState.errors.email)} />
              </Field>
              <Field label="Contraseña" error={loginForm.formState.errors.password?.message}>
                <div className="relative">
                  <input {...loginForm.register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className={`${inputCls(!!loginForm.formState.errors.password)} pr-10`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              <SubmitButton loading={loading} label="Iniciar Sesión" />
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre completo" error={registerForm.formState.errors.full_name?.message}>
                  <input {...registerForm.register('full_name')} placeholder="Juan García" className={inputCls(!!registerForm.formState.errors.full_name)} />
                </Field>
                <Field label="Usuario" error={registerForm.formState.errors.username?.message}>
                  <input {...registerForm.register('username')} placeholder="juan_garcia" className={inputCls(!!registerForm.formState.errors.username)} />
                </Field>
              </div>
              <Field label="Email" error={registerForm.formState.errors.email?.message}>
                <input {...registerForm.register('email')} type="email" placeholder="tu@email.com" className={inputCls(!!registerForm.formState.errors.email)} />
              </Field>
              <Field label="Contraseña" error={registerForm.formState.errors.password?.message}>
                <div className="relative">
                  <input {...registerForm.register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className={`${inputCls(!!registerForm.formState.errors.password)} pr-10`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirmar contraseña" error={registerForm.formState.errors.confirm?.message}>
                <input {...registerForm.register('confirm')} type="password" placeholder="••••••••" className={inputCls(!!registerForm.formState.errors.confirm)} />
              </Field>
              <SubmitButton loading={loading} label="Crear Cuenta" />
            </form>
          )}

          <p className="text-white/25 text-xs text-center mt-6">
            Al continuar, aceptas nuestros{' '}
            <span className="text-white/40">Términos de Servicio</span> y{' '}
            <span className="text-white/40">Política de Privacidad</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_25px_rgba(255,107,0,0.35)] flex items-center justify-center gap-2"
    >
      {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
      {label}
    </button>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-4 py-2.5 bg-white/5 border ${hasError ? 'border-rose-500/50' : 'border-white/10'} hover:border-white/20 focus:border-orange-500/50 rounded-xl text-white placeholder-white/25 text-sm outline-none transition-colors`;
}
