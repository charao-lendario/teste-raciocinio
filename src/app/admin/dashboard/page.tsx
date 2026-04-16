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
  Download,
  KeyRound,
  Lock,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { questions } from '@/lib/questions';

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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpCurrentPassword, setCpCurrentPassword] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');
  const [cpConfirmPassword, setCpConfirmPassword] = useState('');
  const [cpShowPassword, setCpShowPassword] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState(false);

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
      setCandidatos(
        (data as Candidato[]).map((c) => ({
          ...c,
          nota: c.nota != null ? Number(c.nota) : null,
          percentual: c.percentual != null ? Number(c.percentual) : null,
          tempo_gasto: c.tempo_gasto != null ? Number(c.tempo_gasto) : null,
        }))
      );
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

      const data = await res.json() as CandidatoDetalhe;
      setDetalhe({
        ...data,
        candidato: {
          ...data.candidato,
          nota: data.candidato.nota != null ? Number(data.candidato.nota) : null,
          percentual: data.candidato.percentual != null ? Number(data.candidato.percentual) : null,
          tempo_gasto: data.candidato.tempo_gasto != null ? Number(data.candidato.tempo_gasto) : null,
        },
      });
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

  function downloadPDF(det: CandidatoDetalhe) {
    const c = det.candidato;
    const perc = (c.percentual ?? 0).toFixed(0);
    const status = c.aprovado ? 'APROVADO' : 'REPROVADO';
    const statusColor = c.aprovado ? '#16a34a' : '#dc2626';
    const statusBg = c.aprovado ? '#dcfce7' : '#fee2e2';
    const tempo = c.tempo_gasto != null ? formatTempo(c.tempo_gasto) : '—';
    const acertos = c.nota ?? 0;
    const erros = 20 - acertos;
    const dataFormatada = formatDate(c.created_at);

    const questoesHTML = det.respostas.map((r) => {
      const q = questions.find((qq) => qq.id === r.questao_numero);
      const enunciado = q?.text ?? `Questao ${r.questao_numero}`;
      const isCorrect = r.acertou;

      return `
        <div style="background:${isCorrect ? '#f0fdf4' : '#fef2f2'};border:1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'};border-left:4px solid ${isCorrect ? '#16a34a' : '#dc2626'};border-radius:8px;padding:16px;margin-bottom:12px;page-break-inside:avoid;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <span style="background:${isCorrect ? '#16a34a' : '#dc2626'};color:white;font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px;">
              Questao ${r.questao_numero} - ${isCorrect ? 'CORRETA' : 'ERRADA'}
            </span>
          </div>
          <p style="font-size:13px;color:#374151;line-height:1.5;margin-bottom:10px;font-weight:500;">
            ${enunciado}
          </p>
          <div style="display:flex;gap:24px;flex-wrap:wrap;">
            <div>
              <span style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Resposta do candidato:</span>
              <span style="margin-left:6px;font-size:13px;color:${isCorrect ? '#16a34a' : '#dc2626'};font-weight:600;">
                ${r.resposta_selecionada || 'Nao respondeu'}
              </span>
            </div>
            ${!isCorrect ? `
              <div>
                <span style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Resposta correta:</span>
                <span style="margin-left:6px;font-size:13px;color:#16a34a;font-weight:600;">
                  ${r.resposta_correta}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Resultado - ${c.nome_completo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; background: white; }
          @media print {
            body { padding: 0; }
            .page { padding: 24px; }
            .no-break { page-break-inside: avoid; }
          }
          @page { margin: 15mm; }
        </style>
      </head>
      <body>
        <div class="page" style="padding:40px;max-width:800px;margin:0 auto;">

          <!-- CABECALHO -->
          <div style="text-align:center;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #0a1628;">
            <h1 style="font-size:24px;color:#0a1628;margin-bottom:6px;letter-spacing:-0.5px;">
              Teste de Raciocinio Logico e Atencao Concentrada
            </h1>
            <p style="font-size:14px;color:#6b7280;">Relatorio Individual de Desempenho</p>
          </div>

          <!-- DADOS DO CANDIDATO -->
          <div class="no-break" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <h2 style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:14px;">
              Dados do Candidato
            </h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 32px;">
              <div>
                <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Nome Completo</span>
                <p style="font-size:15px;color:#1e293b;font-weight:600;margin-top:2px;">${c.nome_completo}</p>
              </div>
              <div>
                <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Email</span>
                <p style="font-size:15px;color:#1e293b;font-weight:500;margin-top:2px;">${c.email}</p>
              </div>
              <div>
                <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Telefone</span>
                <p style="font-size:15px;color:#1e293b;font-weight:500;margin-top:2px;">${c.telefone}</p>
              </div>
              <div>
                <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Data de Realizacao</span>
                <p style="font-size:15px;color:#1e293b;font-weight:500;margin-top:2px;">${dataFormatada}</p>
              </div>
            </div>
          </div>

          <!-- RESULTADO PRINCIPAL -->
          <div class="no-break" style="background:${statusBg};border:2px solid ${statusColor};border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
            <div style="font-size:48px;font-weight:800;color:${statusColor};line-height:1;">${perc}%</div>
            <div style="font-size:20px;font-weight:700;color:${statusColor};margin-top:4px;letter-spacing:2px;">${status}</div>
            <p style="font-size:13px;color:#6b7280;margin-top:8px;">
              O candidato acertou <strong>${acertos} de 20</strong> questoes em <strong>${tempo}</strong>
            </p>
            <div style="margin-top:14px;background:white;border-radius:6px;height:12px;overflow:hidden;">
              <div style="height:100%;width:${c.percentual ?? 0}%;background:${statusColor};border-radius:6px;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <span style="font-size:10px;color:#94a3b8;">0%</span>
              <span style="font-size:10px;color:#94a3b8;font-weight:600;">Minimo: 70%</span>
              <span style="font-size:10px;color:#94a3b8;">100%</span>
            </div>
          </div>

          <!-- RESUMO NUMERICO -->
          <div class="no-break" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:28px;">
            <div style="text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
              <div style="font-size:28px;font-weight:800;color:#c9a84c;">${acertos}</div>
              <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Acertos</div>
            </div>
            <div style="text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
              <div style="font-size:28px;font-weight:800;color:#dc2626;">${erros}</div>
              <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Erros</div>
            </div>
            <div style="text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
              <div style="font-size:28px;font-weight:800;color:#1e293b;">${tempo}</div>
              <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Tempo</div>
            </div>
            <div style="text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
              <div style="font-size:28px;font-weight:800;color:${statusColor};">${perc}%</div>
              <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Aproveitamento</div>
            </div>
          </div>

          <!-- DETALHAMENTO DAS QUESTOES -->
          <div style="margin-bottom:20px;">
            <h2 style="font-size:14px;color:#0a1628;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;border-bottom:2px solid #e2e8f0;margin-bottom:16px;">
              Detalhamento por Questao
            </h2>
            ${questoesHTML}
          </div>

          <!-- RODAPE -->
          <div style="text-align:center;padding-top:20px;border-top:2px solid #e2e8f0;margin-top:16px;">
            <p style="font-size:11px;color:#94a3b8;">
              Relatorio gerado em ${dataFormatada}
            </p>
            <p style="font-size:11px;color:#94a3b8;margin-top:2px;">
              Teste de Raciocinio Logico e Atencao Concentrada &mdash; Processo Seletivo
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setCpError('');

    if (cpNewPassword !== cpConfirmPassword) {
      setCpError('As senhas não coincidem');
      return;
    }

    if (cpNewPassword.length < 6) {
      setCpError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCpLoading(true);
    const token = getToken();

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: cpCurrentPassword,
          newPassword: cpNewPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCpError(data.error || 'Erro ao alterar senha');
        return;
      }

      setCpSuccess(true);
    } catch {
      setCpError('Erro ao conectar com o servidor');
    } finally {
      setCpLoading(false);
    }
  }

  function closeChangePassword() {
    setShowChangePassword(false);
    setCpCurrentPassword('');
    setCpNewPassword('');
    setCpConfirmPassword('');
    setCpShowPassword(false);
    setCpError('');
    setCpSuccess(false);
    setCpLoading(false);
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
      <header className="bg-[#111d32]/90 border-b border-[#1e3050] backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BarChart3 size={24} color="#c9a84c" />
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Painel de Resultados</h1>
              <span className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest">
                Painel RH
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-2 bg-[#1e3050] hover:bg-[#243356] border border-[#243356] hover:border-[#c9a84c]/40 text-gray-300 hover:text-white rounded-xl px-4 py-2 transition-all text-sm font-medium"
              title="Alterar senha"
            >
              <KeyRound size={16} />
              <span className="hidden sm:inline">Alterar Senha</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#1e3050] hover:bg-[#243356] border border-[#243356] hover:border-[#c9a84c]/40 text-gray-300 hover:text-white rounded-xl px-4 py-2 transition-all text-sm font-medium"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 lg:px-12 py-8 flex flex-col gap-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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

                {/* Footer buttons */}
                <div className="px-6 py-4 border-t border-[#1e3050] bg-[#111d32] shrink-0 flex gap-3">
                  <button
                    onClick={() => downloadPDF(detalhe)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold rounded-xl py-3 transition-all text-sm cursor-pointer"
                  >
                    <Download size={16} />
                    Baixar PDF
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 border border-[#243356] hover:border-[#c9a84c]/40 text-gray-300 hover:text-white rounded-xl py-3 transition-all text-sm font-semibold hover:bg-[#1e3050]/50 cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeChangePassword();
          }}
        >
          <div className="bg-[#111d32] border border-[#1e3050] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e3050]">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-0.5">Segurança</p>
                <h2 className="text-white font-bold text-lg">Alterar Senha</h2>
              </div>
              <button
                onClick={closeChangePassword}
                className="w-10 h-10 rounded-full bg-[#243356] hover:bg-[#2d3f66] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {cpSuccess ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 bg-green-900/30 border border-green-800 rounded-xl p-4 w-full">
                    <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                    <p className="text-green-400 text-sm">Senha alterada com sucesso!</p>
                  </div>
                  <button
                    onClick={closeChangePassword}
                    className="bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold rounded-xl py-3 px-8 transition-all text-sm"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">Senha atual</label>
                    <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] transition-colors">
                      <Lock size={16} className="text-gray-500 shrink-0" />
                      <input
                        type={cpShowPassword ? 'text' : 'password'}
                        placeholder="Digite a senha atual"
                        value={cpCurrentPassword}
                        onChange={(e) => setCpCurrentPassword(e.target.value)}
                        required
                        className="bg-transparent border-0 text-white placeholder-gray-600 py-3 w-full focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">Nova senha</label>
                    <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] transition-colors">
                      <Lock size={16} className="text-gray-500 shrink-0" />
                      <input
                        type={cpShowPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={cpNewPassword}
                        onChange={(e) => setCpNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-transparent border-0 text-white placeholder-gray-600 py-3 w-full focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setCpShowPassword((prev) => !prev)}
                        className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                        tabIndex={-1}
                        aria-label={cpShowPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {cpShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">Confirmar nova senha</label>
                    <div className="flex items-center gap-3 bg-[#111d32] border border-[#243356] rounded-xl px-4 focus-within:border-[#c9a84c] transition-colors">
                      <Lock size={16} className="text-gray-500 shrink-0" />
                      <input
                        type={cpShowPassword ? 'text' : 'password'}
                        placeholder="Repita a nova senha"
                        value={cpConfirmPassword}
                        onChange={(e) => setCpConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-transparent border-0 text-white placeholder-gray-600 py-3 w-full focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {cpError && (
                    <div className="flex items-center gap-3 bg-red-900/30 border border-red-800 rounded-xl p-3">
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                      <p className="text-red-400 text-sm">{cpError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={cpLoading}
                    className="flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8952f] text-[#0a1628] font-semibold rounded-xl py-3.5 mt-1 transition-all shadow-lg shadow-[#c9a84c]/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                  >
                    {cpLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      'Alterar Senha'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
