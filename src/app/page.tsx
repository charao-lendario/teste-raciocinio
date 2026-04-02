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

  const inputBase =
    "w-full bg-transparent border-0 text-white py-3 pr-4 focus:outline-none placeholder-gray-500";

  const fieldWrapper =
    "flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-lg px-4 focus-within:border-[#c9a84c] focus-within:ring-1 focus-within:ring-[#c9a84c] transition";

  const goldenBtn =
    "w-full bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1628] px-4 py-10">
      <div className="w-full max-w-lg bg-[#1a2744] rounded-2xl shadow-2xl p-8">
        {step === "landing" ? (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <Brain size={48} color="#c9a84c" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white text-center leading-tight">
              Teste de Raciocínio Lógico
            </h1>
            <p className="text-lg text-gray-300 text-center mt-1">
              e Atenção Concentrada
            </p>

            {/* Divider */}
            <hr className="border-[#243356] my-6" />

            {/* Description */}
            <p className="text-gray-300 text-sm text-center mb-6 leading-relaxed">
              Este teste avalia sua capacidade de raciocínio lógico e atenção
              concentrada por meio de questões de múltipla escolha. Leia cada
              enunciado com atenção antes de responder.
            </p>

            {/* Bullet points */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-200 text-sm">
                <CheckCircle size={18} color="#c9a84c" className="shrink-0" />
                20 questões de múltipla escolha
              </li>
              <li className="flex items-center gap-3 text-gray-200 text-sm">
                <Clock size={18} color="#c9a84c" className="shrink-0" />
                Tempo estimado: 25 minutos
              </li>
              <li className="flex items-center gap-3 text-gray-200 text-sm">
                <Target size={18} color="#c9a84c" className="shrink-0" />
                Desempenho mínimo esperado: 70%
              </li>
              <li className="flex items-center gap-3 text-gray-200 text-sm">
                <AlertTriangle
                  size={18}
                  color="#c9a84c"
                  className="shrink-0"
                />
                Ambiente silencioso recomendado
              </li>
            </ul>

            {/* CTA Button */}
            <button onClick={() => setStep("form")} className={goldenBtn}>
              Iniciar Teste
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <UserCircle size={48} color="#c9a84c" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white text-center">
              Dados do Candidato
            </h1>
            <p className="text-base text-gray-300 text-center mt-1 mb-6">
              Preencha seus dados para iniciar o teste
            </p>

            {/* Error toast */}
            {error && (
              <div className="mb-5 bg-red-900/40 border border-red-600 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Nome Completo */}
              <div className={fieldWrapper}>
                <User size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Nome Completo"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className={inputBase}
                />
              </div>

              {/* Email */}
              <div className={fieldWrapper}>
                <Mail size={18} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                />
              </div>

              {/* Telefone */}
              <div className={fieldWrapper}>
                <Phone size={18} className="text-gray-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  required
                  value={telefone}
                  onChange={handlePhoneChange}
                  className={inputBase}
                />
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className={goldenBtn}>
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  <>
                    Começar Teste
                    <PlayCircle size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Back link */}
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep("landing");
                  setError(null);
                }}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm transition cursor-pointer"
              >
                <ArrowLeft size={15} />
                Voltar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
