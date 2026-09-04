import { DEFAULT_PLAN } from "./plan";
import type { RotationPlan, SessionState, SetEntry } from "./types";

const KEY = "apptreino:v1";

export interface HistoryRecord {
  workoutId: string;
  startedAt: number;
  finishedAt: number;
  entries: SetEntry[];
}

export interface PersistedState {
  /** O plano é editável: a constante em plan.ts é só a semente. */
  plan: RotationPlan;
  /** O treino no topo da fila — o que "Iniciar treino" abre. */
  currentWorkoutId: string | null;
  session: SessionState | null;
  history: HistoryRecord[];
  /** Último peso usado por exercício — é o que pré-preenche a próxima sessão. */
  lastWeights: Record<string, number>;
}

export const EMPTY_STATE: PersistedState = {
  plan: DEFAULT_PLAN,
  currentWorkoutId: DEFAULT_PLAN.workouts[0]?.id ?? null,
  session: null,
  history: [],
  lastWeights: {},
};

/**
 * Grava local e sem rede. A sincronização é um passo posterior — o registro
 * da série nunca pode depender do sinal da academia.
 */
export function loadState(): PersistedState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    // Uma rotação sem treinos é um estado legítimo (usuário removeu tudo);
    // só a ausência da chave (instalação antiga) volta para a semente.
    const plan =
      parsed.plan && Array.isArray(parsed.plan.workouts) ? parsed.plan : DEFAULT_PLAN;
    const hasCurrent =
      typeof parsed.currentWorkoutId === "string" &&
      plan.workouts.some((w) => w.id === parsed.currentWorkoutId);
    return {
      plan,
      // Instalação de antes da rotação (ou o treino apontado foi removido):
      // cai no primeiro da fila.
      currentWorkoutId: hasCurrent ? (parsed.currentWorkoutId as string) : (plan.workouts[0]?.id ?? null),
      session: parsed.session ?? null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      lastWeights: parsed.lastWeights ?? {},
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* cota cheia ou modo privado: o treino continua, só não persiste */
  }
}
