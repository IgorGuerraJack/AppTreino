"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconChevronLeft, IconClock } from "@tabler/icons-react";
import { RestTimer } from "@/components/RestTimer";
import { SetTable } from "@/components/SetTable";
import { formatClock, formatKg, parseKg, parseReps } from "@/lib/format";
import { WORKOUT, totalSets } from "@/lib/plan";
import { cursorFor, entriesFor } from "@/lib/session";
import { useTicker } from "@/lib/useTicker";
import { useWakeLock } from "@/lib/useWakeLock";
import { useWorkoutStore } from "@/lib/useWorkoutStore";
import styles from "./treino.module.css";

const TOTAL_SETS = totalSets(WORKOUT);

export default function TreinoPage() {
  const router = useRouter();
  const store = useWorkoutStore(WORKOUT);
  const { hydrated, session, lastWeights } = store;

  const entries = useMemo(() => session?.entries ?? [], [session?.entries]);
  const cursor = useMemo(() => cursorFor(WORKOUT, entries), [entries]);
  const running = session !== null;

  // A tela não pode apagar enquanto o treino está aberto.
  useWakeLock(running);

  const now = useTicker(true);
  const elapsed = now && session ? Math.floor((now - session.startedAt) / 1000) : 0;
  const restRemaining =
    now && session?.restEndsAt ? Math.ceil((session.restEndsAt - now) / 1000) : null;

  /* O exercício mostrado é o corrente; quando tudo acabou, mostramos o último
     para a tela não ficar sem cabeçalho. */
  const shownIndex = cursor.done ? WORKOUT.exercises.length - 1 : cursor.exerciseIndex;
  const exercise = WORKOUT.exercises[shownIndex];
  const doneForExercise = entriesFor(entries, exercise.id);
  const currentSetIndex = cursor.done ? null : cursor.setIndex;

  const prefillWeight = formatKg(lastWeights[exercise.id] ?? exercise.suggestedWeightKg);
  const draftKey = `${exercise.id}:${currentSetIndex ?? "fim"}:${prefillWeight}`;
  const [draft, setDraft] = useState({ key: draftKey, weight: prefillWeight, reps: "" });
  if (draft.key !== draftKey) {
    // Peso já vem preenchido com o da última sessão — digitar do zero é o atrito.
    setDraft({ key: draftKey, weight: prefillWeight, reps: "" });
  }

  const completeSet = () => {
    if (cursor.done) return;
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

  const finish = () => {
    store.finish();
    router.push("/");
  };

  const previous = exercise.previous;
  const lastLine = previous
    ? `última vez: ${previous.sets}×${previous.reps} · ${formatKg(previous.weightKg)} kg`
    : "primeira vez com este exercício";

  const progress = Math.round((entries.length / TOTAL_SETS) * 100);
  const weightIsValid = parseKg(draft.weight) !== null;

  let ctaLabel = "Concluir série";
  if (!hydrated) ctaLabel = "Carregando";
  else if (!running) ctaLabel = "Iniciar treino";
  else if (cursor.done) ctaLabel = "Concluir treino";

  const onCta = () => {
    if (!hydrated) return;
    if (!running) store.start();
    else if (cursor.done) finish();
    else completeSet();
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
        <span className={`eyebrow ${styles.position}`}>
          exercício {shownIndex + 1} de {WORKOUT.exercises.length}
        </span>
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-label="Séries concluídas"
        aria-valuemin={0}
        aria-valuemax={TOTAL_SETS}
        aria-valuenow={entries.length}
      >
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>

      <p className={`eyebrow ${styles.state}`}>
        {cursor.done ? "treino concluído" : running ? "em execução" : "a seguir"}
      </p>
      <h1 className={`display ${styles.name}`}>{exercise.name}</h1>
      <p className={`sub ${styles.last}`}>{lastLine}</p>

      <div className={styles.sets}>
        <SetTable
          exercise={exercise}
          done={doneForExercise}
          currentIndex={running ? currentSetIndex : null}
          weight={draft.weight}
          reps={draft.reps}
          onWeightChange={(weight) => setDraft((d) => ({ ...d, weight }))}
          onRepsChange={(reps) => setDraft((d) => ({ ...d, reps }))}
          onUndo={store.undoLastSet}
        />
      </div>

      {restRemaining !== null ? (
        <div className={styles.rest}>
          <RestTimer
            remainingSeconds={restRemaining}
            onRestart={store.restartRest}
            onAdd30={() => store.addRest(30)}
          />
        </div>
      ) : null}

      {cursor.done ? (
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
            disabled={!hydrated || (running && !cursor.done && !weightIsValid)}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
