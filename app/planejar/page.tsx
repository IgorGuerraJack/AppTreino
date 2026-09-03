import { Suspense } from "react";
import { PlanejarEditor } from "./PlanejarEditor";

export const metadata = { title: "Semana · Treino" };

export default function PlanejarPage() {
  // O editor lê ?dia= da URL, o que exige um limite de Suspense no export estático.
  return (
    <Suspense fallback={<main className="shell shell--withNav" />}>
      <PlanejarEditor />
    </Suspense>
  );
}
