# App de treino — spec de design

Referência visual: `mockup.html` (abra no navegador). Ele é a fonte da verdade
para espaçamento, raios e proporção. Este documento explica o porquê.

## Contexto

App pessoal de treino, uso próprio, PWA instalável, mobile-first (390–430px).
Usado **na academia, de pé, com uma mão, entre séries** — essa é a restrição que
manda em tudo. Alvos de toque grandes, contraste alto, nada que exija precisão.

Escopo v1: treino e evolução. Nada de nutrição, cadernos ou lista de compras.

## Tokens

Tema escuro é o padrão. O acento é a única cor com saturação na tela.

```css
:root {
  --bg:            #050505;  /* fundo da página */
  --surface:       #0D0C0A;  /* cards */
  --surface-alt:   #111010;  /* nav, chips */
  --line:          #26241F;  /* hairline padrão */
  --line-strong:   #3A362C;  /* divisor com ênfase */

  --accent:        #E3CB88;  /* dourado — ações, estado ativo, dado atual */
  --accent-dim:    #C9B173;  /* dados recentes mas não atuais */
  --on-accent:     #14120C;  /* texto sobre dourado */

  --text:          #F5F3EE;
  --text-muted:    #8A857A;
  --text-faint:    #4A463C;  /* itens ainda não preenchidos */

  --r-card:  22px;
  --r-hero:  26px;
  --r-pill:  26px;
}
```

Tema claro (visto na referência) usa a mesma estrutura com `--bg: #FBF4EF`,
`--accent: #3E7CC0`, `--on-accent: #FFF`. Escreva tudo contra as variáveis
desde o primeiro componente — trocar tema depois custa caro.

### Regras de cor

- Um acento por tela. Se dois elementos estão dourados, um deles está errado.
- Dourado marca **onde você está agora**: dia de hoje, série atual, botão da
  ação principal, barra mais recente do gráfico.
- Cinza escuro (`--text-faint`) marca o que ainda não aconteceu — séries não
  feitas ficam visíveis mas apagadas, nunca escondidas.

## Tipografia

Uma família só, sem serifa (Inter ou a de sistema). Pesos 400 e 500, nada mais.

| Papel | Tamanho | Peso |
|---|---|---|
| Display (nome do treino, exercício em execução) | 30–36px | 500 |
| Título de seção | 23px | 500 |
| Corpo / linha de série | 15–17px | 400 |
| Secundário | 13.5px | 400 |
| Sobrescrito (label acima do título) | 11px, letter-spacing 1.8px | 400 |

O sobrescrito é caixa baixa, não maiúscula. Use no máximo um por seção — ele
carrega informação (qual dia, qual estado), não é enfeite.

## Layout

### Card herói (tela de início)

O único elemento com forma orgânica no app inteiro. Retângulo arredondado com
uma ondulação no topo que abre espaço para o dia selecionado do calendário
encaixar dentro. Círculos concêntricos em preto a 9% de opacidade, recortados
pela própria forma, ancorados fora do canto direito.

É desenhado em SVG, não em CSS — o path está no mockup. A ondulação acompanha a
posição do dia ativo: quando o usuário troca de dia, o vale se move junto. Essa
é a única animação não disparada por toque no app.

### Grade

Coluna única, 16px de margem lateral. Sem cards dentro de cards. Listas usam
linha divisória de 0.5px, não caixinhas empilhadas.

```
┌─────────────────────────┐
│  s  t  q (Q) s  s  d    │  faixa da semana
│  ╭──────╮╭╮╭─────────╮  │
│  │      ╰╯            │ │  card herói (ondulação sob o dia ativo)
│  │  treino de hoje    │ │
│  │  Superiores        │ │
│  ╰────────────────────╯ │
│  plano do dia           │
│  Seus exercícios        │
│  (chip) (chip)          │
│  ● Supino inclinado     │  timeline: círculo + linha vertical
│  │ 3 × 10 · 22 kg       │
│  ● Remada curvada       │
│  ╭─────────────────────╮│
│  │ nav em pílula       ││
└─────────────────────────┘
```

A timeline de exercícios usa círculo conectado por linha porque a ordem importa
— é a sequência do treino. Não use numeração em outros lugares.

### Tela de execução

A que mais importa. Regras:

- Nome do exercício em display, sempre visível sem rolar.
- A série atual é a única linha com fundo e borda destacados. As anteriores têm
  check dourado; as seguintes ficam em `--text-faint`.
- Peso já vem preenchido com o da última sessão. O usuário confirma ou ajusta —
  digitar do zero a cada série é o principal atrito desse tipo de app.
- Cronômetro de descanso dispara sozinho ao concluir a série, com `+30s` e
  reiniciar ao lado.
- Botão de ação primária ocupa a largura toda, no rodapé, dourado sólido.

## Nav

Pílula flutuante com 5 posições no máximo — v1 usa 3: início, treino,
progresso. O item ativo ganha um retângulo arredondado de fundo e ícone
dourado; os demais ficam em `--text-muted`.

Ícones: Tabler outline, 22px.

## Copy

Voz direta, caixa baixa nos sobrescritos, sentença normal no resto.

- Botões dizem o que acontece: "Concluir série", "Iniciar treino". Nunca
  "Enviar" ou "OK".
- Vazio é convite, não desculpa: "Nenhum exercício planejado para este dia" com
  um botão de adicionar — não "Nada por aqui ainda".
- Sem exclamação, sem "parabéns", sem emoji.

## Quality floor

- Funciona offline: registro de série grava local e sincroniza depois.
- Tela não apaga durante o treino (wake lock).
- Foco visível no teclado, `prefers-reduced-motion` respeitado.
- Alvos de toque com no mínimo 44px.

## Fora de escopo na v1

Nutrição, integração com wearable, compartilhamento social, login social,
múltiplos usuários. O app é de um usuário só — não construa tabela de contas
antes de precisar.
