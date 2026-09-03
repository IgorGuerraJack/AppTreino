"use client";

import { IconMinus, IconPlus } from "@tabler/icons-react";
import styles from "./Stepper.module.css";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Como o número aparece — "22,5 kg", "1:30", "10 reps". */
  format: (value: number) => string;
  onChange: (value: number) => void;
}

/**
 * Ajuste por toque em vez de teclado: de pé, entre séries, acertar um número
 * num campo minúsculo é o tipo de precisão que o app não deve exigir.
 */
export function Stepper({ label, value, min, max, step, format, onChange }: Props) {
  // Passos fracionários (2,5 kg) acumulam erro de ponto flutuante.
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next * 100) / 100));

  return (
    <div className={styles.row}>
      <span className={styles.label} id={`stepper-${label}`}>
        {label}
      </span>
      <div className={styles.control}>
        <button
          type="button"
          className={styles.button}
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Diminuir ${label}`}
        >
          <IconMinus size={18} stroke={1.5} aria-hidden />
        </button>
        <output className={styles.value} aria-live="off">
          {format(value)}
        </output>
        <button
          type="button"
          className={styles.button}
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Aumentar ${label}`}
        >
          <IconPlus size={18} stroke={1.5} aria-hidden />
        </button>
      </div>
    </div>
  );
}
