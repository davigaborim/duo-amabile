# Duo Amábile — site

Site do Duo Amábile: Ana Lúcia Gaborim (canto) e Marcelo Fernandes (violão).
HTML, CSS e JavaScript puros, sem build e sem dependência. É só abrir o
`index.html` no navegador ou jogar a pasta num servidor estático.

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Página principal: abertura, o duo, trajetória, mapa, imprensa, repertório e contato |
| `ana.html` | Ana Lúcia Gaborim — perfil **e** currículo completo, na mesma página (`ana.html#curriculo`) |
| `marcelo.html` | Marcelo Fernandes — perfil **e** currículo completo (`marcelo.html#curriculo`) |
| `curriculo-ana.html`, `curriculo-marcelo.html` | Só redirecionam para as páginas acima. Existem para não quebrar endereços já enviados por e-mail ou impressos |
| `release-duo-amabile.txt` | Release para produtores e imprensa, oferecido para download no site |

> Os currículos ficavam em páginas separadas e isso confundia quem chegava.
> Agora cada intérprete tem uma página só, com o currículo logo abaixo do
> perfil e um índice fixo na margem.

## Estrutura

```
duo-amabile/
├── index.html, ana.html, marcelo.html
├── curriculo-ana.html, curriculo-marcelo.html   ← redirecionamentos
├── release-duo-amabile.txt
├── favicon.svg
├── css/style.css          ← toda a aparência, num arquivo só
├── js/
│   ├── main.js            ← revelação no scroll, menu, carrossel, índice do currículo
│   ├── mapa.js            ← o mapa: lugares, zoom e ficha lateral
│   └── mapa-dados.js      ← contornos dos países (não precisa mexer)
└── images/                ← fotos, já redimensionadas para a web
```

## A identidade visual

Branco, creme, preto quente e dourado. O site alterna **três fundos**:

| Fundo | Onde | Classe |
|---|---|---|
| Branco | seções de leitura: o duo, trajetória, repertório | (nenhuma) |
| Creme `#F7F0E3` | faixa de números, imprensa, contato | `secao--creme` |
| Preto quente `#1C1917` | mapa, citação, rodapé | `secao--escura` |

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

- **O rótulo na margem.** Cada seção tem o nome ("Trajetória", "Imprensa") na
  coluna estreita à esquerda, com um fio dourado curto por cima, alinhado com
  a primeira linha do título. É a classe `.cab__in` e a largura vem da
  variável `--rail`.
- **O fio pontilhado.** Na trajetória, o título de cada apresentação é ligado
  ao lugar onde aconteceu por um pontilhado, como na listagem de um programa.
  É o `<i class="marco__fio">` dentro de `.marco__cabeca`.

> [!warning] Nada de olho de metadados no alto do hero
> A abertura **não** leva aquela linha de versalete separada por pontos
> ("CANTO E VIOLÃO · DESDE 2015 · CAMPO GRANDE, MS"). Ela existiu e foi
> removida a pedido: é o clichê mais reconhecível de página feita por IA, e
> não diz nada que o título e o texto já não digam. Essa informação vive na
> faixa de números logo abaixo.

## Ao mudar o CSS, mude o número da versão

Nos HTML, a folha de estilo é chamada assim:

```html
<link rel="stylesheet" href="css/style.css?v=3">
```

O `?v=3` existe porque o navegador guarda o CSS em cache e pode continuar
mostrando o antigo depois de uma publicação — foi o que aconteceu na primeira
vez, e o resultado é uma página meio nova e meio velha, que parece quebrada.
**Depois de mexer no `style.css`, troque o número em todos os HTML** (`?v=4`,
`?v=5`…) e o navegador é obrigado a buscar a versão nova.

## Mexer no conteúdo

### Acrescentar um marco na trajetória

No `index.html`, dentro de `<ol class="linha">`, copie um `<li class="marco">`
e ajuste. O esqueleto é:

```html
<li class="marco marco--foto reveal">
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

Os números da seção “o duo” (6 países, 16 cidades de MS, 4 projetos com
fomento) foram contados a partir desses documentos. Se entrar concerto novo,
é só atualizar à mão no `index.html`.

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
