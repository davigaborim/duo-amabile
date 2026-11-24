# Duo Amábile — site

Site do Duo Amábile: Ana Lúcia Gaborim (canto) e Marcelo Fernandes (violão).
HTML, CSS e JavaScript puros, sem build e sem dependência. É só abrir o
`index.html` no navegador ou jogar a pasta num servidor estático.

## Páginas e idiomas

**O site abre em inglês.** A versão em português mora em `pt/`, com os mesmos
nomes de arquivo. O botão `PT`/`EN` no cabeçalho leva à mesma página na outra
língua, e leva junto a seção em que a pessoa estava (`#imprensa`, `#mapa`…).
Os `id` das seções são os mesmos nas duas versões; não traduzir.

| Arquivo | O que é |
|---|---|
| `index.html` · `pt/index.html` | Página principal: abertura, o duo, trajetória, mapa, imprensa, repertório e contato |
| `videos.html` · `pt/videos.html` | Vídeos: o quadro preso ao lado da lista; clicar numa peça já toca |
| `ana.html` · `pt/ana.html` | Ana Lúcia Gaborim: perfil curto **e** currículo, na mesma página (`#curriculo`) |
| `marcelo.html` · `pt/marcelo.html` | Marcelo Fernandes: perfil curto **e** currículo (`#curriculo`) |
| `curriculo-ana.html`, `curriculo-marcelo.html` | Só redirecionam para `pt/ana.html` e `pt/marcelo.html`. Existem para não quebrar endereços já enviados por e-mail ou impressos (que foram para gente que lê português) |
| `release-duo-amabile.txt` | Release para produtores e imprensa, oferecido para download no site (só em português) |

**Mexeu num texto, mexa nos dois arquivos.** Não há build nem tradução
automática: cada idioma é um HTML escrito à mão. As frases que o JavaScript
monta (menu, mapa, botão do vídeo) ficam em `js/main.js` (bloco 1) e nos
`LUGARES` de `js/mapa.js`, cada uma com `pt` e `en`.

## Regras que valem ao mexer

- **Menu só leva a páginas.** Ana Lúcia, Marcelo, Vídeos. As seções da
  inicial se alcançam rolando ou pela régua do rodapé. O único atalho para
  dentro de uma seção é o botão **Contato**, que é ação e tem cara de botão.
  Misturar `#âncoras` e páginas no mesmo menu já deixou o cabeçalho com nove
  itens e foi reprovado.
- **Nada de revelação no scroll.** Todo bloco subindo ao entrar na tela
  parecia demora de carregamento, não enfeite. As classes `.reveal` e
  `.entra` foram removidas do CSS, do JS e do HTML; não recolocar.
- **Sem rótulo pequeno em cima do título.** O nome da seção é o próprio
  `h2`, na margem esquerda, com o fio dourado curto por cima.
- **Texto sem cara de IA.** Sem travessão (—) no meio de frase, sem frase de
  efeito em título ("Onze anos, lidos de cima a baixo"), sem fecho do tipo
  "é um repertório que não existiria se…". Título diz o que é a seção.

> Os currículos ficavam em páginas separadas e isso confundia quem chegava.
> Agora cada intérprete tem uma página só, com o currículo logo abaixo do
> perfil e um índice fixo na margem.

## Estrutura

```
duo-amabile/
├── index.html, ana.html, marcelo.html, videos.html
├── curriculo-ana.html, curriculo-marcelo.html   ← redirecionamentos
├── release-duo-amabile.txt
├── favicon.svg
├── css/style.css          ← toda a aparência, num arquivo só
├── js/
│   ├── main.js            ← scroll, menu, carrossel, vídeos, gravuras, notas, régua
│   ├── mapa.js            ← o mapa: lugares, zoom e ficha lateral
│   └── mapa-dados.js      ← contornos dos países (não precisa mexer)
└── images/                ← fotos, já redimensionadas para a web
```

## A identidade visual

Branco, creme, preto quente e dourado. O site alterna **três fundos**:

| Fundo | Onde | Classe |
|---|---|---|
| Branco | seções de leitura: o duo, trajetória, repertório | (nenhuma) |
| Creme `#F7F0E3` | imprensa, contato, convite no fim dos perfis | `secao--creme` |
| Preto quente `#1C1917` | cabeçalho, abertura da inicial e dos perfis, mapa, citação, rodapé | `secao--escura` (o `.topo` herda as mesmas variáveis) |

O dourado tem **duas versões**, e é isso que o mantém elegante em vez de
berrante: um escurecido para as partes claras e um claro para as escuras.
Nunca o mesmo nos dois — dourado claro sobre branco fica turvo e reprova no
contraste.

