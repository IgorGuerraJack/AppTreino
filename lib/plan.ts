import type { Workout } from "./types";

/**
 * App de um usuário só (v1): o plano mora no código, não em banco.
 * Espelha o mockup — Superiores, 2 exercícios, 7 séries.
 */
export const WORKOUT: Workout = {
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
};

export function totalSets(workout: Workout): number {
  return workout.exercises.reduce((sum, e) => sum + e.targetSets, 0);
}
