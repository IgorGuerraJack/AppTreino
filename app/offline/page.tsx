import { Placeholder } from "@/components/Placeholder";

export const metadata = { title: "Offline · Treino" };

/** Servida pelo service worker quando a rede falha numa rota ainda não visitada. */
export default function OfflinePage() {
  return (
    <main className="shell shell--withNav">
      <Placeholder
        eyebrow="sem conexão"
        title="Esta tela ainda não foi baixada"
        text="O treino de hoje continua disponível: as séries são gravadas no aparelho e sobem quando a rede voltar."
        actionLabel="Ir para o treino"
        actionHref="/treino"
      />
    </main>
  );
}
