import { Placeholder } from "@/components/Placeholder";

export const metadata = { title: "Semana · Treino" };

export default function PlanejarPage() {
  return (
    <main className="shell shell--withNav">
      <Placeholder
        eyebrow="montar semana"
        title="Editar plano"
        text="O plano da semana ainda vive no código. A edição pela tela entra depois do treino e da evolução."
        actionLabel="Voltar ao início"
        actionHref="/"
      />
    </main>
  );
}
