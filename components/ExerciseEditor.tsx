"use client";

import { IconArrowDown, IconArrowUp, IconTrash } from "@tabler/icons-react";
import { formatClock, formatKg } from "@/lib/format";
import { LIMITS } from "@/lib/plan";
import type { PlannedExercise } from "@/lib/types";
import { Stepper } from "./Stepper";
import styles from "./ExerciseEditor.module.css";

interface Props {
  exercise: PlannedExercise;
  index: number;
  total: number;
  onChange: (patch: Partial<PlannedExercise>) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

export function ExerciseEditor({ exercise, index, total, onChange, onMove, onRemove }: Props) {
  const label = exercise.name.trim() || `exercício ${index + 1}`;

  return (
    <li className={styles.card}>
      <div className={styles.nameRow}>
        <span className={styles.position}>{String(index + 1).padStart(2, "0")}</span>
        <input
          className={styles.name}
          value={exercise.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Nome do exercício"
          enterKeyHint="done"
          aria-label={`Nome do exercício ${index + 1}`}
        />
      </div>

      <div className={styles.steppers}>
        <Stepper
          label="séries"
          value={exercise.targetSets}
          {...LIMITS.sets}
          format={(v) => String(v)}
          onChange={(targetSets) => onChange({ targetSets })}
        />
        <Stepper
          label="repetições"
          value={exercise.targetReps}
          {...LIMITS.reps}
          format={(v) => String(v)}
          onChange={(targetReps) => onChange({ targetReps })}
        />
        <Stepper
          label="peso"
          value={exercise.suggestedWeightKg}
          {...LIMITS.weight}
          format={(v) => `${formatKg(v)} kg`}
          onChange={(suggestedWeightKg) => onChange({ suggestedWeightKg })}
        />
        <Stepper
          label="descanso"
          value={exercise.restSeconds}
          {...LIMITS.rest}
          format={(v) => formatClock(v)}
          onChange={(restSeconds) => onChange({ restSeconds })}
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.moves}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Mover ${label} para cima`}
          >
            <IconArrowUp size={18} stroke={1.5} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Mover ${label} para baixo`}
          >
            <IconArrowDown size={18} stroke={1.5} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.remove}`}
          onClick={onRemove}
          aria-label={`Remover ${label}`}
        >
          <IconTrash size={18} stroke={1.5} aria-hidden />
        </button>
      </div>
    </li>
  );
}
