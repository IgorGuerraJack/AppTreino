import type { WeekDay } from "@/lib/week";
import styles from "./WeekStrip.module.css";

interface Props {
  days: WeekDay[];
  /** Chaves (WeekDay.key) dos dias em que algum treino foi concluído. */
  trainedKeys: Set<string>;
}

/**
 * Faixa só de leitura: sem treino fixo por dia, não há mais "escolher um dia
 * para ver o plano dele" — o card herói sempre mostra o próximo da fila. A
 * faixa marca onde hoje está no calendário e o que já foi feito.
 */
export function WeekStrip({ days, trainedKeys }: Props) {
  return (
    <div className={styles.strip} role="group" aria-label="Semana">
      {days.map((day) => {
        const trained = trainedKeys.has(day.key);
        return (
          <div
            key={day.key}
            className={styles.day}
            aria-label={`${day.letter === "d" ? "domingo" : day.letter}, dia ${day.dayOfMonth}${
              day.isToday ? ", hoje" : trained ? ", treinado" : ""
            }`}
          >
            <span className={styles.letter} aria-hidden data-today={day.isToday || undefined}>
              {day.letter}
            </span>
            <span
              className={styles.number}
              data-today={day.isToday || undefined}
              data-trained={(!day.isToday && trained) || undefined}
            >
              {day.dayOfMonth}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Placeholder do primeiro paint: as datas só existem no cliente. */
export function WeekStripSkeleton() {
  return (
    <div className={styles.strip} aria-hidden>
      {["s", "t", "q", "q", "s", "s", "d"].map((letter, index) => (
        <div key={index} className={styles.day}>
          <span className={styles.letter}>{letter}</span>
          <span className={styles.number} />
        </div>
      ))}
    </div>
  );
}
