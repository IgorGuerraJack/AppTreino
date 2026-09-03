import type { PlannedExercise, WeekPlan, Workout } from "./types";

/**
 * Semente do plano. A partir da primeira edição quem manda é o que está
 * gravado no aparelho — isto aqui só preenche a primeira abertura.
 * Espelha o mockup: Superiores, 2 exercícios, 7 séries, na quinta.
 */
export const DEFAULT_PLAN: WeekPlan = {
  workouts: [
    {
      id: "superiores",
      title: "Superiores",
      isoWeekday: 4,
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

export function workoutForWeekday(plan: WeekPlan, isoWeekday: number): Workout | null {
  return plan.workouts.find((w) => w.isoWeekday === isoWeekday) ?? null;
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
 * Nasce sem exercícios: quem cria o treino é sempre o "Adicionar exercício",
 * que acrescenta o primeiro logo em seguida. Já vir com um faria dois.
 */
export function newWorkout(isoWeekday: number): Workout {
  return {
    id: makeId("treino"),
    title: "Treino",
    isoWeekday,
    exercises: [],
  };
}

/** Limites dos steppers — barram valores absurdos sem exigir precisão. */
export const LIMITS = {
  sets: { min: 1, max: 12, step: 1 },
  reps: { min: 1, max: 50, step: 1 },
  weight: { min: 0, max: 500, step: 2.5 },
  rest: { min: 15, max: 600, step: 15 },
} as const;
