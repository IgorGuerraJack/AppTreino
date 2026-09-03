import Link from "next/link";
import styles from "./Placeholder.module.css";

interface Props {
  eyebrow: string;
  title: string;
  text: string;
  actionLabel: string;
  actionHref: string;
}

/** Vazio é convite, não desculpa (spec). */
export function Placeholder({ eyebrow, title, text, actionLabel, actionHref }: Props) {
  return (
    <div className={styles.wrap}>
      <p className={`eyebrow ${styles.label}`}>{eyebrow}</p>
      <h1 className={`sectionTitle ${styles.title}`}>{title}</h1>
      <p className={styles.text}>{text}</p>
      <Link href={actionHref} className={styles.action}>
        {actionLabel}
      </Link>
    </div>
  );
}
