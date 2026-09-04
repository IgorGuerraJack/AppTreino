"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { newExercise, newWorkout, nextWorkoutId } from "./plan";
import { newSession } from "./session";
import type { PersistedState } from "./storage";
import type { PlannedExercise, RotationPlan, SetEntry, Workout } from "./types";
import { getServerSnapshot, getSnapshot, mutate, subscribe } from "./workoutStore";

/**
 * Tira `id` da fila e, se ele era o `currentWorkoutId`, aponta para o
 * próximo — nunca deixa o ponteiro solto num treino que não existe mais.
 */
function dropWorkout(previous: PersistedState, id: string): PersistedState {
  const workouts = previous.plan.workouts.filter((w) => w.id !== id);
  const currentWorkoutId =
    previous.currentWorkoutId === id
      ? nextWorkoutId({ workouts }, id)
      : previous.currentWorkoutId;
  return { ...previous, plan: { workouts }, currentWorkoutId };
}

/** Aplica uma transformação a um treino da rotação, por id. */
function withWorkout(
  plan: RotationPlan,
  id: string,
  fn: (workout: Workout) => Workout,
): RotationPlan {
  return { workouts: plan.workouts.map((w) => (w.id === id ? fn(w) : w)) };
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

  /**
   * Fecha a sessão e, só se algo foi de fato registrado, avança a fila para
   * o próximo treino — abandonar sem bater nenhuma série não move a rotação.
   */
  const finish = useCallback(() => {
    mutate((previous) => {
      const session = previous.session;
      if (!session) return previous;
      const completed = session.entries.length > 0;
      return {
        ...previous,
        session: null,
        currentWorkoutId: completed
          ? nextWorkoutId(previous.plan, session.workoutId)
          : previous.currentWorkoutId,
        history: completed
          ? [
              ...previous.history,
              {
                workoutId: session.workoutId,
                startedAt: session.startedAt,
                finishedAt: Date.now(),
                entries: session.entries,
              },
            ]
          : previous.history,
      };
    });
  }, []);

  // ---- edição da rotação ----

  const addWorkout = useCallback((title: string) => {
    mutate((previous) => {
      const workout = newWorkout(title);
      const plan = { workouts: [...previous.plan.workouts, workout] };
      return {
        ...previous,
        plan,
        currentWorkoutId: previous.currentWorkoutId ?? workout.id,
      };
    });
  }, []);

  const removeWorkout = useCallback((workoutId: string) => {
    mutate((previous) => dropWorkout(previous, workoutId));
  }, []);

  const moveWorkout = useCallback((workoutId: string, delta: number) => {
    mutate((previous) => {
      const from = previous.plan.workouts.findIndex((w) => w.id === workoutId);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= previous.plan.workouts.length) return previous;
      const workouts = [...previous.plan.workouts];
      const [moved] = workouts.splice(from, 1);
      workouts.splice(to, 0, moved);
      return { ...previous, plan: { workouts } };
    });
  }, []);

  const setWorkoutTitle = useCallback((workoutId: string, title: string) => {
    mutate((previous) => ({
      ...previous,
      plan: withWorkout(previous.plan, workoutId, (w) => ({ ...w, title })),
    }));
  }, []);

  const addExercise = useCallback((workoutId: string) => {
    mutate((previous) => ({
      ...previous,
      plan: withWorkout(previous.plan, workoutId, (w) => ({
        ...w,
        exercises: [...w.exercises, newExercise()],
      })),
    }));
  }, []);

  const updateExercise = useCallback(
    (workoutId: string, exerciseId: string, patch: Partial<PlannedExercise>) => {
      mutate((previous) => ({
        ...previous,
        plan: withWorkout(previous.plan, workoutId, (w) => ({
          ...w,
          exercises: w.exercises.map((e) => (e.id === exerciseId ? { ...e, ...patch } : e)),
        })),
      }));
    },
    [],
  );

  /** Sem exercícios não há treino: o último apagado tira o treino da rotação. */
  const removeExercise = useCallback((workoutId: string, exerciseId: string) => {
    mutate((previous) => {
      const workout = previous.plan.workouts.find((w) => w.id === workoutId);
      if (!workout) return previous;
      const exercises = workout.exercises.filter((e) => e.id !== exerciseId);
      if (exercises.length > 0) {
        return {
          ...previous,
          plan: withWorkout(previous.plan, workoutId, (w) => ({ ...w, exercises })),
        };
      }
      return dropWorkout(previous, workoutId);
    });
  }, []);

  const moveExercise = useCallback((workoutId: string, exerciseId: string, delta: number) => {
    mutate((previous) => ({
      ...previous,
      plan: withWorkout(previous.plan, workoutId, (w) => {
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
      addWorkout,
      removeWorkout,
      moveWorkout,
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
      addWorkout,
      removeWorkout,
      moveWorkout,
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
    currentWorkoutId: data.currentWorkoutId,
    session: data.session,
    history: data.history,
    lastWeights: data.lastWeights,
    ...actions,
  };
}
