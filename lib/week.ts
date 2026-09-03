/** Letras de segunda a domingo, caixa baixa como no resto da interface. */
const LETTERS = ["s", "t", "q", "q", "s", "s", "d"] as const;

export interface WeekDay {
  key: string;
  /** 1 = segunda … 7 = domingo. */
  isoWeekday: number;
  dayOfMonth: number;
  letter: string;
  isToday: boolean;
}

/** Semana que contém `today`, começando na segunda. */
export function currentWeek(today: Date): WeekDay[] {
  const isoToday = today.getDay() === 0 ? 7 : today.getDay();
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (isoToday - 1));

  return LETTERS.map((letter, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      isoWeekday: index + 1,
      dayOfMonth: date.getDate(),
      letter,
      isToday: index + 1 === isoToday,
    };
  });
}
