import { Placeholder } from "@/components/Placeholder";

export const metadata = { title: "Progresso · Treino" };

export default function ProgressoPage() {
  return (
    <main className="shell shell--withNav">
      <Placeholder
        eyebrow="esta semana"
        title="Seu volume"
        text="A evolução aparece aqui depois do primeiro treino registrado."
        actionLabel="Ir para o treino"
        actionHref="/treino"
      />
    </main>
  );
}
