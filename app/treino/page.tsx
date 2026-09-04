"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconChevronLeft, IconClock } from "@tabler/icons-react";
import { Placeholder } from "@/components/Placeholder";
import { RestTimer } from "@/components/RestTimer";
import { SetTable } from "@/components/SetTable";
import { formatClock, formatKg, parseKg, parseReps } from "@/lib/format";
import { formatSummary, lastSummaryFor } from "@/lib/history";
import { totalSets, workoutById } from "@/lib/plan";
import { cursorFor, entriesFor } from "@/lib/session";
import { useTicker } from "@/lib/useTicker";
import { useWakeLock } from "@/lib/useWakeLock";
import { useWorkoutStore } from "@/lib/useWorkoutStore";
import styles from "./treino.module.css";

export default function TreinoPage() {
  const router = useRouter();
  const store = useWorkoutStore();
  const { hydrated, plan, currentWorkoutId, session, history, lastWeights } = store;

  // Sessão em andamento manda mais que a fila — o ponteiro só avança ao concluir.
  const workout = session
    ? (plan.workouts.find((w) => w.id === session.workoutId) ?? null)
    : workoutById(plan, currentWorkoutId);

  const entries = useMemo(() => session?.entries ?? [], [session?.entries]);
  const cursor = useMemo(
    () => (workout ? cursorFor(workout, entries) : null),
    [workout, entries],
  );
  const running = session !== null;
  const ready = hydrated;

  // A tela não pode apagar enquanto o treino está aberto.
  useWakeLock(running);

  const now = useTicker(true);
  const elapsed = now && session ? Math.floor((now - session.startedAt) / 1000) : 0;
  const restRemaining =
    now && session?.restEndsAt ? Math.ceil((session.restEndsAt - now) / 1000) : null;

  /* O exercício mostrado é o corrente; quando tudo acabou, mostramos o último
     para a tela não ficar sem cabeçalho. */
  const shownIndex =
    workout && cursor
      ? cursor.done
        ? workout.exercises.length - 1
        : cursor.exerciseIndex
      : 0;
  const exercise = workout?.exercises[shownIndex];
  const currentSetIndex = cursor && !cursor.done ? cursor.setIndex : null;

  /* "última vez" sai do histórico; o `previous` do plano é só a semente, que
     vale enquanto não existir nenhuma sessão concluída com este exercício. */
  const lastSummary = useMemo(
    () => (exercise ? lastSummaryFor(history, exercise.id) : null),
    [history, exercise],
  );

  const prefillWeight = exercise
    ? formatKg(lastWeights[exercise.id] ?? exercise.suggestedWeightKg)
    : "";
  const draftKey = `${exercise?.id ?? "none"}:${currentSetIndex ?? "fim"}:${prefillWeight}`;
  const [draft, setDraft] = useState({ key: draftKey, weight: prefillWeight, reps: "" });
  if (draft.key !== draftKey) {
    // Peso já vem preenchido com o da última sessão — digitar do zero é o atrito.
    setDraft({ key: draftKey, weight: prefillWeight, reps: "" });
  }

  if (ready && !workout) {
    return (
      <main className="shell shell--withNav">
        <Placeholder
          eyebrow="fila vazia"
          title="Nada montado ainda"
          text="Nenhum treino na rotação. Monte o primeiro e ele aparece aqui."
          actionLabel="Montar rotação"
          actionHref="/planejar"
        />
      </main>
    );
  }

  const completeSet = () => {
    if (!cursor || cursor.done) return;
    const weightKg = parseKg(draft.weight);
    if (weightKg === null) return;
    store.logSet(
      {
        exerciseId: cursor.exercise.id,
        setIndex: cursor.setIndex,
        weightKg,
        // Campo vazio vale a meta do plano: o caso comum não exige digitação.
        reps: parseReps(draft.reps) ?? cursor.exercise.targetReps,
      },
      cursor.exercise.restSeconds,
    );
  };

  const seed = exercise?.previous;
  let lastLine = "primeira vez com este exercício";
  if (lastSummary) {
    lastLine = `última vez: ${formatSummary(lastSummary)}`;
  } else if (seed) {
    lastLine = `última vez: ${seed.sets}×${seed.reps} · ${formatKg(seed.weightKg)} kg`;
  }

  const total = workout ? totalSets(workout) : 0;
  const progress = total > 0 ? Math.round((entries.length / total) * 100) : 0;
  const weightIsValid = parseKg(draft.weight) !== null;
  const finished = cursor?.done === true;

  let ctaLabel = "Concluir série";
  if (!ready) ctaLabel = "Carregando";
  else if (!running) ctaLabel = "Iniciar treino";
  else if (finished) ctaLabel = "Concluir treino";

  const onCta = () => {
    if (!ready || !workout) return;
    if (!running) store.start(workout);
    else if (finished) {
      store.finish();
      router.push("/");
    } else completeSet();
  };

  return (
    <main className={`shell ${styles.shell}`}>
      <div className={styles.header}>
        <Link href="/" className={styles.back} aria-label="Voltar para o início">
          <IconChevronLeft size={22} stroke={1.5} aria-hidden />
        </Link>
        <span className={`sub ${styles.elapsed}`}>
          <IconClock size={15} stroke={1.5} aria-hidden />
          <span className="visuallyHidden">tempo de treino</span>
          {formatClock(elapsed)}
        </span>
        {workout ? (
          <span className={`eyebrow ${styles.position}`}>
            exercício {shownIndex + 1} de {workout.exercises.length}
          </span>
        ) : null}
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-label="Séries concluídas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={entries.length}
      >
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>

      <p className={`eyebrow ${styles.state}`}>
        {finished ? "treino concluído" : running ? "em execução" : "a seguir"}
      </p>
      <h1 className={`display ${styles.name}`}>{exercise?.name || "Exercício sem nome"}</h1>
      <p className={`sub ${styles.last}`}>{lastLine}</p>

      {exercise ? (
        <div className={styles.sets}>
          <SetTable
            exercise={exercise}
            done={entriesFor(entries, exercise.id)}
            currentIndex={running ? currentSetIndex : null}
            weight={draft.weight}
            reps={draft.reps}
            onWeightChange={(weight) => setDraft((d) => ({ ...d, weight }))}
            onRepsChange={(reps) => setDraft((d) => ({ ...d, reps }))}
            onUndo={store.undoLastSet}
          />
        </div>
      ) : null}

      {restRemaining !== null ? (
        <div className={styles.rest}>
          <RestTimer
            remainingSeconds={restRemaining}
            onRestart={store.restartRest}
            onAdd30={() => store.addRest(30)}
          />
        </div>
      ) : null}

      {finished ? (
        <div className={styles.summary}>
          <p className={`eyebrow ${styles.state}`}>resumo</p>
          <p className={`sub ${styles.summaryText}`}>
            {entries.length} séries registradas em {formatClock(elapsed)}. Fica tudo salvo no
            aparelho.
          </p>
        </div>
      ) : null}

      <div className={styles.footer}>
        <div className={styles.footerInner}>
          <button
            type="button"
            className={styles.cta}
            onClick={onCta}
            disabled={!ready || (running && !finished && !weightIsValid)}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
