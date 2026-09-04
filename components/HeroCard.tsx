"use client";

import Link from "next/link";
import { useId } from "react";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import styles from "./HeroCard.module.css";

const VIEW_W = 320;
const VIEW_H = 210;
const DAYS = 7;
/* A faixa da semana usa o mesmo recuo (WeekStrip.module.css) para o vinco
   cair exatamente sob o dia ativo. A faixa não é mais tocável (não há dia
   para escolher, só o de hoje) — 6,5% é só o mínimo que afasta segunda e
   domingo o suficiente do canto arredondado do card para caber o vinco
   inteiro, sem tocar a curva do canto. */
const STRIP_INSET = 0.065;
/* Trecho reto do topo do card: fora dele o vinco invadiria os cantos. */
const FLAT_START = 24;
const FLAT_END = 296;
/* Raio do vinco = raio do círculo do dia (34px de diâmetro na tela, convertido
   para unidades do viewBox). Igualar largura e profundidade faz um
   semicírculo de verdade, não uma curva em V. */
const RADIUS = 15;

/** Centro do vinco, em unidades do viewBox, sob a posição de hoje na faixa. */
export function valleyCenter(dayIndex: number): number {
  const fraction = STRIP_INSET + ((dayIndex + 0.5) / DAYS) * (1 - STRIP_INSET * 2);
  return Math.min(FLAT_END, Math.max(FLAT_START, fraction * VIEW_W));
}

/**
 * Quanto do vinco cabe nesta posição. Com o recuo atual isso já dá 1 (cheio)
 * nos 7 dias; a função fica como salvaguarda caso o recuo mude no futuro.
 */
export function valleyScale(cx: number): number {
  const room = Math.min(cx - FLAT_START, FLAT_END - cx);
  return Math.min(1, Math.max(0, room / RADIUS));
}

/**
 * Retângulo arredondado com um vinco semicircular no topo, na posição do dia
 * ativo — um arco elíptico de verdade, não uma curva em V aproximada.
 */
export function heroPath(cx: number, scale = 1): string {
  const n = (value: number) => Math.round(value * 100) / 100;
  const r = RADIUS * scale;
  return [
    "M 4 46",
    "C 4 34 12 26 24 26",
    `H ${n(cx - r)}`,
    // sweep-flag 0 curva a linha para baixo (para dentro do card)
    `A ${n(r)} ${n(r)} 0 0 0 ${n(cx + r)} 26`,
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
  /**
   * Posição de hoje na faixa da semana (0 = segunda … 6 = domingo). O vinco
   * marca "você está aqui" no calendário — não é mais um dia escolhido: com
   * a rotação, o treino mostrado é sempre o próximo da fila, não o do dia.
   */
  todayIndex: number;
  eyebrow: string;
  title: string;
  meta: string;
  hint: string;
  /** Sem href o card é só uma superfície informativa. */
  href?: string;
  actionLabel?: string;
  /**
   * Dourado sólido = há um treino pronto para começar agora. Um href sem
   * treino pronto (convite para montar a rotação) ainda é tocável, mas não
   * preenchido — o dourado é reservado para "pode começar".
   */
  filled?: boolean;
}

export function HeroCard({
  todayIndex,
  eyebrow,
  title,
  meta,
  hint,
  href,
  actionLabel,
  filled = Boolean(href),
}: Props) {
  const clipId = `hero-clip-${useId().replace(/:/g, "")}`;
  const cx = useAnimatedNumber(valleyCenter(todayIndex));
  const d = heroPath(cx, valleyScale(cx));

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

  const className = `${styles.hero} ${filled ? "" : styles["hero--empty"]}`;

  if (href) {
    return (
      <Link href={href} className={className} aria-label={actionLabel ?? title}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
