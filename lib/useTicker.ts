"use client";

import { useSyncExternalStore } from "react";

interface Clock {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => number;
}

const clocks = new Map<number, Clock>();

/** Um intervalo por cadência, compartilhado entre os componentes que contam. */
function clockFor(intervalMs: number): Clock {
  const existing = clocks.get(intervalMs);
  if (existing) return existing;

  let value = Date.now();
  const listeners = new Set<() => void>();
  let timer: number | undefined;

  const clock: Clock = {
    subscribe(onChange) {
      listeners.add(onChange);
      value = Date.now();
      if (timer === undefined) {
        timer = window.setInterval(() => {
          value = Date.now();
          listeners.forEach((listener) => listener());
        }, intervalMs);
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0 && timer !== undefined) {
          window.clearInterval(timer);
          timer = undefined;
        }
      };
    },
    getSnapshot: () => value,
  };

  clocks.set(intervalMs, clock);
  return clock;
}

const noopSubscribe = () => () => {};

/** `null` no servidor e no primeiro paint: ali ainda não existe um "agora". */
export function useTicker(active: boolean, intervalMs = 1000): number | null {
  const clock = clockFor(intervalMs);
  return useSyncExternalStore(
    active ? clock.subscribe : noopSubscribe,
    active ? clock.getSnapshot : () => null,
    () => null,
  );
}
