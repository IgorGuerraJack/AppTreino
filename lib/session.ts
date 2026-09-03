import type { Cursor, SessionState, SetEntry, Workout } from "./types";

/**
 * A posição atual não é guardada: ela é derivada das séries registradas.
 * Um estado a menos para sair de sincronia depois de um reload ou de um undo.
 */
export function cursorFor(workout: Workout, entries: SetEntry[]): Cursor {
  for (let i = 0; i < workout.exercises.length; i += 1) {
    const exercise = workout.exercises[i];
    const done = entries.filter((e) => e.exerciseId === exercise.id).length;
    if (done < exercise.targetSets) {
      return {
        exerciseIndex: i,
        exercise,
        setIndex: done,
        isLastSetOfExercise: done === exercise.targetSets - 1,
        isLastExercise: i === workout.exercises.length - 1,
        done: false,
      };
    }
  }
  return { done: true };
}

export function entriesFor(entries: SetEntry[], exerciseId: string): SetEntry[] {
  return entries
    .filter((e) => e.exerciseId === exerciseId)
    .sort((a, b) => a.setIndex - b.setIndex);
}

export function newSession(workout: Workout, now = Date.now()): SessionState {
  return {
    workoutId: workout.id,
    startedAt: now,
    entries: [],
    restEndsAt: null,
    restBaseSeconds: workout.exercises[0]?.restSeconds ?? 90,
    finishedAt: null,
  };
}
