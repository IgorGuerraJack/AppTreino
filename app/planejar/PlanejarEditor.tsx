"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconChevronLeft, IconPlus } from "@tabler/icons-react";
import { ExerciseEditor } from "@/components/ExerciseEditor";
import { WorkoutRow } from "@/components/WorkoutRow";
import { pluralize } from "@/lib/format";
import { nextWorkoutLetter, totalSets } from "@/lib/plan";
import type { Workout } from "@/lib/types";
import { useWorkoutStore } from "@/lib/useWorkoutStore";
import styles from "./planejar.module.css";

type Store = ReturnType<typeof useWorkoutStore>;

export function PlanejarEditor() {
  const searchParams = useSearchParams();
  const store = useWorkoutStore();
  const workoutId = searchParams.get("treino");
  const workout = workoutId ? (store.plan.workouts.find((w) => w.id === workoutId) ?? null) : null;

  // Um link para um treino que não existe mais (removido, ou nunca existiu)
  // cai de volta na lista, em vez de mostrar uma tela quebrada.
  if (workoutId && workout) {
    return <WorkoutEditor workout={workout} store={store} />;
  }
  return <RotationList store={store} />;
}

function RotationList({ store }: { store: Store }) {
  const { plan, currentWorkoutId } = store;

  return (
    <main className="shell shell--withNav">
      <p className={`eyebrow ${styles.label}`}>montar rotação</p>
      <h1 className={`sectionTitle ${styles.rotationTitle}`}>Seus treinos</h1>
      <p className={`sub ${styles.summary}`}>
        A ordem é a ordem em que rodam. Termina no último, volta pro primeiro.
      </p>

      {plan.workouts.length > 0 ? (
        <ul className={styles.list}>
          {plan.workouts.map((workout, index) => (
            <WorkoutRow
              key={workout.id}
              workout={workout}
              index={index}
              total={plan.workouts.length}
              isNext={workout.id === currentWorkoutId}
              onMove={(delta) => store.moveWorkout(workout.id, delta)}
              onRemove={() => store.removeWorkout(workout.id)}
            />
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Nenhum treino na rotação ainda.</p>
        </div>
      )}

      <button
        type="button"
        className={styles.add}
        onClick={() => store.addWorkout(`Treino ${nextWorkoutLetter(plan)}`)}
      >
        <IconPlus size={18} stroke={1.5} aria-hidden />
        Adicionar treino
      </button>
    </main>
  );
}

function WorkoutEditor({ workout, store }: { workout: Workout; store: Store }) {
  const sets = totalSets(workout);

  return (
    <main className="shell shell--withNav">
      <div className={styles.editorHeader}>
        <Link href="/planejar" className={styles.back} aria-label="Voltar para a rotação">
          <IconChevronLeft size={22} stroke={1.5} aria-hidden />
        </Link>
        <p className={`eyebrow ${styles.label} ${styles.labelInline}`}>editar treino</p>
      </div>

      <div className={styles.titleRow}>
        <input
          className={styles.title}
          value={workout.title}
          onChange={(event) => store.setWorkoutTitle(workout.id, event.target.value)}
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
            onChange={(patch) => store.updateExercise(workout.id, exercise.id, patch)}
            onMove={(delta) => store.moveExercise(workout.id, exercise.id, delta)}
            onRemove={() => store.removeExercise(workout.id, exercise.id)}
          />
        ))}
      </ul>

      <button
        type="button"
        className={styles.add}
        onClick={() => store.addExercise(workout.id)}
      >
        <IconPlus size={18} stroke={1.5} aria-hidden />
        Adicionar exercício
      </button>
    </main>
  );
}
