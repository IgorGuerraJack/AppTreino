"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExerciseTimeline } from "@/components/ExerciseTimeline";
import { HeroCard } from "@/components/HeroCard";
import { WeekStrip, WeekStripSkeleton } from "@/components/WeekStrip";
import { pluralize } from "@/lib/format";
import { totalSets, workoutForWeekday } from "@/lib/plan";
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
  const { hydrated, plan, session } = useWorkoutStore();

  const [picked, setPicked] = useState<number | null>(null);
  const fallbackIndex = (plan.workouts[0]?.isoWeekday ?? 1) - 1;
  const todayIndex = week ? week.findIndex((day) => day.isToday) : fallbackIndex;
  const selectedIndex = picked ?? todayIndex;
  const isoWeekday = selectedIndex + 1;

  const workout = workoutForWeekday(plan, isoWeekday);
  const isToday = week ? week[selectedIndex]?.isToday === true : true;

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
  const editHref = `/planejar?dia=${isoWeekday}`;

  return (
    <main className="shell shell--withNav">
      {week ? (
        <WeekStrip days={week} selectedIndex={selectedIndex} onSelect={setPicked} />
      ) : (
        <WeekStripSkeleton />
      )}

      {workout ? (
        <HeroCard
          dayIndex={selectedIndex}
          eyebrow={isToday ? "treino de hoje" : "treino do dia"}
          title={workout.title}
          meta={`${pluralize(workout.exercises.length, "exercício", "exercícios")} · ${pluralize(sets, "série", "séries")}`}
          hint={heroHint}
          href="/treino"
          actionLabel={inProgress ? `Continuar ${workout.title}` : `Iniciar treino ${workout.title}`}
        />
      ) : (
        <HeroCard
          dayIndex={selectedIndex}
          eyebrow="sem treino"
          title="Dia livre"
          meta="Nada planejado para este dia"
          hint="a semana fica como você deixou"
        />
      )}

      <p className={`eyebrow ${styles.planLabel}`}>plano do dia</p>
      <h1 className={`sectionTitle ${styles.planTitle}`}>Seus exercícios</h1>

      <div className={styles.chips}>
        <Link href="/progresso" className={styles.chip}>
          Ver evolução
        </Link>
        <Link href={editHref} className={styles.chip}>
          Editar semana
        </Link>
      </div>

      <ExerciseTimeline
        exercises={workout?.exercises ?? []}
        currentIndex={workout && isToday ? currentExerciseIndex : -1}
        editHref={editHref}
      />
    </main>
  );
}
