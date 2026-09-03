export type ExerciseIcon = "barbell" | "stretching";

/** Marca de uma sessão anterior — alimenta o "última vez" e o peso pré-preenchido. */
export interface PreviousResult {
  sets: number;
  reps: number;
  weightKg: number;
}

export interface PlannedExercise {
  id: string;
  name: string;
  icon: ExerciseIcon;
  targetSets: number;
  targetReps: number;
  /** Peso do plano, usado quando não há histórico. */
  suggestedWeightKg: number;
  restSeconds: number;
  previous?: PreviousResult;
}

export interface Workout {
  id: string;
  title: string;
  /** Dia da semana em que o treino cai — 1 = segunda … 7 = domingo (ISO). */
  isoWeekday: number;
  exercises: PlannedExercise[];
}

/** Uma série efetivamente registrada. */
export interface SetEntry {
  exerciseId: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  at: number;
}

export interface SessionState {
  workoutId: string;
  startedAt: number;
  entries: SetEntry[];
  /** Timestamp em que o descanso acaba; null quando não há descanso rodando. */
  restEndsAt: number | null;
  /** Duração base do descanso atual, para o botão de reiniciar. */
  restBaseSeconds: number;
  finishedAt: number | null;
}

/** Posição corrente derivada do plano + séries registradas. */
export interface SessionCursor {
  exerciseIndex: number;
  exercise: PlannedExercise;
  setIndex: number;
  isLastSetOfExercise: boolean;
  isLastExercise: boolean;
  done: false;
}

export interface SessionFinished {
  done: true;
}

export type Cursor = SessionCursor | SessionFinished;