```css
--papel:#FFFFFF     /* fundo da seção            */
--papel-2:#F7F0E3   /* creme das faixas          */
--papel-3:#FFFFFF   /* cartões e fichas          */
--tinta:#1C1917     /* títulos e texto forte     */
--tinta-2:#57534E   /* texto corrido             */
--tinta-3:#6F6960   /* legendas                  */
--ouro:#D9B978      /* dourado sobre o escuro    */
--ouro-tinta:#96590B/* dourado sobre o claro     */
```

Todos os pares de cor foram conferidos contra a norma de contraste (WCAG AA,
4,5:1 para texto): o dourado escuro dá 5,6:1 sobre branco e 5,0:1 sobre creme;
o dourado claro dá 9,3:1 sobre o preto. Ao trocar qualquer cor, vale refazer
essa conta antes de publicar.

### Como trocar o fundo de uma seção

Não existe CSS separado para cada fundo. As classes redefinem as mesmas
variáveis dentro da própria seção, e todo o resto segue sozinho — inclusive o
mapa, os botões, os fios e o dourado, que troca de versão automaticamente:

```html
<section class="secao secao--escura" id="mapa">     <!-- preta  -->
<section class="secao secao--creme" id="imprensa">  <!-- creme  -->
<section class="secao" id="repertorio">             <!-- branca -->
```

Trocar uma seção de fundo é trocar essa classe, mais nada. Se o site ficar
escuro demais (ou de menos), é aí que se ajusta.

Tipografia: **EB Garamond** nos títulos, nomes e citações; **Libre Franklin**
no texto corrido e nos rótulos em versalete. Só duas famílias, sem
monoespaçada.

Dois detalhes de composição carregam a ideia de programa impresso e valem ser
preservados ao mexer no site:

- **O título na margem.** Cada seção tem o nome ("Trajetória", "Imprensa") no
  `h2`, na coluna estreita à esquerda, com um fio dourado curto por cima; a
  frase que explica a seção fica na coluna de leitura. É a classe `.cab__in`
  e a largura vem da variável `--rail`.
- **O fio pontilhado.** Na trajetória, o título de cada apresentação é ligado
  ao lugar onde aconteceu por um pontilhado, como na listagem de um programa.
  É o `<i class="marco__fio">` dentro de `.marco__cabeca`.

> [!warning] Nada de olho de metadados no alto do hero
> A abertura **não** leva aquela linha de versalete separada por pontos
> ("CANTO E VIOLÃO · DESDE 2015 · CAMPO GRANDE, MS"). Ela existiu e foi
> removida a pedido: é o clichê mais reconhecível de página feita por IA, e
> não diz nada que o título e o texto já não digam. Essa informação vive na
> primeira frase da abertura e no texto do duo.

## A abertura é um palco

Desde 18/11/2026 a inicial e os perfis abrem escuros, com um foco de luz
dourada (`radial-gradient`) atrás da foto: o duo recortado na inicial, o
retrato em preto e branco nos perfis. O "Amábile" e o sobrenome de cada um
vêm em dourado itálico. O cabeçalho é escuro em todas as páginas.

Saíram da abertura, a pedido, por parecerem enfeite de IA: a explicação da
palavra *amabile*, os nomes com rótulo em versalete e a faixa de números com a
pauta desenhada logo abaixo.

Ficaram, porque o Davi gosta e dão força à foto: o **quadro creme** atrás do
duo, sangrando para a direita e subindo até a altura da cabeça da Ana, e o
**disco de pauta** em dourado no alto da seção, saindo por baixo do cabeçalho
(é `position:absolute` na abertura, não fixo na tela), que gira com a rolagem. Na versão escura entrou um **contorno dourado torto**
(`rotate(-3.5deg)`) atrás do quadro. Os três são `::before`, `::after` e
`.disco--abertura` dentro de `.abertura__foto`, todos atrás da foto.

A foto recortada (`images/duo-oficial.webp`) foi limpa em 18/11/2026: tinha
sobra do fundo branco entre o braço da Ana e o corpo dela, e entre a cabeça do
Marcelo e o braço dela, que no fundo escuro apareciam como manchas brancas.

Botões são pílulas; fotos, cartões e quadros usam `--raio` (12 px).

## As quatro gravuras, e como desligar cada uma

