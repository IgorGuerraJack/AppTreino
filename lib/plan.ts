import type { PlannedExercise, RotationPlan, Workout } from "./types";

/**
 * Semente da rotação. A partir da primeira edição quem manda é o que está
 * gravado no aparelho — isto aqui só preenche a primeira abertura. Um
 * treino só, porque a rotação nasce vazia e o usuário monta a sequência.
 */
export const DEFAULT_PLAN: RotationPlan = {
  workouts: [
    {
      id: "superiores",
      title: "Superiores",
      exercises: [
        {
          id: "supino-inclinado",
          name: "Supino inclinado",
          icon: "barbell",
          targetSets: 3,
          targetReps: 10,
          suggestedWeightKg: 22,
          restSeconds: 90,
          previous: { sets: 3, reps: 10, weightKg: 22 },
        },
        {
          id: "remada-curvada",
          name: "Remada curvada",
          icon: "stretching",
          targetSets: 4,
          targetReps: 8,
          suggestedWeightKg: 60,
          restSeconds: 90,
          previous: { sets: 4, reps: 8, weightKg: 60 },
        },
      ],
    },
  ],
};

export function workoutById(plan: RotationPlan, id: string | null): Workout | null {
  if (id === null) return null;
  return plan.workouts.find((w) => w.id === id) ?? null;
}

/**
 * O treino seguinte na rotação, depois de `afterId`. Some da sequência (foi
 * removido) → cai no primeiro. Rotação vazia → null.
 */
export function nextWorkoutId(plan: RotationPlan, afterId: string | null): string | null {
  if (plan.workouts.length === 0) return null;
  const index = plan.workouts.findIndex((w) => w.id === afterId);
  if (index === -1) return plan.workouts[0].id;
  return plan.workouts[(index + 1) % plan.workouts.length].id;
}

export function totalSets(workout: Workout): number {
  return workout.exercises.reduce((sum, e) => sum + e.targetSets, 0);
}

export function makeId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

/** Exercício novo nasce com valores plausíveis, não com zeros para preencher. */
export function newExercise(): PlannedExercise {
  return {
    id: makeId("ex"),
    name: "",
    icon: "barbell",
    targetSets: 3,
    targetReps: 10,
    suggestedWeightKg: 20,
    restSeconds: 90,
  };
}

/**
 * Nasce sem exercícios: quem preenche é sempre o "Adicionar exercício" que
 * vem em seguida — já vir com um faria dois.
 */
export function newWorkout(title = "Treino"): Workout {
  return {
    id: makeId("treino"),
    title,
    exercises: [],
  };
}

/** A próxima letra livre — A, B, C… — para nomear um treino novo. */
export function nextWorkoutLetter(plan: RotationPlan): string {
  const used = new Set(
    plan.workouts
      .map((w) => /^Treino ([A-Z])$/.exec(w.title)?.[1])
      .filter((letter): letter is string => Boolean(letter)),
  );
  for (let i = 0; i < 26; i += 1) {
    const letter = String.fromCharCode(65 + i);
    if (!used.has(letter)) return letter;
  }
  return String(plan.workouts.length + 1);
}

/** Limites dos steppers — barram valores absurdos sem exigir precisão. */
export const LIMITS = {
  sets: { min: 1, max: 12, step: 1 },
  reps: { min: 1, max: 50, step: 1 },
  weight: { min: 0, max: 500, step: 2.5 },
  rest: { min: 15, max: 600, step: 15 },
} as const;
