import type { SessionState, SetEntry } from "./types";

const KEY = "apptreino:v1";

export interface HistoryRecord {
  workoutId: string;
  startedAt: number;
  finishedAt: number;
  entries: SetEntry[];
}

export interface PersistedState {
  session: SessionState | null;
  history: HistoryRecord[];
  /** Último peso usado por exercício — é o que pré-preenche a próxima sessão. */
  lastWeights: Record<string, number>;
}

export const EMPTY_STATE: PersistedState = {
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
    return {
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
