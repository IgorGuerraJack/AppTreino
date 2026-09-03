"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExerciseTimeline } from "@/components/ExerciseTimeline";
import { HeroCard } from "@/components/HeroCard";
import { WeekStrip, WeekStripSkeleton } from "@/components/WeekStrip";
import { pluralize } from "@/lib/format";
import { WORKOUT, totalSets } from "@/lib/plan";
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
  const { hydrated, session } = useWorkoutStore(WORKOUT);

  const [picked, setPicked] = useState<number | null>(null);
  const todayIndex = week ? week.findIndex((day) => day.isToday) : WORKOUT.isoWeekday - 1;
  const selectedIndex = picked ?? todayIndex;

  const hasWorkout = selectedIndex + 1 === WORKOUT.isoWeekday;
  const isToday = week ? week[selectedIndex]?.isToday === true : true;

  const cursor = useMemo(
    () => cursorFor(WORKOUT, session?.entries ?? []),
    [session?.entries],
  );
  const currentExerciseIndex = cursor.done ? -1 : cursor.exerciseIndex;
  const logged = hydrated && session ? session.entries.length : 0;
  const inProgress = logged > 0;

  const sets = totalSets(WORKOUT);
  const heroMeta = `${pluralize(WORKOUT.exercises.length, "exercício", "exercícios")} · ${pluralize(sets, "série", "séries")}`;
  const heroHint = inProgress
    ? `${logged} de ${sets} séries registradas`
    : "seu plano está pronto";

  return (
    <main className="shell shell--withNav">
      {week ? (
        <WeekStrip days={week} selectedIndex={selectedIndex} onSelect={setPicked} />
      ) : (
        <WeekStripSkeleton />
      )}

      {hasWorkout ? (
        <HeroCard
          dayIndex={selectedIndex}
          eyebrow={isToday ? "treino de hoje" : "treino do dia"}
          title={WORKOUT.title}
          meta={heroMeta}
          hint={heroHint}
          href="/treino"
          actionLabel={
            inProgress ? `Continuar ${WORKOUT.title}` : `Iniciar treino ${WORKOUT.title}`
          }
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
        <Link href="/planejar" className={styles.chip}>
          Editar semana
        </Link>
      </div>

      <ExerciseTimeline
        exercises={hasWorkout ? WORKOUT.exercises : []}
        currentIndex={hasWorkout && isToday ? currentExerciseIndex : -1}
        editHref="/planejar"
      />
    </main>
  );
}
