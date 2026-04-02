'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  LogOut,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
  RefreshCw,
  Eye,
  ClipboardList,
  X,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';

interface Candidato {
  id: number;
  nome_completo: string;
  email: string;
  telefone: string;
  nota: number | null;
  total_questoes: number | null;
  percentual: number | null;
  aprovado: boolean | null;
  tempo_gasto: number | null;
  created_at: string;
}

interface Resposta {
  id: number;
  candidato_id: number;
  questao_numero: number;
  resposta_selecionada: string;
  resposta_correta: string;
  acertou: boolean;
}

interface CandidatoDetalhe {
  candidato: Candidato;
  respostas: Resposta[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTempo(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}m ${s}s`;
}

// Skeleton placeholder for loading state
function SkeletonRow() {
  return (
    <tr className="border-t border-[#243356]">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[#1e3050] rounded animate-pulse" style={{ width: `${60 + (i * 13) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'aprovados' | 'reprovados'>('todos');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<CandidatoDetalhe | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  };

  const fetchCandidatos = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      const res = await fetch('/api/admin/candidatos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin');
        return;
      }

      if (!res.ok) throw new Error('Erro ao buscar candidatos');

      const data = await res.json();
      setCandidatos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchCandidatos();
  }, [fetchCandidatos, router]);

  async function openDetalhe(id: number) {
    setSelectedId(id);
    setLoadingDetalhe(true);
    setDetalhe(null);

    const token = getToken();
    try {
      const res = await fetch(`/api/admin/candidatos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin');
        return;
      }

      if (!res.ok) throw new Error('Erro ao buscar detalhe');

      const data = await res.json();
      setDetalhe(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetalhe(false);
    }
  }

  function closeModal() {
    setSelectedId(null);
    setDetalhe(null);
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  }

  const filtered = candidatos.filter((c) => {
    const matchSearch =
      c.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'todos' ||
      (filter === 'aprovados' && c.aprovado) ||
      (filter === 'reprovados' && !c.aprovado);
    return matchSearch && matchFilter;
  });

  const completados = candidatos.filter((c) => c.percentual != null);
  const totalAprovados = candidatos.filter((c) => c.aprovado === true).length;
  const totalReprovados = completados.filter((c) => c.aprovado === false).length;
  const mediaGeral =
    completados.length > 0
      ? (completados.reduce((acc, c) => acc + (c.percentual ?? 0), 0) / completados.length).toFixed(1)
      : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d1a30] to-[#0a1628]">
      {/* Header */}
      <header className="bg-[#111d32]/90 border-b border-[#1e3050] px-6 py-4 flex items-center justify-between backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <BarChart3 size={24} color="#c9a84c" />
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Painel de Resultados</h1>
            <span className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest">
              Painel RH
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-[#1e3050] hover:bg-[#243356] border border-[#243356] hover:border-[#c9a84c]/40 text-gray-300 hover:text-white rounded-xl px-4 py-2 transition-all text-sm font-medium"
        >
          <LogOut size={16} />
          Sair
        </button>
      </header>

      <main className="p-6 flex flex-col gap-6 max-w-screen-xl mx-auto">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden">
            <div className="bg-blue-500/10 rounded-full p-3 shrink-0">
              <Users size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Total de Candidatos</p>
              <p className="text-white text-3xl font-bold mt-0.5">{loading ? '—' : candidatos.length}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500/40" />
          </div>

          {/* Aprovados */}
          <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden">
            <div className="bg-green-500/10 rounded-full p-3 shrink-0">
              <CheckCircle size={22} className="text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Aprovados</p>
              <p className="text-white text-3xl font-bold mt-0.5">{loading ? '—' : totalAprovados}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500/40" />
          </div>

          {/* Reprovados */}
          <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden">
            <div className="bg-red-500/10 rounded-full p-3 shrink-0">
              <XCircle size={22} className="text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Reprovados</p>
              <p className="text-white text-3xl font-bold mt-0.5">{loading ? '—' : totalReprovados}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500/40" />
          </div>

          {/* Media */}
          <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden">
            <div className="bg-[#c9a84c]/10 rounded-full p-3 shrink-0">
              <TrendingUp size={22} className="text-[#c9a84c]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Media Geral</p>
              <p className="text-white text-3xl font-bold mt-0.5">{loading ? '—' : `${mediaGeral}%`}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a84c]/40" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 flex-1 focus-within:border-[#c9a84c] transition-colors">
            <Search size={16} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 text-white placeholder-gray-600 py-2.5 w-full focus:outline-none text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-[#111d32] border border-[#243356] text-white rounded-xl px-4 py-2.5 outline-none focus:border-[#c9a84c] transition-colors text-sm"
          >
            <option value="todos">Todos</option>
            <option value="aprovados">Aprovados</option>
            <option value="reprovados">Reprovados</option>
          </select>
          <button
            onClick={fetchCandidatos}
            className="flex items-center gap-2 bg-[#111d32] border border-[#243356] text-gray-300 hover:text-white hover:border-[#c9a84c]/60 rounded-xl px-4 py-2.5 transition-all text-sm font-medium"
          >
            <RefreshCw size={15} />
            Atualizar
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#111d32] border border-[#1e3050] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0d1729] text-gray-500 uppercase text-xs tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Telefone</th>
                    <th className="text-left px-4 py-3 font-medium">Nota</th>
                    <th className="text-left px-4 py-3 font-medium">Percentual</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Data</th>
                    <th className="text-left px-4 py-3 font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5 text-gray-600">
              <div className="bg-[#1a2744]/50 rounded-full p-6">
                <ClipboardList size={48} strokeWidth={1.2} />
              </div>
              <div className="text-center">
                <p className="text-gray-400 font-medium text-base">Nenhum candidato encontrado</p>
                <p className="text-gray-600 text-sm mt-1">
                  {search || filter !== 'todos'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Os candidatos aparecerão aqui após realizarem o teste'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0d1729] text-gray-500 uppercase text-xs tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Telefone</th>
                    <th className="text-left px-4 py-3 font-medium">Nota</th>
                    <th className="text-left px-4 py-3 font-medium">Percentual</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Data</th>
                    <th className="text-left px-4 py-3 font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#1a2744]/80 transition-colors border-t border-[#1e3050] ${
                        idx === 0 ? 'border-t-0' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-white font-medium">{c.nome_completo}</td>
                      <td className="px-4 py-3 text-gray-400">{c.email}</td>
                      <td className="px-4 py-3 text-gray-400">{c.telefone}</td>
                      <td className="px-4 py-3 text-gray-300">{c.nota != null ? `${c.nota}/20` : '—'}</td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          c.percentual != null ? (c.percentual >= 70 ? 'text-green-400' : 'text-red-400') : 'text-gray-500'
                        }`}
                      >
                        {c.percentual != null ? `${c.percentual.toFixed(1)}%` : 'Pendente'}
                      </td>
                      <td className="px-4 py-3">
                        {c.percentual == null ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                            PENDENTE
                          </span>
                        ) : c.aprovado ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                            <CheckCircle size={12} />
                            APROVADO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                            <XCircle size={12} />
                            REPROVADO
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetalhe(c.id)}
                          className="group relative text-gray-500 hover:text-[#c9a84c] transition-colors p-1.5 rounded-lg hover:bg-[#c9a84c]/10"
                          title="Ver detalhes"
                        >
                          <Eye size={17} />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#243356] text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#2d4a7a]">
                            Ver detalhes
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedId !== null && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-[#111d32] border border-[#1e3050] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {loadingDetalhe || !detalhe ? (
              <div className="flex items-center justify-center h-56">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={36} className="animate-spin text-[#c9a84c]" />
                  <p className="text-gray-500 text-sm">Carregando detalhes...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Modal Header — sticky */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e3050] bg-[#111d32] shrink-0">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-0.5">
                      Detalhe do Candidato
                    </p>
                    <h2 className="text-white font-bold text-xl leading-tight">
                      {detalhe.candidato.nome_completo}
                    </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 rounded-full bg-[#243356] hover:bg-[#2d3f66] flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
                    aria-label="Fechar"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
                  {/* Contact info cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0d1729] border border-[#1e3050] rounded-xl p-4 flex items-start gap-3">
                      <Mail size={15} className="text-[#c9a84c] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Email</p>
                        <p className="text-white text-sm break-all">{detalhe.candidato.email}</p>
                      </div>
                    </div>
                    <div className="bg-[#0d1729] border border-[#1e3050] rounded-xl p-4 flex items-start gap-3">
                      <Phone size={15} className="text-[#c9a84c] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Telefone</p>
                        <p className="text-white text-sm">{detalhe.candidato.telefone}</p>
                      </div>
                    </div>
                    <div className="bg-[#0d1729] border border-[#1e3050] rounded-xl p-4 flex items-start gap-3">
                      <Calendar size={15} className="text-[#c9a84c] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Data</p>
                        <p className="text-white text-sm">{formatDate(detalhe.candidato.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Result summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#0d1729] border border-[#1e3050] rounded-xl p-4 text-center">
                      <Award size={16} className="text-[#c9a84c] mx-auto mb-2" />
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Nota</p>
                      <p className="text-white text-2xl font-bold">{detalhe.candidato.nota}/20</p>
                    </div>
                    <div className="bg-[#0d1729] border border-[#1e3050] rounded-xl p-4 text-center">
                      <TrendingUp
                        size={16}
                        className={`mx-auto mb-2 ${(detalhe.candidato.percentual ?? 0) >= 70 ? 'text-green-400' : 'text-red-400'}`}
                      />
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Percentual</p>
                      <p
                        className={`text-2xl font-bold ${
                          (detalhe.candidato.percentual ?? 0) >= 70 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {(detalhe.candidato.percentual ?? 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-[#0d1729] border border-[#1e3050] rounded-xl p-4 text-center">
                      <Clock size={16} className="text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Tempo</p>
                      <p className="text-white text-2xl font-bold">
                        {detalhe.candidato.tempo_gasto != null ? formatTempo(detalhe.candidato.tempo_gasto) : '—'}
                      </p>
                    </div>
                    <div className="bg-[#0d1729] border border-[#1e3050] rounded-xl p-4 text-center flex flex-col items-center">
                      {detalhe.candidato.aprovado ? (
                        <CheckCircle size={16} className="text-green-400 mb-2" />
                      ) : (
                        <XCircle size={16} className="text-red-400 mb-2" />
                      )}
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Status</p>
                      {detalhe.candidato.aprovado ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                          <CheckCircle size={11} />
                          APROVADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                          <XCircle size={11} />
                          REPROVADO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-[#0d1729] border border-[#1e3050] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Desempenho Geral</p>
                      <p className={`text-sm font-bold ${(detalhe.candidato.percentual ?? 0) >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                        {(detalhe.candidato.percentual ?? 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full bg-[#1e3050] rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          (detalhe.candidato.percentual ?? 0) >= 70 ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${detalhe.candidato.percentual ?? 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-gray-600 text-xs">0%</span>
                      <span className="text-gray-500 text-xs">Minimo: 70%</span>
                      <span className="text-gray-600 text-xs">100%</span>
                    </div>
                  </div>

                  {/* Questions list */}
                  {detalhe.respostas.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h3 className="text-gray-300 font-semibold text-xs uppercase tracking-wider">
                        Respostas ({detalhe.respostas.length} questoes)
                      </h3>
                      {detalhe.respostas.map((r) => (
                        <div
                          key={r.id}
                          className={`bg-[#0d1729] rounded-xl p-4 flex flex-col gap-2 border-l-2 ${
                            r.acertou ? 'border-l-green-500' : 'border-l-red-500'
                          } border border-[#1e3050]`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">
                              Questao {r.questao_numero}
                            </p>
                            {r.acertou ? (
                              <CheckCircle size={15} className="text-green-400" />
                            ) : (
                              <XCircle size={15} className="text-red-400" />
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              r.acertou ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            <span className="font-medium">Resposta selecionada:</span>
                            <span>{r.resposta_selecionada}</span>
                          </div>
                          {!r.acertou && (
                            <div className="flex items-center gap-2 text-sm text-green-400 pl-0">
                              <CheckCircle size={13} className="shrink-0" />
                              <span className="font-medium">Resposta correta:</span>
                              <span>{r.resposta_correta}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer close button */}
                <div className="px-6 py-4 border-t border-[#1e3050] bg-[#111d32] shrink-0">
                  <button
                    onClick={closeModal}
                    className="w-full border border-[#243356] hover:border-[#c9a84c]/40 text-gray-300 hover:text-white rounded-xl py-3 transition-all text-sm font-semibold hover:bg-[#1e3050]/50"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
