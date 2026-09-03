import { formatKg } from "./format";
import type { HistoryRecord } from "./storage";
import type { SetEntry } from "./types";

/**
 * Resumo do que foi feito num exercício numa sessão. Guarda faixas porque uma
 * sessão real varia entre séries — dizer "4×8 · 60 kg" quando foram 8, 8 e 7
 * reps seria inventar.
 */
export interface ExerciseSummary {
  sets: number;
  repsMin: number;
  repsMax: number;
  weightMin: number;
  weightMax: number;
  finishedAt: number;
}

function summarize(entries: SetEntry[], finishedAt: number): ExerciseSummary {
  const reps = entries.map((e) => e.reps);
  const weights = entries.map((e) => e.weightKg);
  return {
    sets: entries.length,
    repsMin: Math.min(...reps),
    repsMax: Math.max(...reps),
    weightMin: Math.min(...weights),
    weightMax: Math.max(...weights),
    finishedAt,
  };
}

/**
 * A última sessão concluída que incluiu este exercício. É daqui que sai o
 * "última vez" — o campo `previous` do plano é só a semente da primeira vez.
 */
export function lastSummaryFor(
  history: HistoryRecord[],
  exerciseId: string,
): ExerciseSummary | null {
  // Ordena em vez de confiar na ordem de inserção: um dia isso vem de import.
  const recent = [...history].sort((a, b) => b.finishedAt - a.finishedAt);
  for (const record of recent) {
    const entries = record.entries.filter((e) => e.exerciseId === exerciseId);
    if (entries.length > 0) return summarize(entries, record.finishedAt);
  }
  return null;
}

const range = (min: number, max: number, format: (v: number) => string) =>
  min === max ? format(min) : `${format(min)}–${format(max)}`;

/** "4×8 · 60 kg", ou "4×7–8 · 60–62,5 kg" quando a sessão variou. */
export function formatSummary(summary: ExerciseSummary): string {
  const reps = range(summary.repsMin, summary.repsMax, String);
  const weight = range(summary.weightMin, summary.weightMax, formatKg);
  return `${summary.sets}×${reps} · ${weight} kg`;
}
