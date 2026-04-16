'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao enviar email');
        return;
      }

      setSent(true);
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111d32] border border-[#1e3050] rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-[#c9a84c]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col items-center mb-8 relative">
            <div className="mb-4">
              <Shield size={52} color="#c9a84c" strokeWidth={1.5} />
            </div>
            <h1 className="text-white text-2xl font-bold text-center">Recuperar Senha</h1>
            <p className="text-gray-400 text-sm mt-2 text-center leading-relaxed">
              Digite seu email para receber o link de redefinição
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 bg-green-900/30 border border-green-800 rounded-xl p-4 w-full">
                <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                <p className="text-green-400 text-sm">
                  Se o email estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada.
                </p>
              </div>
              <Link
                href="/admin"
                className="flex items-center gap-2 text-[#c9a84c] hover:text-[#b8952f] text-sm font-medium transition-colors mt-2"
              >
                <ArrowLeft size={16} />
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                  Email
                </label>
                <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] transition-colors">
                  <Mail size={18} className="text-gray-500 shrink-0" />
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    Enviando...
                  </>
                ) : (
                  'Enviar link de redefinição'
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
      </div>
    </div>
  );
}
