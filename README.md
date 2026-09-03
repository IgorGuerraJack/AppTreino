# App de treino

PWA instalável de treino, mobile-first, um usuário só. Next.js (App Router) +
TypeScript. O visual segue `DESIGN.md` e o `mockup.html` de referência.

Duas telas implementadas nesta etapa:

- **Início** (`/`) — faixa da semana, card herói com a ondulação sob o dia
  ativo, e a timeline de exercícios do dia.
- **Treino em execução** (`/treino`) — série atual em destaque, peso
  pré-preenchido, cronômetro de descanso e ação primária no rodapé.

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

## Estrutura

```
app/
  layout.tsx        casca, fonte, nav, registro do service worker
  globals.css       tokens do spec + papéis tipográficos
  page.tsx          Início
  treino/           Treino em execução
  manifest.ts       manifesto do PWA
  progresso/  planejar/  offline/   telas de apoio
components/         WeekStrip, HeroCard, ExerciseTimeline, SetTable, RestTimer, NavPill
lib/                plano, sessão, persistência, formatação, hooks
public/sw.js        service worker
```

## Decisões

**Tokens.** Nenhum componente escreve cor literal — tudo aponta para uma
variável em `globals.css`, inclusive as variantes de texto sobre o dourado que
o mockup usa (`--on-accent-muted`, `--on-accent-faint`). O bloco do tema claro
já existe em `:root[data-theme="light"]`; falta só quem o acione.

**A ondulação do herói.** O path do mockup foi parametrizado pelo centro do
vale (`heroPath` em `components/HeroCard.tsx`), e o vale acompanha o dia
selecionado. Nas pontas da semana ele não cabe inteiro entre os cantos
arredondados, então encolhe em vez de escorregar para debaixo do dia errado —
segunda e domingo ganham uma covinha rasa, alinhada com o dia. É a única
animação não disparada por toque, e ela respeita `prefers-reduced-motion`.

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

`/progresso` e `/planejar` existem como destinos honestos dos chips e da nav —
nenhum controle da tela leva a lugar nenhum — mas ainda não têm conteúdo. O
plano de treino mora em `lib/plan.ts`, não em banco: é um app de um usuário só.
