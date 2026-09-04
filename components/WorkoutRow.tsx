"use client";

import Link from "next/link";
import { IconArrowDown, IconArrowUp, IconPencil, IconTrash } from "@tabler/icons-react";
import { pluralize } from "@/lib/format";
import { totalSets } from "@/lib/plan";
import type { Workout } from "@/lib/types";
import styles from "./WorkoutRow.module.css";

interface Props {
  workout: Workout;
  index: number;
  total: number;
  /** É o treino no topo da fila — o que "Iniciar treino" abriria agora. */
  isNext: boolean;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

export function WorkoutRow({ workout, index, total, isNext, onMove, onRemove }: Props) {
  const sets = totalSets(workout);
  const label = workout.title.trim() || `treino ${index + 1}`;

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <span className={styles.position}>{String(index + 1).padStart(2, "0")}</span>
        <div className={styles.body}>
          <p className={styles.name}>{workout.title || "Sem nome"}</p>
          <p className={`sub ${styles.detail}`}>
            {pluralize(workout.exercises.length, "exercício", "exercícios")} ·{" "}
            {pluralize(sets, "série", "séries")}
          </p>
        </div>
        {isNext ? <span className={styles.badge}>próximo</span> : null}
        <Link
          href={`/planejar?treino=${workout.id}`}
          className={styles.edit}
          aria-label={`Editar ${label}`}
        >
          <IconPencil size={18} stroke={1.5} aria-hidden />
        </Link>
      </div>

      <div className={styles.footer}>
        <div className={styles.moves}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Mover ${label} para cima na fila`}
          >
            <IconArrowUp size={18} stroke={1.5} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Mover ${label} para baixo na fila`}
          >
            <IconArrowDown size={18} stroke={1.5} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.remove}`}
          onClick={onRemove}
          aria-label={`Remover ${label} da rotação`}
        >
          <IconTrash size={18} stroke={1.5} aria-hidden />
        </button>
      </div>
    </li>
  );
}
