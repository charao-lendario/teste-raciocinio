"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  UserCircle,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  PlayCircle,
  User,
  Mail,
  Phone,
  Shield,
  AlertCircle,
} from "lucide-react";

type Step = "landing" | "form";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("landing");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/candidato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeCompleto, email, telefone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { message?: string })?.message ||
            "Erro ao cadastrar candidato."
        );
      }

      const data = (await res.json()) as { candidatoId: string };
      router.push(`/teste?id=${data.candidatoId}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ocorreu um erro inesperado.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] px-4 py-12">
      <div className="w-full max-w-lg">
        {step === "landing" ? (
          <div className="bg-[#1a2744] border border-[#1e3050] rounded-3xl shadow-2xl p-10 transition-all duration-200">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                Passo 1 de 2
              </span>
              <div className="flex-1 mx-4 h-1 bg-[#1e3050] rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-[#c9a84c] rounded-full" />
              </div>
              <span className="text-xs text-[#c9a84c] font-semibold">50%</span>
            </div>

            {/* Icon with glow */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#c9a84c]/10 blur-3xl rounded-full scale-150" />
                <Brain size={52} color="#c9a84c" strokeWidth={1.5} className="relative z-10" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white text-center leading-tight">
              Teste de Raciocinio Logico
            </h1>
            <p className="text-lg text-gray-400 text-center mt-2 opacity-80">
              e Atencao Concentrada
            </p>

            {/* Divider */}
            <hr className="border-[#1e3050] my-7" />

            {/* Description */}
            <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
              Este teste avalia sua capacidade de raciocinio logico e atencao
              concentrada por meio de questoes de multipla escolha. Leia cada
              enunciado com atencao antes de responder.
            </p>

            {/* Bullet points card */}
            <ul className="bg-[#111d32]/50 rounded-xl p-5 space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-200 text-sm">
                <CheckCircle size={18} color="#c9a84c" className="shrink-0" />
                <span>20 questoes de multipla escolha</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200 text-sm">
                <Clock size={18} color="#c9a84c" className="shrink-0" />
                <span className="flex-1">Tempo estimado: 25 minutos</span>
                <span className="text-xs bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/30 font-semibold px-2 py-0.5 rounded-full">
                  25 min
                </span>
              </li>
              <li className="flex items-center gap-3 text-gray-200 text-sm">
                <Target size={18} color="#c9a84c" className="shrink-0" />
                <span>Desempenho minimo esperado: 70%</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200 text-sm">
                <AlertTriangle size={18} color="#c9a84c" className="shrink-0" />
                <span>Ambiente silencioso recomendado</span>
              </li>
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => setStep("form")}
              className="w-full bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#c9a84c]/20 hover:scale-[1.02] cursor-pointer"
            >
              Iniciar Teste
              <ArrowRight size={18} />
            </button>

            {/* Security footer */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <Shield size={13} className="text-gray-500" />
              <span className="text-xs text-gray-500">Seus dados estao protegidos</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a2744] border border-[#1e3050] rounded-3xl shadow-2xl p-10 transition-all duration-200">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                Passo 2 de 2
              </span>
              <div className="flex-1 mx-4 h-1 bg-[#1e3050] rounded-full overflow-hidden">
                <div className="h-full w-full bg-[#c9a84c] rounded-full" />
              </div>
              <span className="text-xs text-[#c9a84c] font-semibold">100%</span>
            </div>

            {/* Icon with glow */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#c9a84c]/10 blur-3xl rounded-full scale-150" />
                <UserCircle size={52} color="#c9a84c" strokeWidth={1.5} className="relative z-10" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white text-center">
              Dados do Candidato
            </h1>
            <p className="text-base text-gray-400 text-center mt-2 mb-7 opacity-80">
              Preencha seus dados para iniciar o teste
            </p>

            {/* Error card */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-2xl px-4 py-3.5">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                  Nome Completo
                </label>
                <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] focus-within:ring-1 focus-within:ring-[#c9a84c] transition-all duration-200">
                  <User size={18} className="text-gray-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    required
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    className="bg-transparent border-0 text-white py-3.5 w-full focus:outline-none placeholder-gray-600"
                  />
                  {nomeCompleto.trim().length > 0 && (
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                  Email
                </label>
                <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] focus-within:ring-1 focus-within:ring-[#c9a84c] transition-all duration-200">
                  <Mail size={18} className="text-gray-500 shrink-0" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-0 text-white py-3.5 w-full focus:outline-none placeholder-gray-600"
                  />
                  {email.trim().length > 0 && (
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                  )}
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                  Telefone
                </label>
                <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] focus-within:ring-1 focus-within:ring-[#c9a84c] transition-all duration-200">
                  <Phone size={18} className="text-gray-500 shrink-0" />
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    required
                    value={telefone}
                    onChange={handlePhoneChange}
                    className="bg-transparent border-0 text-white py-3.5 w-full focus:outline-none placeholder-gray-600"
                  />
                  {telefone.replace(/\D/g, "").length >= 10 && (
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#c9a84c]/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  <>
                    Comecar Teste
                    <PlayCircle size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Back button */}
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep("landing");
                  setError(null);
                }}
                className="flex items-center gap-2 border border-[#243356] hover:bg-[#243356]/50 text-gray-400 hover:text-gray-200 text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft size={15} />
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
