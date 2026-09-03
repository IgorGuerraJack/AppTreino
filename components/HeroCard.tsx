"use client";

import Link from "next/link";
import { useId } from "react";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import styles from "./HeroCard.module.css";

const VIEW_W = 320;
const VIEW_H = 210;
const DAYS = 7;
/* A faixa da semana tem 2.5% de recuo de cada lado; a ondulação usa o mesmo
   mapeamento para cair exatamente sob o dia ativo. */
const STRIP_INSET = 0.025;
/* Trecho reto do topo do card: fora dele a ondulação invadiria os cantos. */
const FLAT_START = 24;
const FLAT_END = 296;
const HALF_WIDTH = 30;
const DEPTH = 44;

/** Centro da ondulação, em unidades do viewBox, para o dia selecionado. */
export function valleyCenter(dayIndex: number): number {
  const fraction = STRIP_INSET + ((dayIndex + 0.5) / DAYS) * (1 - STRIP_INSET * 2);
  return Math.min(FLAT_END, Math.max(FLAT_START, fraction * VIEW_W));
}

/**
 * Quanto da ondulação cabe nesta posição. Nos dias das pontas ela não cabe
 * inteira, então encolhe em vez de escorregar para debaixo do dia errado.
 */
export function valleyScale(cx: number): number {
  const room = Math.min(cx - FLAT_START, FLAT_END - cx);
  return Math.min(1, Math.max(0, room / HALF_WIDTH));
}

/**
 * Retângulo arredondado com uma ondulação no topo, na posição do dia ativo.
 * Os números vêm do path do mockup, parametrizados por centro e escala.
 */
export function heroPath(cx: number, scale = 1): string {
  const n = (value: number) => Math.round(value * 100) / 100;
  const w = HALF_WIDTH * scale;
  const floor = 26 + DEPTH * scale;
  return [
    "M 4 46",
    "C 4 34 12 26 24 26",
    `H ${n(cx - w)}`,
    `C ${n(cx - w * 0.47)} 26 ${n(cx - w * 0.4)} ${n(floor)} ${n(cx)} ${n(floor)}`,
    `C ${n(cx + w * 0.4)} ${n(floor)} ${n(cx + w * 0.47)} 26 ${n(cx + w)} 26`,
    "H 296",
    "C 308 26 316 34 316 46",
    "V 186",
    "C 316 198 308 206 296 206",
    "H 24",
    "C 12 206 4 198 4 186",
    "Z",
  ].join(" ");
}

interface Props {
  dayIndex: number;
  eyebrow: string;
  title: string;
  meta: string;
  hint: string;
  /** Sem href o card é só uma superfície informativa (dia sem treino). */
  href?: string;
  actionLabel?: string;
}

export function HeroCard({ dayIndex, eyebrow, title, meta, hint, href, actionLabel }: Props) {
  const clipId = `hero-clip-${useId().replace(/:/g, "")}`;
  const cx = useAnimatedNumber(valleyCenter(dayIndex));
  const d = heroPath(cx, valleyScale(cx));
  const filled = Boolean(href);

  const body = (
    <>
      <svg
        className={styles.shape}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        focusable="false"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={d} />
          </clipPath>
        </defs>
        <path
          d={d}
          fill={filled ? "var(--accent)" : "var(--surface)"}
          stroke={filled ? "none" : "var(--line)"}
          strokeWidth={filled ? 0 : 0.5}
        />
        {filled ? (
          <g
            clipPath={`url(#${clipId})`}
            fill="none"
            stroke="var(--on-accent)"
            strokeOpacity="0.09"
            strokeWidth="1.5"
          >
            <circle cx="286" cy="146" r="48" />
            <circle cx="286" cy="146" r="82" />
            <circle cx="286" cy="146" r="116" />
          </g>
        ) : null}
      </svg>

      <div className={styles.content}>
        <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
        <p className={styles.title}>{title}</p>
        <p className={styles.meta}>{meta}</p>
        <p className={styles.hint}>{hint}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.hero} aria-label={actionLabel ?? title}>
        {body}
      </Link>
    );
  }

  return <div className={`${styles.hero} ${styles["hero--empty"]}`}>{body}</div>;
}
