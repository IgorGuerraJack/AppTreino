"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExerciseTimeline } from "@/components/ExerciseTimeline";
import { HeroCard } from "@/components/HeroCard";
import { WeekStrip, WeekStripSkeleton } from "@/components/WeekStrip";
import { pluralize } from "@/lib/format";
import { trainedDateKeys } from "@/lib/history";
import { totalSets, workoutById } from "@/lib/plan";
import { cursorFor } from "@/lib/session";
import { useMounted } from "@/lib/useMounted";
import { useWorkoutStore } from "@/lib/useWorkoutStore";
import { currentWeek } from "@/lib/week";
import styles from "./page.module.css";

export default function HomePage() {
  /* O servidor não sabe que dia é hoje no fuso do aparelho: a semana só é
     montada depois da hidratação, e até lá a faixa fica só com as letras. */
  const mounted = useMounted();
  const week = useMemo(() => (mounted ? currentWeek(new Date()) : null), [mounted]);
  const { hydrated, plan, currentWorkoutId, session, history } = useWorkoutStore();

  const todayIndex = week ? week.findIndex((day) => day.isToday) : 3;
  const trainedKeys = useMemo(() => trainedDateKeys(history), [history]);

  // O treino em execução manda mais que a fila: se você já começou o próximo
  // antes de ele virar "o atual", a tela continua mostrando o que está aberto.
  const workout = workoutById(plan, session?.workoutId ?? currentWorkoutId);

  const cursor = useMemo(
    () => (workout ? cursorFor(workout, session?.entries ?? []) : null),
    [workout, session?.entries],
  );
  const currentExerciseIndex = cursor && !cursor.done ? cursor.exerciseIndex : -1;

  const logged = hydrated && session ? session.entries.length : 0;
  const inProgress = logged > 0;

  const sets = workout ? totalSets(workout) : 0;
  const heroHint = inProgress
    ? `${logged} de ${sets} séries registradas`
    : "seu plano está pronto";
  const editHref = workout ? `/planejar?treino=${workout.id}` : "/planejar";

  return (
    <main className="shell shell--withNav">
      {week ? (
        <WeekStrip days={week} trainedKeys={trainedKeys} />
      ) : (
        <WeekStripSkeleton />
      )}

      {workout ? (
        <HeroCard
          todayIndex={todayIndex}
          eyebrow="próximo treino"
          title={workout.title}
          meta={`${pluralize(workout.exercises.length, "exercício", "exercícios")} · ${pluralize(sets, "série", "séries")}`}
          hint={heroHint}
          href="/treino"
          actionLabel={inProgress ? `Continuar ${workout.title}` : `Iniciar treino ${workout.title}`}
        />
      ) : (
        <HeroCard
          todayIndex={todayIndex}
          eyebrow="rotação vazia"
          title="Nada montado ainda"
          meta="Nenhum treino na fila"
          hint="toque para montar o primeiro"
          href="/planejar"
          filled={false}
        />
      )}

      {workout ? (
        <>
          <p className={`eyebrow ${styles.planLabel}`}>plano do dia</p>
          <h1 className={`sectionTitle ${styles.planTitle}`}>Seus exercícios</h1>

          <div className={styles.chips}>
            <Link href="/progresso" className={styles.chip}>
              Ver evolução
            </Link>
            <Link href={editHref} className={styles.chip}>
              Editar rotação
            </Link>
          </div>

          <ExerciseTimeline
            exercises={workout.exercises}
            currentIndex={currentExerciseIndex}
            editHref={editHref}
          />
        </>
      ) : null}
    </main>
  );
}
