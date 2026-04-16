'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir senha');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-4 sm:w-[48px] sm:h-[48px]" />
        <h1 className="text-white text-lg sm:text-xl font-bold mb-2">Link inválido</h1>
        <p className="text-gray-400 text-sm mb-6">Este link de redefinição é inválido ou expirou.</p>
        <Link
          href="/admin/forgot-password"
          className="text-[#c9a84c] hover:text-[#b8952f] text-sm font-medium transition-colors"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-[#c9a84c]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col items-center mb-6 sm:mb-8 relative">
        <div className="mb-3 sm:mb-4">
          <Shield size={44} color="#c9a84c" strokeWidth={1.5} className="sm:w-[52px] sm:h-[52px]" />
        </div>
        <h1 className="text-white text-xl sm:text-2xl font-bold text-center">Nova Senha</h1>
        <p className="text-gray-400 text-sm mt-2 text-center leading-relaxed">
          Defina sua nova senha de acesso
        </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-green-900/30 border border-green-800 rounded-xl p-4 w-full">
            <CheckCircle2 size={20} className="text-green-400 shrink-0" />
            <p className="text-green-400 text-sm">
              Senha redefinida com sucesso! Você já pode fazer login com a nova senha.
            </p>
          </div>
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold rounded-xl py-4 px-8 mt-2 transition-all shadow-lg shadow-[#c9a84c]/20 hover:scale-[1.02]"
          >
            Ir para o login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5 font-medium">
              Nova senha
            </label>
            <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] transition-colors">
              <Lock size={18} className="text-gray-500 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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

          <div>
            <label className="block text-sm text-gray-400 mb-1.5 font-medium">
              Confirmar nova senha
            </label>
            <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] transition-colors">
              <Lock size={18} className="text-gray-500 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-transparent border-0 text-white placeholder-gray-600 py-3.5 w-full focus:outline-none text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-900/30 border border-red-800 rounded-xl p-4">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold rounded-xl py-4 mt-1 transition-all shadow-lg shadow-[#c9a84c]/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Redefinindo...
              </>
            ) : (
              'Redefinir senha'
            )}
          </button>

          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao login
          </Link>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#c9a84c]" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
