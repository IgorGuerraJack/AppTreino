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
  /* Com trailingSlash o pathname vem como "/treino/": normaliza antes de
     comparar, senão a nav não se esconde e cobre o botão de ação. */
  const route = pathname.replace(/\/+$/, "") || "/";
  if (HIDDEN_ON.includes(route)) return null;

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav} aria-label="Seções">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? route === "/" : route === href || route.startsWith(`${href}/`);
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
