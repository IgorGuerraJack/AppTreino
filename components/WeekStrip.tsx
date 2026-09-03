"use client";

import type { WeekDay } from "@/lib/week";
import styles from "./WeekStrip.module.css";

const FULL_NAME = [
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
  "domingo",
];

interface Props {
  days: WeekDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function WeekStrip({ days, selectedIndex, onSelect }: Props) {
  return (
    <div className={styles.strip} role="group" aria-label="Semana">
      {days.map((day, index) => (
        <button
          key={day.key}
          type="button"
          className={styles.day}
          aria-pressed={index === selectedIndex}
          aria-label={`${FULL_NAME[index]}, dia ${day.dayOfMonth}${day.isToday ? ", hoje" : ""}`}
          onClick={() => onSelect(index)}
        >
          <span className={styles.letter} aria-hidden>
            {day.letter}
          </span>
          <span className={styles.number}>{day.dayOfMonth}</span>
        </button>
      ))}
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
