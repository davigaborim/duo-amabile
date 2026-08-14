# Duo Amábile — site

Site do Duo Amábile: Ana Lúcia Gaborim (canto) e Marcelo Fernandes (violão).
HTML, CSS e JavaScript puros, sem build e sem dependência. É só abrir o
`index.html` no navegador ou jogar a pasta num servidor estático.

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Página principal: abertura, o duo, trajetória, mapa, repertório, imprensa e contato |
| `ana.html` | Página de Ana Lúcia Gaborim |
| `curriculo-ana.html` | Currículo dela (sublink da página acima) |
| `marcelo.html` | Página de Marcelo Fernandes |
| `curriculo-marcelo.html` | Currículo dele (sublink da página acima) |

## Estrutura

```
duo-amabile/
├── index.html, ana.html, marcelo.html, curriculo-*.html
├── favicon.svg
├── css/style.css          ← toda a aparência, num arquivo só
├── js/
│   ├── main.js            ← pauta, violão, revelação no scroll, menu
│   ├── mapa.js            ← o mapa: lugares, zoom e ficha lateral
│   └── mapa-dados.js      ← contornos dos países (não precisa mexer)
└── images/                ← fotos, já redimensionadas para a web
```

## A identidade visual

A paleta saiu das fotos do próprio Duo na Igreja das Carmelitas, em Aveiro:
talha dourada acesa contra sombra quente. As cores estão todas no topo do
`css/style.css`, em variáveis:

```css
--breu:#14100C     /* fundo da página     */
--nogueira:#211910 /* seções alternadas   */
--talha:#C9922F    /* fios e rótulos      */
--ouro:#E8C87A     /* destaques de texto  */
--marfim:#F4EDE0   /* texto principal     */
--sepia:#AC9C86    /* texto secundário    */
```

Mudou de ideia sobre uma cor? Troque só ali em cima — o site inteiro segue.

Tipografia: **Fraunces** nos títulos, **Archivo** no texto corrido e
**IBM Plex Mono** nos rótulos pequenos (datas, lugares, legendas).

## As duas animações

**A pauta**, fixa no rodapé, é a assinatura do site: a melodia está impressa
de ponta a ponta e a nota anda com a rolagem, acendendo o que já passou.
Para mudar a melodia, edite o vetor `MELODIA` no `js/main.js` — cada número é
uma altura na pauta, de `0` (linha de baixo) a `8` (linha de cima).

**O violão** fica cortado pela borda direita e gira devagar conforme a página
anda. As cordas atravessam a tela inteira; quando uma seção nova entra, uma
delas soa. Está no fim de cada HTML, na `<div class="violao">`.

Quem tem `prefers-reduced-motion` ligado no sistema não vê nenhuma das duas
se mexer — isso já está tratado.

## Mexer no conteúdo

### Acrescentar um marco na trajetória

No `index.html`, dentro de `<ol class="linha">`, copie um `<li class="marco">`
e ajuste. As classes fazem o seguinte:

- `marco--foto` — o marco tem foto ao lado (sem isso, o texto ocupa a largura toda)
- `marco--fora` — concerto fora do Brasil; deixa a cabeça de nota vazada
- `marco__foto--alta` — para fotos em pé, que ficam melhor em 3×4

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
rodapé de todas as páginas e nos links `wa.me` / `mailto:`.

### Trocar fotos

Ponha o arquivo em `images/` e aponte o `src`. Vale redimensionar antes: as
fotos aqui têm entre 900 e 2000 px de largura e nenhuma passa de 400 KB.
Sempre preencha o `alt` descrevendo a cena — é o que quem não enxerga vai ler.

## Publicar

A pasta é estática, então serve em qualquer lugar. No GitHub Pages basta
subir o conteúdo e apontar o Pages para a raiz do repositório; o arquivo
`.nojekyll` já está aqui para o Jekyll não comer nada.

## De onde veio o conteúdo

Do portfólio `Duo Amabile 2026.pptx` e do `Release Duo Amabile.pdf`. Onde os
dois discordavam, seguiu-se o release, que é o texto mais recente. Vale
conferir estes três pontos com Ana e Marcelo:

1. **“Canções poéticas e imagens modernistas”** — o release diz **2019**, o
   portfólio diz 2021. O site está com 2019.
2. **“Cem anos de Semana de Arte Moderna em Terras Pantaneiras”** — o release
   coloca o aporte do FIC em **2022** e o portfólio coloca os concertos em
   2023. O site trata como projeto contemplado em 2022 e realizado até o
   encerramento no Bioparque, em outubro de 2023.
3. **Winterthur** — o release deixa claro que foi **recital solo de Marcelo**,
   não do Duo. O site está assim, e por isso Winterthur não tem pino próprio
   no mapa: aparece no texto de Berna e no currículo dele.

Os números da seção “o duo” (6 países, 16 cidades de MS, 4 projetos com
fomento) foram contados a partir desses dois documentos. Se entrar concerto
novo, é só atualizar à mão no `index.html`.

Duas informações não vêm desses arquivos e foram confirmadas direto com a
família: o **hino da UFMS** é composição de Marcelo, e a **Camerata Madeiras
Dedilhadas** foi fundada por ele. Estão na página e no currículo dele. O
casamento em **1998** também veio daí, e aparece na seção “o duo”.

## Sobre as coordenadas do mapa

Os pontos foram conferidos um a um contra o contorno real de cada país: seis
dos oito caem dentro do polígono do país. Os outros dois — Rio de Janeiro e
Aveiro — ficam 11 km e 2 km fora da linha de costa, porque o desenho do mapa
é generalizado e o litoral fica levemente para dentro do lugar verdadeiro.
As coordenadas estão certas; na tela a diferença é de dois pixels. Não vale
“corrigir” empurrando os pontos para dentro.
