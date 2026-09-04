# App de treino

PWA instalável de treino, mobile-first, um usuário só. Next.js (App Router) +
TypeScript. O visual segue `DESIGN.md` e o `mockup.html` de referência.

O plano é uma **rotação que gira** — A, B, C… — não um treino fixo por dia da
semana. Você treina o que estiver no topo da fila; ao concluir, a fila anda um
passo. Um dia de descanso não consome vaga: a fila só avança quando você
realmente treina.

Telas implementadas:

- **Início** (`/`) — faixa da semana (só o passado: hoje em dourado cheio, dias
  já treinados em dourado apagado) e o card herói com o próximo treino da fila,
  vinco sob o dia de hoje.
- **Treino em execução** (`/treino`) — série atual em destaque, peso
  pré-preenchido, cronômetro de descanso e ação primária no rodapé. Ao concluir
  o treino, a fila avança sozinha.
- **Montar rotação** (`/planejar`) — lista os treinos na ordem em que rodam,
  com reordenar e remover; toque num para editar nome e, por exercício, séries,
  repetições, peso e descanso. Ajuste por stepper em vez de teclado; esvaziar
  um treino o tira da rotação.

## Rodando

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # o service worker só registra em produção
npm run lint
npm run typecheck
```

## Deploy

O app é 100% estático depois do build — todas as rotas são pré-renderizadas —
então serve em qualquer host. Duas rotas prontas:

**Vercel.** Importar o repositório e aceitar os padrões. Roda o Next nativo na
raiz do domínio; nenhuma variável precisa ser configurada.

**GitHub Pages.** O workflow em `.github/workflows/deploy-pages.yml` faz lint,
typecheck, exporta estático e publica. Falta só habilitar em
*Settings → Pages → Source: GitHub Actions*. Repositório privado exige plano
pago; num repositório público funciona no plano grátis.

O basePath e o export estático ficam atrás de env vars (`NEXT_PUBLIC_BASE_PATH`
e `NEXT_STATIC_EXPORT`), então os dois caminhos convivem: o Pages publica em
`/<repo>` e a Vercel na raiz, sem fork de código.

```bash
npm run build:pages   # export estático em out/
```

## Estrutura

```
app/
  layout.tsx        casca, fonte, nav, registro do service worker
  globals.css       tokens do spec + papéis tipográficos
  page.tsx          Início
  treino/           Treino em execução
  manifest.ts       manifesto do PWA
  planejar/         Montar rotação (lista de treinos + editor de cada um)
  progresso/  offline/         telas de apoio
components/         WeekStrip, HeroCard, ExerciseTimeline, WorkoutRow, SetTable, RestTimer, NavPill
lib/                rotação, sessão, histórico, persistência, formatação, hooks
public/sw.js        service worker
```

## Decisões

**Tokens.** Nenhum componente escreve cor literal — tudo aponta para uma
variável em `globals.css`, inclusive as variantes de texto sobre o dourado que
o mockup usa (`--on-accent-muted`, `--on-accent-faint`). O bloco do tema claro
já existe em `:root[data-theme="light"]`; falta só quem o acione.

**O vinco do herói.** É um arco elíptico de verdade (`heroPath` em
`components/HeroCard.tsx`), com raio igual ao raio do círculo do dia — encaixa
nele, não uma curva em V aproximando. Marca sempre "hoje" na faixa da semana:
sem treino por dia fixo, não há mais dia para escolher, só o próximo da fila.
Nas pontas da semana ele encolhe um pouco para não invadir o canto arredondado
do card (~84% da profundidade em segunda e domingo, contra o piso de 44px dos
alvos de toque da faixa). É a única animação não disparada por toque, e
respeita `prefers-reduced-motion`.

**A rotação, não o calendário.** O plano não é "um treino por dia da semana" —
é uma sequência (`RotationPlan.workouts`, ordem = ordem de rotação) mais um
ponteiro (`currentWorkoutId`) para o topo da fila. `finish()` só avança o
ponteiro se alguma série foi de fato registrada: abandonar um treino sem bater
nada não move a fila, e um dia sem treinar não pula ninguém — bate exatamente
com uma rotação de N treinos numa semana de treino mais curta que N, onde a
letra de início desliza a cada semana. O ponteiro guarda o *id* do treino, não
um índice: reordenar ou remover outros treinos da fila nunca desloca "onde eu
estou". Remover o treino atual avança para o próximo remanescente.

**Estado da sessão.** A posição atual (exercício e série) não é guardada: é
derivada das séries já registradas (`lib/session.ts`). Um estado a menos para
sair de sincronia depois de um reload ou de um "desfazer". A persistência é
`localStorage` lido como store externa, então duas abas veem a mesma sessão.

**Atrito de digitação.** O peso vem preenchido com o da última vez; as
repetições em branco valem a meta do plano. Concluir uma série no peso e nas
reps planejados é um toque só.

## Onde o código se afasta do mockup

Três desvios, todos por causa do uso real — de pé, com uma mão, na academia:

- **Nav e botão primário fixos no rodapé.** No mockup eles aparecem no fim do
  fluxo; aqui ficam presos embaixo, com `env(safe-area-inset-bottom)`, para não
  sumirem com a rolagem. A nav some na tela de execução, como no mockup.
- **Alvos de toque de 44px.** Chips, dias da semana e os campos da série atual
  são maiores que no mockup. A linha da série em execução fica ~10px mais alta
  por causa disso. Os campos de peso e reps crescem com o conteúdo, e a célula
  inteira (118×44) é a área de toque.
- **Uma seta de voltar** no topo da tela de execução, que o mockup não tem: sem
  ela e sem nav, a tela não teria saída.

## Fora de escopo nesta etapa

`/progresso` existe como destino honesto do chip e da nav — nenhum controle da
tela leva a lugar nenhum — mas ainda não tem conteúdo: ele só faz sentido
depois de algumas sessões registradas.

Sem contas e sem servidor: o plano e o histórico vivem no `localStorage` do
aparelho. `DEFAULT_PLAN` em `lib/plan.ts` é só a semente da primeira abertura —
a partir da primeira edição quem manda é o que está gravado.