Quatro elementos dão corpo às páginas sem acrescentar ruído. Todos saem da
mesma ideia do resto do site: a partitura e o instrumento. O disco e a régua
só se mexem com a rolagem. As notas da trajetória vagam o tempo todo, devagar,
e fogem do cursor: é o único movimento contínuo do site, e o Davi quis assim
(18/11/2026). Quem pediu menos movimento no sistema não recebe nenhuma.

| O quê | Onde está | Para que serve |
|---|---|---|
| **Notas flutuantes** | trajetória (`index.html`) | Vagam pelos oito mil pixels da seção mais vazia do site, quicam nas bordas, se afastam umas das outras e fogem do cursor ou do dedo. O toque espalha. A camada é `pointer-events:none`, então nenhum link perde o clique |
| **Violão** | trajetória e citação escura | Contorno de um violão clássico em fio único, cortado pela borda. Sem preenchimento e sem sombra: é gravura, não ilustração |
| **Disco de pauta** | alto da abertura, logo abaixo do cabeçalho, e dentro da régua | Uma pauta de cinco linhas dobrada em círculo, com notas e barras de compasso. Gira conforme a rolagem |
| **Régua de leitura** | barra presa no rodapé, em todas as páginas | Diz em que seção se está e permite pular direto. Cada marca é uma barra de compasso e um botão. Some sozinha quando o rodapé aparece |

Onde cada um é montado:

- As **notas** nascem de `js/main.js` dentro do `<div class="notas" data-notas>`.
  Os botões de ajuste estão logo no começo do bloco 7: `RAIO` e `EMPURRAO`
  (alcance e força do cursor), `TOQUE` (a pancada do clique), `VMAX` e `VMIN`
  (o quanto elas correm) e `FOLGA` (o respiro em volta do texto). A
  quantidade é calculada pela área da seção, na variável `porNota` — quanto
  menor o número, mais notas.
- O **violão** e o **disco** também são desenhados em `js/main.js`. Para pôr um
  violão em outra seção, basta a seção ter `class="secao--gravura"` e receber
  `<span class="violao violao--trilha" aria-hidden="true" data-violao></span>`.
- A **régua** marca as seções que têm `data-regua="Nome"`. Tirar o atributo
  tira a marca, sem mexer em código.

### Como as notas não entram no texto

Cada bloco de texto da trajetória vira uma fila de **círculos** de exclusão ao
longo do seu lado maior. Como os círculos se sobrepõem, a união não tem
cantos: é um campo arredondado, e não a divisória retangular do elemento. A
nota que entra num campo é devolvida para a borda dele no mesmo quadro, em
três passadas — onde dois campos se encostam, corrigir um empurraria a nota
para dentro do outro. Se ainda assim ela ficar entalada, é jogada para fora
por cima ou por baixo, onde sempre há o vão entre um marco e o seguinte.

As fotos **não** são zona de exclusão: as notas passam por cima delas de
propósito, e é o que dá movimento à coluna da direita. Só o texto é
protegido.

Duas coisas mantêm isso barato mesmo com mais de duzentas notas: só as que
estão perto da tela são calculadas (as outras ficam congeladas onde estão), e
os campos de exclusão são medidos uma vez a cada layout, não a cada quadro.
Medido em 60 fps no computador e no celular.

Quem pediu menos movimento nas preferências do sistema não recebe nenhuma
delas — não são sequer criadas.

> [!warning] Versões anteriores de duas destas foram rejeitadas na revisão
> Uma pauta fixa no rodapé e um violão giratório de fundo saíram em agosto de
> 2026, por soarem amadores. Voltaram a pedido, em outro registro — fio fino,
> baixa opacidade, nada girando sozinho, nunca sobre uma foto. **Se a revisão
> reprovar de novo, cada um sai com uma linha só**, e nada mais depende deles:

```css
/* no fim do css/style.css */
.notas  { display: none; }           /* tira as notas flutuantes */
.violao { display: none; }           /* tira os violões de fundo */
.disco  { display: none; }           /* tira o disco de pauta (os dois) */
.regua  { display: none; }           /* tira a barra do rodapé */
```

## Ao mudar o CSS ou o JS, mude o número da versão

Nos HTML, a folha de estilo e os scripts são chamados assim:

```html
<link rel="stylesheet" href="css/style.css?v=19">
<script src="js/main.js?v=19" defer></script>
```

O `?v=` existe porque o navegador guarda o CSS em cache e pode continuar
mostrando o antigo depois de uma publicação — foi o que aconteceu na primeira
vez, e o resultado é uma página meio nova e meio velha, que parece quebrada.
**Depois de mexer no CSS ou num JS, troque o número em todos os HTML**,
inclusive os de `pt/` e o `404.html` (`?v=19`, `?v=19`…), e o navegador é
obrigado a buscar a versão nova.

