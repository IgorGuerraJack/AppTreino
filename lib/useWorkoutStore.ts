"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { newSession } from "./session";
import type { SetEntry, Workout } from "./types";
import { getServerSnapshot, getSnapshot, mutate, subscribe } from "./workoutStore";

/**
 * Estado do treino: mora no localStorage e é lido como store externa, para
 * que várias telas (e várias abas) vejam a mesma sessão.
 */
export function useWorkoutStore(workout: Workout) {
  const { hydrated, data } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const start = useCallback(() => {
    mutate((previous) => {
      if (previous.session && !previous.session.finishedAt) return previous;
      return { ...previous, session: newSession(workout) };
    });
  }, [workout]);

  const logSet = useCallback(
    (entry: Omit<SetEntry, "at">, restSeconds: number) => {
      mutate((previous) => {
        const session = previous.session ?? newSession(workout);
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
    },
    [workout],
  );

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

  const actions = useMemo(
    () => ({ start, logSet, undoLastSet, addRest, restartRest, finish }),
    [start, logSet, undoLastSet, addRest, restartRest, finish],
  );

  return {
    hydrated,
    session: data.session,
    history: data.history,
    lastWeights: data.lastWeights,
    ...actions,
  };
}
