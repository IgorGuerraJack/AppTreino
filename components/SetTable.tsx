"use client";

import { IconCheck } from "@tabler/icons-react";
import { formatKg } from "@/lib/format";
import type { PlannedExercise, SetEntry } from "@/lib/types";
import styles from "./SetTable.module.css";

interface Props {
  exercise: PlannedExercise;
  done: SetEntry[];
  /** Índice da série em edição; null quando o exercício já terminou. */
  currentIndex: number | null;
  weight: string;
  reps: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onUndo: () => void;
}

interface FieldProps {
  value: string;
  /** Texto que dita a largura mínima quando o campo está vazio. */
  fallback: string;
  unit: string;
  inputMode: "decimal" | "numeric";
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
}

/**
 * Campo que cresce com o conteúdo, para o valor e a unidade ficarem colados.
 * O <label> faz a célula inteira valer como alvo de toque.
 */
function Field({
  value,
  fallback,
  unit,
  inputMode,
  onChange,
  ariaLabel,
  placeholder,
  className,
}: FieldProps) {
  return (
    <label className={`${styles.field} ${className ?? ""}`}>
      <span className={styles.sizer}>
        <span className={styles.ghost} aria-hidden>
          {value || placeholder || fallback}
        </span>
        <input
          className={styles.input}
          /* sem size=1 o input reserva ~20 caracteres e estica a célula */
          size={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode={inputMode}
          enterKeyHint="done"
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
      </span>
      <span className={styles.unit}>{unit}</span>
    </label>
  );
}

const label = (index: number) => String(index + 1).padStart(2, "0");

export function SetTable({
  exercise,
  done,
  currentIndex,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onUndo,
}: Props) {
  const rows = Array.from({ length: exercise.targetSets }, (_, i) => i);

  return (
    <div className={styles.card}>
      {rows.map((index) => {
        const entry = done.find((e) => e.setIndex === index);

        if (entry) {
          const isLastDone = index === done.length - 1;
          return (
            <div key={index} className={styles.row}>
              <span className={styles.index}>{label(index)}</span>
              <span className={styles.value}>{formatKg(entry.weightKg)} kg</span>
              <span className={styles.value}>{entry.reps} reps</span>
              {isLastDone ? (
                <button
                  type="button"
                  className={styles.undo}
                  onClick={onUndo}
                  aria-label={`Desfazer série ${label(index)}`}
                >
                  <IconCheck size={18} stroke={1.5} aria-hidden />
                </button>
              ) : (
                <span className={styles.check}>
                  <IconCheck size={18} stroke={1.5} aria-hidden />
                </span>
              )}
            </div>
          );
        }

        if (index === currentIndex) {
          return (
            <div key={index} className={`${styles.row} ${styles["row--now"]}`}>
              <span className={styles.index}>{label(index)}</span>
              <Field
                className={styles["field--weight"]}
                value={weight}
                fallback="00"
                unit="kg"
                inputMode="decimal"
                onChange={onWeightChange}
                ariaLabel={`Peso da série ${label(index)} em quilos`}
              />
              <Field
                value={reps}
                fallback={String(exercise.targetReps)}
                placeholder={String(exercise.targetReps)}
                unit="reps"
                inputMode="numeric"
                onChange={onRepsChange}
                ariaLabel={`Repetições da série ${label(index)}, meta ${exercise.targetReps}`}
              />
              <span className={`${styles.check} ${styles["check--pending"]}`}>
                <IconCheck size={18} stroke={1.5} aria-hidden />
              </span>
            </div>
          );
        }

        return (
          <div key={index} className={`${styles.row} ${styles["row--todo"]}`}>
            <span className={styles.index}>{label(index)}</span>
            <span className={styles.value} aria-label="peso não registrado">
              —
            </span>
            <span className={styles.value} aria-label="repetições não registradas">
              —
            </span>
            <span className={styles.check}>
              <IconCheck size={18} stroke={1.5} aria-hidden />
            </span>
          </div>
        );
      })}
    </div>
  );
}
