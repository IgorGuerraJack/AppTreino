"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Interpola um número entre renders. Usado só pela ondulação do card herói —
 * a única animação do app que não é disparada por toque.
 */
export function useAnimatedNumber(target: number, durationMs = 420): number {
  const [value, setValue] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const from = currentRef.current;
    if (reduced || from === target) {
      currentRef.current = target;
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;
      currentRef.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
