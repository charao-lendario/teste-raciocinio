'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Clock,
  FileText,
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle,
  Circle,
  Trophy,
  AlertTriangle,
  Home,
  Target,
  TrendingUp,
} from 'lucide-react';
import { questions } from '@/lib/questions';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TOTAL = questions.length; // 20
const TOTAL_SECONDS = 25 * 60; // 1500

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatElapsed(seconds: number): string {
  const elapsed = TOTAL_SECONDS - seconds;
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}m ${s}s`;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

// ─── Skeleton fallback ───────────────────────────────────────────────────────

function TesteSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] text-white">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-[#111d32] border-b border-[#243356] shadow-lg shadow-black/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="h-5 w-32 bg-[#243356] rounded-full animate-pulse hidden sm:block" />
          <div className="flex-1 max-w-sm space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-[#243356] rounded-full animate-pulse" />
              <div className="h-3 w-8 bg-[#243356] rounded-full animate-pulse" />
            </div>
            <div className="h-2.5 bg-[#243356] rounded-full animate-pulse" />
          </div>
          <div className="h-5 w-20 bg-[#243356] rounded-full animate-pulse" />
        </div>
      </div>

      {/* Card skeleton */}
      <main className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1a2744] rounded-2xl p-5 sm:p-8 md:p-10 border border-[#1e3050] shadow-xl space-y-6">
          <div className="h-6 w-28 bg-[#243356] rounded-full animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-[#243356] rounded-full animate-pulse" />
            <div className="h-4 w-5/6 bg-[#243356] rounded-full animate-pulse" />
            <div className="h-4 w-4/6 bg-[#243356] rounded-full animate-pulse" />
          </div>
          <hr className="border-[#243356]/50" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-[#111d32] rounded-xl border border-[#243356] animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Result screen ───────────────────────────────────────────────────────────

interface ResultData {
  nota: number;
  percentual: number;
  aprovado: boolean;
}

function ResultScreen({
  result,
  timeLeft,
  onHome,
}: {
  result: ResultData;
  timeLeft: number;
  onHome: () => void;
}) {
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (result.percentual / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="relative w-full max-w-lg bg-[#1a2744] rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl border border-[#1e3050] overflow-hidden">

        {/* Decorative gold circles for approved state */}
        {result.aprovado && (
          <>
            <div className="absolute top-4 left-8 w-3 h-3 rounded-full bg-[#c9a84c] opacity-20" />
            <div className="absolute top-10 left-20 w-1.5 h-1.5 rounded-full bg-[#c9a84c] opacity-30" />
            <div className="absolute top-6 right-12 w-4 h-4 rounded-full bg-[#c9a84c] opacity-20" />
            <div className="absolute top-16 right-6 w-2 h-2 rounded-full bg-[#c9a84c] opacity-40" />
            <div className="absolute top-3 right-28 w-1.5 h-1.5 rounded-full bg-[#c9a84c] opacity-25" />
            <div className="absolute bottom-20 left-6 w-2.5 h-2.5 rounded-full bg-[#c9a84c] opacity-20" />
            <div className="absolute bottom-28 right-8 w-3 h-3 rounded-full bg-[#c9a84c] opacity-30" />
            <div className="absolute bottom-12 right-24 w-1.5 h-1.5 rounded-full bg-[#c9a84c] opacity-25" />
            <div className="absolute top-24 left-4 w-1 h-1 rounded-full bg-[#c9a84c] opacity-40" />
            <div className="absolute bottom-16 left-20 w-2 h-2 rounded-full bg-[#c9a84c] opacity-20" />
          </>
        )}

        {/* Icon + title */}
        <div className="relative flex flex-col items-center gap-3 mb-8">
          {result.aprovado ? (
            <Trophy size={60} className="text-[#c9a84c]" />
          ) : (
            <AlertTriangle size={60} className="text-red-400" />
          )}
          <h1 className="text-3xl font-bold text-white">
            {result.aprovado ? 'Parabéns!' : 'Teste Finalizado'}
          </h1>
          <span
            className={`text-sm font-bold tracking-widest px-5 py-1.5 rounded-full ${
              result.aprovado
                ? 'bg-green-900/50 text-green-400 border border-green-700'
                : 'bg-red-900/40 text-red-400 border border-red-800'
            }`}
          >
            {result.aprovado ? 'APROVADO' : 'CONTINUE PRATICANDO!'}
          </span>
        </div>

        {/* Summary sentence */}
        <p className="text-center text-slate-300 text-sm mb-8 leading-relaxed">
          Você acertou{' '}
          <span className="text-[#c9a84c] font-semibold">{result.nota}</span>{' '}
          de{' '}
          <span className="text-white font-semibold">{TOTAL}</span>{' '}
          questões em{' '}
          <span className="text-white font-semibold">{formatElapsed(timeLeft)}</span>
        </p>

        {/* Circular progress */}
        <div className="flex justify-center mb-8">
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#243356"
              strokeWidth="10"
            />
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={result.aprovado ? '#22c55e' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 75 75)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <text
              x="75"
              y="69"
              textAnchor="middle"
              fill="white"
              fontSize="22"
              fontWeight="bold"
            >
              {result.percentual}%
            </text>
            <text x="75" y="87" textAnchor="middle" fill="#94a3b8" fontSize="12">
              acertos
            </text>
          </svg>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-[#111d32] rounded-xl p-3 sm:p-4 text-center">
            <Target size={18} className="text-[#c9a84c] mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-[#c9a84c]">
              {result.nota}/{TOTAL}
            </p>
            <p className="text-xs text-slate-400 mt-1">Acertos</p>
          </div>
          <div className="bg-[#111d32] rounded-xl p-3 sm:p-4 text-center">
            <TrendingUp size={18} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">{result.percentual}%</p>
            <p className="text-xs text-slate-400 mt-1">Aproveitamento</p>
          </div>
          <div className="bg-[#111d32] rounded-xl p-3 sm:p-4 text-center">
            <Clock size={18} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">{formatElapsed(timeLeft)}</p>
            <p className="text-xs text-slate-400 mt-1">Tempo gasto</p>
          </div>
        </div>

        {/* Minimum note */}
        <p className="text-center text-sm text-slate-400 mb-8">
          A nota mínima para aprovação é{' '}
          <span className="text-[#c9a84c] font-medium">70%</span> de acertos.
        </p>

        {/* Back button */}
        <button
          onClick={onHome}
          className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8943d] hover:scale-[1.02] text-[#0a1628] font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#c9a84c]/20"
        >
          <Home size={18} />
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}

// ─── Main test component ─────────────────────────────────────────────────────

function TesteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get('id');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  // Redirect if no id
  useEffect(() => {
    if (!id) {
      router.replace('/');
    }
  }, [id, router]);

  // Calculate result and POST to API
  const submitTest = useCallback(
    async (finalAnswers: Record<number, string>, remainingTime: number) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      let nota = 0;
      const respostas = questions.map((q, idx) => {
        const selected = finalAnswers[idx] ?? '';
        const acertou = selected === q.correctAnswer;
        if (acertou) nota++;
        return {
          questaoNumero: idx + 1,
          respostaSelecionada: selected,
          respostaCorreta: q.correctAnswer,
          acertou,
        };
      });

      const percentual = Math.round((nota / TOTAL) * 100);
      const aprovado = percentual >= 70;
      const tempoGasto = TOTAL_SECONDS - remainingTime;

      // Optimistically update UI
      setResult({ nota, percentual, aprovado });
      setIsFinished(true);

      // POST in background — UI is already shown
      try {
        await fetch('/api/resultado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidatoId: id,
            respostas,
            nota,
            totalQuestoes: TOTAL,
            percentual,
            aprovado,
            tempoGasto,
          }),
        });
      } catch {
        // Non-blocking; result screen is already displayed
      }

      setIsSubmitting(false);
    },
    [id, isSubmitting]
  );

  // Timer
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-submit with current answers snapshot
          setAnswers((currentAnswers) => {
            submitTest(currentAnswers, 0);
            return currentAnswers;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished, submitTest]);

  // Don't render while redirecting
  if (!id) return null;

  // Result screen
  if (isFinished && result) {
    return (
      <ResultScreen
        result={result}
        timeLeft={timeLeft}
        onHome={() => router.push('/')}
      />
    );
  }

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / TOTAL) * 100);
  const allAnswered = answeredCount === TOTAL;
  const isTimeLow = timeLeft < 5 * 60;
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === TOTAL - 1;

  function selectAnswer(option: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: option }));
  }

  function goNext() {
    if (!isLast) setCurrentQuestion((q) => q + 1);
  }

  function goPrev() {
    if (!isFirst) setCurrentQuestion((q) => q - 1);
  }

  function handleFinish() {
    if (!allAnswered || isSubmitting) return;
    submitTest(answers, timeLeft);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-[#111d32] border-b border-[#243356] shadow-lg shadow-black/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">

          {/* Left: question counter */}
          <div className="flex items-center gap-2 text-sm text-slate-300 min-w-0 sm:min-w-[140px]">
            <FileText size={17} className="text-[#c9a84c] flex-shrink-0" />
            <span>
              Questão{' '}
              <span className="text-[#c9a84c] font-bold text-base">
                {currentQuestion + 1}
              </span>{' '}
              <span className="text-slate-400">de {TOTAL}</span>
            </span>
          </div>

          {/* Center: progress bar */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>{answeredCount} respondidas</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2.5 bg-[#243356] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c9a84c] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 font-mono font-bold text-sm sm:text-base min-w-0 sm:min-w-[100px] justify-end ${
              isTimeLow ? 'text-red-400' : 'text-white'
            }`}
          >
            <Clock
              size={17}
              className={isTimeLow ? 'text-red-400 animate-pulse' : 'text-[#c9a84c]'}
            />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto py-5 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1a2744] rounded-2xl p-5 sm:p-8 md:p-10 border border-[#1e3050] shadow-xl">

          {/* Question badge + text */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 bg-[#c9a84c] text-[#0a1628] text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              <FileText size={12} />
              Questão {currentQuestion + 1}
            </span>
            <p className="text-base sm:text-lg md:text-xl font-medium text-white leading-relaxed">
              {question.text}
            </p>
          </div>

          <hr className="border-[#243356]/50 mb-6" />

          {/* Options */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-10">
            {question.options.map((option, idx) => {
              const letter = OPTION_LETTERS[idx];
              const isSelected = answers[currentQuestion] === option;
              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(option)}
                  className={`flex items-center gap-3 sm:gap-4 w-full text-left rounded-xl p-3.5 sm:p-5 border-2 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#c9a84c] border-l-4 border-l-[#c9a84c] bg-[#c9a84c]/5 hover:shadow-md hover:shadow-[#c9a84c]/10'
                      : 'border-[#243356] bg-[#111d32] hover:bg-[#1a2744] hover:border-[#3d5070] hover:shadow-md hover:shadow-[#c9a84c]/10 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Letter circle */}
                  <span
                    className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 ${
                      isSelected
                        ? 'border-[#c9a84c] bg-[#c9a84c]/15 text-[#c9a84c]'
                        : 'border-[#3d5070] text-slate-400'
                    }`}
                  >
                    {letter}
                  </span>

                  {/* Option text */}
                  <span
                    className={`flex-1 text-sm leading-snug ${
                      isSelected ? 'text-white font-medium' : 'text-slate-300'
                    }`}
                  >
                    {option}
                  </span>

                  {/* Selection icon */}
                  {isSelected ? (
                    <CheckCircle size={20} className="text-[#c9a84c] flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-slate-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="pt-4 sm:pt-6 border-t border-[#243356]/50">
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-5">
              {/* Previous */}
              <button
                onClick={goPrev}
                disabled={isFirst}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#243356] text-white text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2d3f66] disabled:hover:bg-[#243356] hover:-translate-y-0.5"
              >
                <ArrowLeft size={16} />
                Anterior
              </button>

              {/* Next / Finish */}
              {isLast ? (
                <button
                  onClick={handleFinish}
                  disabled={!allAnswered || isSubmitting}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#c9a84c] hover:bg-[#b8943d] text-[#0a1628] text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#c9a84c] shadow-lg shadow-[#c9a84c]/20 hover:-translate-y-0.5 ${
                    allAnswered && !isSubmitting ? 'animate-pulse' : ''
                  }`}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Enviando...' : 'Finalizar Teste'}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#c9a84c] hover:bg-[#b8943d] text-[#0a1628] text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                >
                  Próxima
                  <ArrowRight size={16} />
                </button>
              )}
            </div>

            {/* Question dots */}
            <div className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 mb-3">
              {questions.map((_, idx) => {
                const isCurrent = idx === currentQuestion;
                const isAnswered = answers[idx] !== undefined;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    title={`Questão ${idx + 1}`}
                    className={`w-6 h-6 rounded-full transition-all duration-200 text-[9px] font-bold flex items-center justify-center hover:scale-110 ${
                      isCurrent
                        ? 'ring-2 ring-[#c9a84c] ring-offset-2 ring-offset-[#1a2744] bg-[#c9a84c] text-[#0a1628]'
                        : isAnswered
                        ? 'bg-[#c9a84c] text-[#0a1628]'
                        : 'bg-[#243356] text-slate-400 hover:bg-[#2d3f66]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Answered count label */}
            <p className="text-center text-xs text-slate-500">
              <span className="text-slate-300">{answeredCount}</span> de{' '}
              <span className="text-slate-300">{TOTAL}</span> respondidas
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Page export with Suspense boundary ─────────────────────────────────────

export default function TestePage() {
  return (
    <Suspense fallback={<TesteSkeleton />}>
      <TesteContent />
    </Suspense>
  );
}
