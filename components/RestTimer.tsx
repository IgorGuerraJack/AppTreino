"use client";

import { IconRotate2 } from "@tabler/icons-react";
import { formatClock } from "@/lib/format";
import styles from "./RestTimer.module.css";

interface Props {
  remainingSeconds: number;
  onRestart: () => void;
  onAdd30: () => void;
}

export function RestTimer({ remainingSeconds, onRestart, onAdd30 }: Props) {
  const over = remainingSeconds <= 0;

  return (
    <div className={styles.card}>
      <div>
        <p className={`eyebrow ${styles.label}`}>{over ? "pode ir" : "descanso"}</p>
        <p className={styles.time} role="timer" aria-live="off">
          {formatClock(remainingSeconds)}
        </p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.action}
          onClick={onRestart}
          aria-label="Reiniciar descanso"
        >
          <IconRotate2 size={19} stroke={1.5} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.action}
          onClick={onAdd30}
          aria-label="Somar 30 segundos ao descanso"
        >
          +30
        </button>
      </div>
    </div>
  );
}
