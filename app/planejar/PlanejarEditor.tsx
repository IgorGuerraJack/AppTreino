"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";
import { ExerciseEditor } from "@/components/ExerciseEditor";
import { WeekStrip, WeekStripSkeleton } from "@/components/WeekStrip";
import { pluralize } from "@/lib/format";
import { totalSets, workoutForWeekday } from "@/lib/plan";
import { useMounted } from "@/lib/useMounted";
import { useWorkoutStore } from "@/lib/useWorkoutStore";
import { currentWeek } from "@/lib/week";
import styles from "./planejar.module.css";

export function PlanejarEditor() {
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const week = useMemo(() => (mounted ? currentWeek(new Date()) : null), [mounted]);
  const store = useWorkoutStore();

  /* O lápis da tela de início manda o dia que estava aberto lá. */
  const requested = Number(searchParams.get("dia"));
  const fromQuery = requested >= 1 && requested <= 7 ? requested - 1 : null;

  const [picked, setPicked] = useState<number | null>(null);
  const todayIndex = week ? week.findIndex((day) => day.isToday) : 3;
  const selectedIndex = picked ?? fromQuery ?? todayIndex;
  const isoWeekday = selectedIndex + 1;

  const workout = workoutForWeekday(store.plan, isoWeekday);
  const sets = workout ? totalSets(workout) : 0;

  return (
    <main className="shell shell--withNav">
      {week ? (
        <WeekStrip days={week} selectedIndex={selectedIndex} onSelect={setPicked} />
      ) : (
        <WeekStripSkeleton />
      )}

      <p className={`eyebrow ${styles.label}`}>montar semana</p>

      {workout ? (
        <>
          <div className={styles.titleRow}>
            <input
              className={styles.title}
              value={workout.title}
              onChange={(event) => store.setWorkoutTitle(isoWeekday, event.target.value)}
              placeholder="Nome do treino"
              enterKeyHint="done"
              aria-label="Nome do treino"
            />
          </div>
          <p className={`sub ${styles.summary}`}>
            {pluralize(workout.exercises.length, "exercício", "exercícios")} ·{" "}
            {pluralize(sets, "série", "séries")}
          </p>

          <ul className={styles.list}>
            {workout.exercises.map((exercise, index) => (
              <ExerciseEditor
                key={exercise.id}
                exercise={exercise}
                index={index}
                total={workout.exercises.length}
                onChange={(patch) => store.updateExercise(isoWeekday, exercise.id, patch)}
                onMove={(delta) => store.moveExercise(isoWeekday, exercise.id, delta)}
                onRemove={() => store.removeExercise(isoWeekday, exercise.id)}
              />
            ))}
          </ul>

          <button
            type="button"
            className={styles.add}
            onClick={() => store.addExercise(isoWeekday)}
          >
            <IconPlus size={18} stroke={1.5} aria-hidden />
            Adicionar exercício
          </button>
        </>
      ) : (
        <div className={styles.empty}>
          <h1 className={`sectionTitle ${styles.emptyTitle}`}>Dia livre</h1>
          <p className={styles.emptyText}>Nenhum exercício planejado para este dia.</p>
          <button
            type="button"
            className={styles.add}
            onClick={() => store.addExercise(isoWeekday)}
          >
            <IconPlus size={18} stroke={1.5} aria-hidden />
            Adicionar exercício
          </button>
        </div>
      )}
    </main>
  );
}
