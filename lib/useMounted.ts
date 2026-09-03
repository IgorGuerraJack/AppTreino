"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` no servidor e no primeiro paint, `true` depois da hidratação.
 * Usado para o que depende do relógio ou do fuso do aparelho.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
