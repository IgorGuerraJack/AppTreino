"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBarbell, IconChartBar, IconHome } from "@tabler/icons-react";
import styles from "./NavPill.module.css";

const ITEMS = [
  { href: "/", label: "Início", Icon: IconHome },
  { href: "/treino", label: "Treino", Icon: IconBarbell },
  { href: "/progresso", label: "Progresso", Icon: IconChartBar },
] as const;

/** Rotas que ocupam a tela inteira: o rodapé é do botão de ação primária. */
const HIDDEN_ON = ["/treino"];

export function NavPill() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav} aria-label="Seções">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={styles.item}
              aria-current={active ? "page" : undefined}
              aria-label={label}
            >
              <Icon size={22} stroke={1.5} aria-hidden />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