## Mexer no conteúdo

### Acrescentar um marco na trajetória

No `index.html` e no `pt/index.html`, dentro de `<ol class="linha">`, copie
um `<li class="marco">` e ajuste. **A lista vai do mais recente para o mais
antigo** (pedido do Marcelo, 11/2026): marco novo entra **no topo**, e dentro
do mesmo ano o mais recente vem primeiro.

**Ler mais.** Do marco com o atributo `data-corte` para baixo, a lista fica
recolhida, com só o começo do primeiro escondido aparecendo num degradê e o
botão "Show earlier years" / "Ver os anos anteriores" embaixo. Serve para quem
rola chegar ao mapa mais rápido. Hoje o corte está no 2019 (aparecem 2021 a
2026). Quando entrar ano novo, passe o `data-corte` para o marco mais antigo
que deve sumir e ajuste o texto do botão nos dois idiomas. Sem JavaScript a
lista aparece inteira.

O esqueleto é:

```html
<li class="marco marco--foto">
  <p class="marco__ano">2026</p>
  <div class="marco__corpo">
    <div>
      <div class="marco__cabeca">
        <h3>Título da apresentação</h3>
        <i class="marco__fio"></i>
        <p class="marco__onde">Teatro · Cidade · mês</p>
      </div>
      <p>Um parágrafo contando o que foi.</p>
    </div>
    <figure class="marco__foto">…</figure>
  </div>
</li>
```

- `marco--foto` — o marco tem foto ao lado (sem isso, o texto ocupa a largura toda)
- `marco__foto--alta` — para fotos em pé, que ficam melhor em 3×4
- Dois anos no mesmo marco: `<p class="marco__ano">2020<span>2021</span></p>`

### Acrescentar um vídeo

Em `videos.html` **e** `pt/videos.html`, dentro de `.lista__grupo` (Canções
ou Concertos inteiros), copie um `<li>`. Todo o conteúdo do item vive em
atributos `data-` no botão — é de lá que o quadro tira o que mostrar:

```html
<li>
  <button type="button" class="faixa-item" data-video="IAgmTslQoME"
          data-obra="Ode a Campo Grande"
          data-credito="Poema de Rubênio Marcelo, música de Marcelo Fernandes."
          data-onde="Berna, Suíça">
    <img src="https://i.ytimg.com/vi/IAgmTslQoME/mqdefault.jpg" alt="" width="320" height="180" loading="lazy">
    <span>
      <span class="faixa-item__obra">Ode a Campo Grande</span>
      <span class="faixa-item__credito">Berna, Suíça</span>
      <span class="faixa-item__agora">Em exibição</span>
    </span>
  </button>
</li>
```

Atualize também o número ao lado do título do grupo (`<span>9</span>`).

- `data-video` é só o código do vídeo, o que vem depois de `watch?v=` no
  endereço do YouTube — não o endereço inteiro.
- O primeiro `<li>` da lista é o que aparece no quadro quando a página abre.
  Para destacar um vídeo novo, mova-o para o topo.
- A miniatura vem do próprio YouTube; não é preciso salvar imagem nenhuma.
- `data-onde` pode ficar vazio (`data-onde=""`) quando não houver lugar a
  informar — a linha some sozinha.

> O quadro só carrega o player do YouTube depois que alguém clica em tocar.
> Antes disso a página não conversa com o Google e não paga o peso do player.
> Se um dia isso mudar, o motivo está comentado no `js/main.js`.

### Acrescentar uma matéria na imprensa

No `index.html`, dentro de `<ul class="carrossel__trilho">`, copie um
`<li class="recorte">`. Cada cartão tem foto, veículo com a data, título,
resumo de duas linhas e o link. Os botões de avançar e recuar se ajustam
sozinhos à quantidade de cartões.

Se a matéria for um recorte de jornal (imagem alta), use
`class="recorte__foto recorte__foto--pagina"` para mostrar o alto da página, e
aponte o link para o arquivo com `download`, como está feito com a página do
jornal *O Estado*. Para fotos em pé em que o corte 16×10 cortaria as cabeças,
use `recorte__foto--topo`.

### Material para imprensa

O bloco "Para a imprensa", no fim da seção, oferece três downloads: a foto
oficial, a página do jornal e o `release-duo-amabile.txt`. Para acrescentar um
arquivo novo, ponha-o na pasta e copie um `<a class="kit__item" … download>`.

