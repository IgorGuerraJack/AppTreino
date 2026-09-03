"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { newExercise, newWorkout } from "./plan";
import { newSession } from "./session";
import type { PlannedExercise, SetEntry, WeekPlan, Workout } from "./types";
import { getServerSnapshot, getSnapshot, mutate, subscribe } from "./workoutStore";

/** Aplica uma transformação ao treino de um dia; remover o último exercício apaga o treino. */
function withWorkout(
  plan: WeekPlan,
  isoWeekday: number,
  fn: (workout: Workout) => Workout | null,
  createIfMissing = false,
): WeekPlan {
  const existing = plan.workouts.find((w) => w.isoWeekday === isoWeekday);
  if (!existing) {
    if (!createIfMissing) return plan;
    const created = fn(newWorkout(isoWeekday));
    return created ? { workouts: [...plan.workouts, created] } : plan;
  }
  const next = fn(existing);
  return {
    workouts: next
      ? plan.workouts.map((w) => (w.isoWeekday === isoWeekday ? next : w))
      : plan.workouts.filter((w) => w.isoWeekday !== isoWeekday),
  };
}

/**
 * Estado do treino: mora no localStorage e é lido como store externa, para
 * que várias telas (e várias abas) vejam a mesma sessão e o mesmo plano.
 */
export function useWorkoutStore() {
  const { hydrated, data } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const start = useCallback((workout: Workout) => {
    mutate((previous) => {
      if (previous.session && !previous.session.finishedAt) return previous;
      return { ...previous, session: newSession(workout) };
    });
  }, []);

  const logSet = useCallback((entry: Omit<SetEntry, "at">, restSeconds: number) => {
    mutate((previous) => {
      const session = previous.session;
      if (!session) return previous;
      const at = Date.now();
      return {
        ...previous,
        session: {
          ...session,
          entries: [...session.entries, { ...entry, at }],
          restEndsAt: at + restSeconds * 1000,
          restBaseSeconds: restSeconds,
        },
        lastWeights: { ...previous.lastWeights, [entry.exerciseId]: entry.weightKg },
      };
    });
  }, []);

  /** Desfaz a última série: errar o toque entre séries é comum. */
  const undoLastSet = useCallback(() => {
    mutate((previous) => {
      if (!previous.session || previous.session.entries.length === 0) return previous;
      return {
        ...previous,
        session: {
          ...previous.session,
          entries: previous.session.entries.slice(0, -1),
          restEndsAt: null,
        },
      };
    });
  }, []);

  const addRest = useCallback((seconds: number) => {
    mutate((previous) => {
      if (!previous.session?.restEndsAt) return previous;
      return {
        ...previous,
        session: {
          ...previous.session,
          restEndsAt: previous.session.restEndsAt + seconds * 1000,
          restBaseSeconds: previous.session.restBaseSeconds + seconds,
        },
      };
    });
  }, []);

  const restartRest = useCallback(() => {
    mutate((previous) => {
      if (!previous.session) return previous;
      return {
        ...previous,
        session: {
          ...previous.session,
          restEndsAt: Date.now() + previous.session.restBaseSeconds * 1000,
        },
      };
    });
  }, []);

  const finish = useCallback(() => {
    mutate((previous) => {
      const session = previous.session;
      if (!session) return previous;
      return {
        ...previous,
        session: null,
        history:
          session.entries.length === 0
            ? previous.history
            : [
                ...previous.history,
                {
                  workoutId: session.workoutId,
                  startedAt: session.startedAt,
                  finishedAt: Date.now(),
                  entries: session.entries,
                },
              ],
      };
    });
  }, []);

  // ---- edição do plano ----

  const setWorkoutTitle = useCallback((isoWeekday: number, title: string) => {
    mutate((previous) => ({
      ...previous,
      plan: withWorkout(previous.plan, isoWeekday, (w) => ({ ...w, title })),
    }));
  }, []);

  const addExercise = useCallback((isoWeekday: number) => {
    mutate((previous) => ({
      ...previous,
      plan: withWorkout(
        previous.plan,
        isoWeekday,
        (w) => ({ ...w, exercises: [...w.exercises, newExercise()] }),
        true,
      ),
    }));
  }, []);

  const updateExercise = useCallback(
    (isoWeekday: number, exerciseId: string, patch: Partial<PlannedExercise>) => {
      mutate((previous) => ({
        ...previous,
        plan: withWorkout(previous.plan, isoWeekday, (w) => ({
          ...w,
          exercises: w.exercises.map((e) => (e.id === exerciseId ? { ...e, ...patch } : e)),
        })),
      }));
    },
    [],
  );

  const removeExercise = useCallback((isoWeekday: number, exerciseId: string) => {
    mutate((previous) => ({
      ...previous,
      plan: withWorkout(previous.plan, isoWeekday, (w) => {
        const exercises = w.exercises.filter((e) => e.id !== exerciseId);
        // Sem exercícios não há treino: o dia volta a ser livre.
        return exercises.length === 0 ? null : { ...w, exercises };
      }),
    }));
  }, []);

  const moveExercise = useCallback((isoWeekday: number, exerciseId: string, delta: number) => {
    mutate((previous) => ({
      ...previous,
      plan: withWorkout(previous.plan, isoWeekday, (w) => {
        const from = w.exercises.findIndex((e) => e.id === exerciseId);
        const to = from + delta;
        if (from < 0 || to < 0 || to >= w.exercises.length) return w;
        const exercises = [...w.exercises];
        const [moved] = exercises.splice(from, 1);
        exercises.splice(to, 0, moved);
        return { ...w, exercises };
      }),
    }));
  }, []);

  const actions = useMemo(
    () => ({
      start,
      logSet,
      undoLastSet,
      addRest,
      restartRest,
      finish,
      setWorkoutTitle,
      addExercise,
      updateExercise,
      removeExercise,
      moveExercise,
    }),
    [
      start,
      logSet,
      undoLastSet,
      addRest,
      restartRest,
      finish,
      setWorkoutTitle,
      addExercise,
      updateExercise,
      removeExercise,
      moveExercise,
    ],
  );

  return {
    hydrated,
    plan: data.plan,
    session: data.session,
    history: data.history,
    lastWeights: data.lastWeights,
    ...actions,
  };
}
