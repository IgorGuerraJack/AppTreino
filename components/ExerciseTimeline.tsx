import Link from "next/link";
import { IconBarbell, IconPencil, IconPlus, IconStretching } from "@tabler/icons-react";
import { formatKg, pluralize } from "@/lib/format";
import type { PlannedExercise } from "@/lib/types";
import styles from "./ExerciseTimeline.module.css";

const ICONS = {
  barbell: IconBarbell,
  stretching: IconStretching,
} as const;

interface Props {
  exercises: PlannedExercise[];
  /** Exercício em que o treino está — recebe o marcador dourado. */
  currentIndex: number;
  editHref: string;
}

export function ExerciseTimeline({ exercises, currentIndex, editHref }: Props) {
  if (exercises.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Nenhum exercício planejado para este dia.</p>
        <Link href={editHref} className={styles.emptyAction}>
          <IconPlus size={18} stroke={1.5} aria-hidden />
          Adicionar exercício
        </Link>
      </div>
    );
  }

  return (
    <ol className={styles.list}>
      {exercises.map((exercise, index) => {
        const Icon = ICONS[exercise.icon];
        const isCurrent = index === currentIndex;
        const isLast = index === exercises.length - 1;

        return (
          <li key={exercise.id} className={styles.item}>
            <div className={styles.rail}>
              <span className={`${styles.dot} ${isCurrent ? styles["dot--current"] : ""}`}>
                <Icon size={20} stroke={1.5} aria-hidden />
              </span>
              {isLast ? null : <span className={styles.line} />}
            </div>

            <div className={styles.body}>
              <p className={styles.name}>{exercise.name}</p>
              <p className={`sub ${styles.detail}`}>
                {pluralize(exercise.targetSets, "série", "séries")} × {exercise.targetReps} reps ·{" "}
                {formatKg(exercise.suggestedWeightKg)} kg
              </p>
            </div>

            <Link
              href={editHref}
              className={styles.edit}
              aria-label={`Editar ${exercise.name}`}
            >
              <IconPencil size={18} stroke={1.5} aria-hidden />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