> O `release-duo-amabile.txt` tem duas linhas marcadas **A PREENCHER** com a
> duração habitual do concerto e as necessidades técnicas. Vale preencher: é a
> primeira coisa que um produtor pergunta.

### Acrescentar um lugar no mapa

No `js/mapa.js`, no vetor `LUGARES`. Cada lugar precisa de `x` e `y` nas
coordenadas do mapa (projeção Miller, 900 × 440,71). Para descobrir o `x`/`y`
de uma cidade nova a partir de latitude e longitude:

```js
var R = 6381372, RAD = Math.PI / 180, MERIDIANO = 11.5;
var x = ((R * (lon - MERIDIANO) * RAD) + 20004297.151525836) * (900 / 40030869.546275224);
var y = ((-R * Math.log(Math.tan((45 + 0.4 * lat) * RAD)) / 0.8) + 12671671.123330014) * (900 / 40030869.546275224);
```

O campo `vistas` diz em qual enquadramento o pino aparece (`mundo`, `brasil`
ou `europa`) e `esq` joga o rótulo para a esquerda do pino, quando dois
lugares ficam perto demais.

### Trocar telefone, e-mail ou redes

Estão em três lugares por página: na seção de contato do `index.html`, no
rodapé de todas as páginas e nos links `wa.me` / `mailto:`. O e-mail também
aparece no `release-duo-amabile.txt`.

### Trocar fotos

Ponha o arquivo em `images/` e aponte o `src`. Vale redimensionar antes: as
fotos aqui têm entre 900 e 2000 px de largura e nenhuma passa de 400 KB.
Sempre preencha o `alt` descrevendo a cena — é o que quem não enxerga vai ler.

A foto de abertura é a oficial, a mesma que o *Diário de Aveiro* publicou, com
o fundo branco recortado (`images/duo-oficial.webp`). A versão original, com
fundo, é a que fica disponível para download em `images/duo-oficial.jpg`.

## Publicar

A pasta é estática, então serve em qualquer lugar. No GitHub Pages basta
subir o conteúdo e apontar o Pages para a raiz do repositório; o arquivo
`.nojekyll` já está aqui para o Jekyll não comer nada.

## De onde veio o conteúdo

Do portfólio `Duo Amabile 2026.pptx`, do `Release Duo Amabile.pdf` e da página
do corpo docente da FAALC/UFMS (<https://faalc.ufms.br/corpo-docente/>), de
onde vieram os anos de titulação e os e-mails institucionais. Onde as fontes
discordavam, seguiu-se o release, que é o texto mais recente. Vale conferir
estes pontos com Ana e Marcelo:

1. **“Canções poéticas e imagens modernistas”** — o release diz **2019**, o
   portfólio diz 2021. O site está com 2019.
2. **“Cem anos de Semana de Arte Moderna em Terras Pantaneiras”** — o release
   coloca o aporte do FIC em **2022** e o portfólio coloca os concertos em
   2023. O site trata como projeto contemplado em 2022 e realizado até o
   encerramento no Bioparque, em outubro de 2023.
3. **Winterthur** — o release deixa claro que foi **recital solo de Marcelo**,
   não do Duo. O site está assim, e por isso Winterthur não tem pino próprio
   no mapa: aparece no texto de Berna e no currículo dele.
4. **Titulação de Marcelo** — a UFMS registra “Mestre em Artes (2003)”; o
   texto antigo do site dizia “Mestre em Violão”. O site agora segue a UFMS.
5. **Graduação de Ana Lúcia** — o site diz “Bacharela em Composição e
   Regência”, como no release; a UFMS registra “Bacharelado em Música com
   habilitação em Composição”. Ficou como estava, com o ano (2000) da UFMS.

Os números do texto “o duo” (6 países, 16 cidades de MS) foram contados a
partir desses documentos. Se entrar concerto novo, é só atualizar à mão no
`index.html` e no `pt/index.html`.

Duas informações não vêm desses arquivos e foram confirmadas direto com a
família: o **hino da UFMS** é composição de Marcelo, e a **Camerata Madeiras
Dedilhadas** foi fundada por ele. O casamento em **1998** também veio daí.

## Sobre as coordenadas do mapa

Os pontos foram conferidos um a um contra o contorno real de cada país: seis
dos oito caem dentro do polígono do país. Os outros dois — Rio de Janeiro e
Aveiro — ficam 11 km e 2 km fora da linha de costa, porque o desenho do mapa
é generalizado e o litoral fica levemente para dentro do lugar verdadeiro.
As coordenadas estão certas; na tela a diferença é de dois pixels. Não vale
“corrigir” empurrando os pontos para dentro.
