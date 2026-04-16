'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, User, Lock, Loader2, Eye, EyeOff, AlertCircle, BadgeCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError('Credenciais inválidas');
        return;
      }

      const data = await res.json();
      localStorage.setItem('admin_token', data.token);
      router.push('/admin/dashboard');
    } catch {
      setError('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Soft glow behind icon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-[#c9a84c]/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center mb-6 sm:mb-8 relative">
            <div className="mb-3 sm:mb-4">
              <Shield size={44} color="#c9a84c" strokeWidth={1.5} className="sm:w-[52px] sm:h-[52px]" />
            </div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <BadgeCheck size={14} className="text-[#c9a84c]" />
              <span className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest">
                Painel de Gestão RH
              </span>
            </div>
            <h1 className="text-white text-xl sm:text-2xl font-bold text-center">Área Administrativa</h1>
            <p className="text-gray-400 text-sm mt-2 text-center leading-relaxed">
              Acesse o painel de resultados dos candidatos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username field */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                Usuário
              </label>
              <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] transition-colors">
                <User size={18} className="text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-transparent border-0 text-white placeholder-gray-600 py-3.5 w-full focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                Senha
              </label>
              <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] transition-colors">
                <Lock size={18} className="text-gray-500 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-transparent border-0 text-white placeholder-gray-600 py-3.5 w-full focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-3 bg-red-900/30 border border-red-800 rounded-xl p-4">
                <AlertCircle size={18} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                href="/admin/forgot-password"
                className="text-[#c9a84c] hover:text-[#b8952f] text-xs font-medium transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold rounded-xl py-4 mt-1 transition-all shadow-lg shadow-[#c9a84c]/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
