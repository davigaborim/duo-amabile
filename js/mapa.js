/* ==========================================================================
   DUO AMÁBILE — mapa de concertos

   Os países vêm de js/mapa-dados.js, na projeção Miller (900 x 440,71).
   Os pinos são botões de HTML posicionados por cima do SVG: assim o alvo de
   toque, o foco do teclado e o rótulo continuam do mesmo tamanho com o mapa
   aberto no mundo ou aproximado na Europa.
   ========================================================================== */

(function () {
  'use strict';

  var tela = document.getElementById('mapaTela');
  var ficha = document.getElementById('mapaFicha');
  if (!tela || !ficha || !window.MAPA_PAISES) return;

  var NS = 'http://www.w3.org/2000/svg';

  /* ---- o que o mapa mostra --------------------------------------------- */

  // onde o Duo se apresentou
  var PAISES_DUO = ['BR', 'PT', 'CZ', 'CH', 'FR', 'IT'];
  // onde Marcelo Fernandes já tocou como solista
  var PAISES_SOLO = ['ES', 'DE', 'BE', 'PY', 'CO', 'BO', 'US', 'CL'];

  // Regiões enquadradas pelo mapa. A largura manda: a altura sai da proporção
  // do viewBox, para o zoom nunca deformar o desenho.
  var VISTAS = {
    mundo:  { x: 0,   y: 8,     w: 900 },
    brasil: { x: 252, y: 323,   w: 84  },
    europa: { x: 380, y: 141.7, w: 100 }
  };

  var CAIXA = { x: 0, y: 8, w: 900, h: 392 };   // viewBox do SVG

  /* O site tem inglês na raiz e português em pt/. Cada texto dos lugares
     vem nas duas línguas, e as fotos são buscadas a partir da raiz. */
  var PT = (document.documentElement.lang || '').toLowerCase().indexOf('pt') === 0;
  var RAIZ = PT ? '../' : '';
  var L = function (par) { return par && typeof par === 'object' ? (PT ? par.pt : par.en) : par; };

  var LUGARES = [
    {
      id: 'ms', nome: 'Mato Grosso do Sul', pais: { pt: 'Brasil', en: 'Brazil' },
      x: 284.18, y: 336.86, vistas: ['brasil'], esq: true,
      foto: 'images/t-2023-bioparque.jpg',
      alt: { pt: 'Teatro lotado no Bioparque Pantanal', en: 'A full house at Bioparque Pantanal' },
      legenda: {
        pt: 'Bioparque Pantanal, Campo Grande. Encerramento do projeto “Cem anos de Semana de Arte Moderna em Terras Pantaneiras”, 2023.',
        en: 'Bioparque Pantanal, Campo Grande. Closing concert of the project “Cem anos de Semana de Arte Moderna em Terras Pantaneiras”, 2023.'
      },
      texto: {
        pt: 'Onde o Duo mora. Desde a estreia em Corumbá, em 2015, fez turnês inteiras pelo interior do estado, quase sempre com entrada gratuita e em parceria com a UFMS, a UEMS e o IFMS.',
        en: 'Home. Since the first concert in Corumbá in 2015 the duo has toured the state several times, mostly with free admission and in partnership with the public universities UFMS, UEMS and IFMS.'
      },
      cidades: ['Campo Grande', 'Corumbá', 'Três Lagoas', 'Dourados', 'Ponta Porã', 'Aquidauana', 'Coxim', 'Bonito', 'Naviraí', 'Nova Andradina', 'Chapadão do Sul', 'Paranaíba', 'São Gabriel do Oeste', 'Sidrolândia', 'Rochedo', 'Corguinho']
    },
    {
      id: 'rio', nome: 'Rio de Janeiro', pais: { pt: 'Brasil', en: 'Brazil' },
      x: 312.85, y: 343.26, vistas: ['brasil'],
      foto: 'images/t-2023-rio.jpg',
      alt: { pt: 'Ana Lúcia e Marcelo no Rio de Janeiro, com o Pão de Açúcar ao fundo', en: 'Ana Lúcia and Marcelo in Rio de Janeiro, with Sugarloaf Mountain behind them' },
      legenda: { pt: 'Rio de Janeiro, 2023.', en: 'Rio de Janeiro, 2023.' },
      texto: {
        pt: 'Em 2023 o Duo tocou no PEN Clube do Brasil, na criação do PEN Clube Centro-Oeste, e na Academia Brasileira de Letras, onde estreou uma obra de Marcelo Fernandes sobre poema de Carlos Nejar.',
        en: 'In 2023 the duo played at PEN Clube do Brasil, for the founding of PEN Clube Centro-Oeste, and at the Brazilian Academy of Letters, where they premiered a piece by Marcelo Fernandes on a poem by Carlos Nejar.'
      }
    },
    {
      id: 'sp', nome: 'São Paulo', pais: { pt: 'Brasil', en: 'Brazil' },
      x: 304.18, y: 344.96, vistas: ['brasil'], esq: true,
      foto: 'images/t-2023-saopaulo.jpg',
      alt: { pt: 'Palco iluminado em azul no Memorial da América Latina', en: 'Stage lit in blue at the Memorial da América Latina' },
      legenda: { pt: 'Memorial da América Latina, São Paulo.', en: 'Memorial da América Latina, São Paulo.' },
      texto: {
        pt: 'Setembro de 2023. O Duo abriu o VIII IFLAC World Brazil Peace Congress, no Memorial da América Latina, com o violinista Heitor Lotti como convidado. Em maio de 2026, voltou ao Memorial para o Ato Comemorativo da Independência do Paraguai.',
        en: 'September 2023. The duo opened the 8th IFLAC World Brazil Peace Congress at the Memorial da América Latina, with violinist Heitor Lotti as guest. In May 2026 they returned to the Memorial for the ceremony marking Paraguay’s Independence Day.'
      }
    },
    {
      id: 'br', nome: { pt: 'Brasil', en: 'Brazil' }, pais: { pt: 'Brasil', en: 'Brazil' },
      x: 292, y: 341, vistas: ['mundo'], aproxima: 'brasil', esq: true
    },
    {
      id: 'europa', nome: { pt: 'Europa', en: 'Europe' }, pais: { pt: 'Europa', en: 'Europe' },
      x: 434, y: 160, vistas: ['mundo'], aproxima: 'europa'
    },
    {
      id: 'aveiro', nome: 'Aveiro', pais: 'Portugal',
      x: 399.28, y: 177.18, vistas: ['europa'],
      foto: 'images/t-2024-aveiro.jpg',
      alt: { pt: 'O Duo diante da talha dourada da Igreja das Carmelitas, em Aveiro', en: 'The duo in front of the gilded woodwork of the Igreja das Carmelitas, Aveiro' },
      legenda: { pt: 'Igreja das Carmelitas, Aveiro.', en: 'Igreja das Carmelitas, Aveiro.' },
      texto: {
        pt: 'Novembro de 2024. A convite dos Festivais de Outono da Universidade de Aveiro, o Duo tocou na Igreja das Carmelitas canções europeias e brasileiras, entre elas composições de Marcelo Fernandes.',
        en: 'November 2024. Invited by the University of Aveiro’s autumn festival, the duo played European and Brazilian songs at the Igreja das Carmelitas, including pieces by Marcelo Fernandes.'
      }
    },
    {
      id: 'nepomuk', nome: 'Nepomuk', pais: { pt: 'República Tcheca', en: 'Czech Republic' },
      x: 454.97, y: 149.75, vistas: ['europa'],
      foto: 'images/t-2024-nepomuk.jpg',
      alt: { pt: 'Marcelo com o violão no salão do Svatojánské Muzeum', en: 'Marcelo with his guitar in the hall of the Svatojánské Muzeum' },
      legenda: { pt: 'Svatojánské Muzeum, Nepomuk.', en: 'Svatojánské Muzeum, Nepomuk.' },
      texto: {
        pt: 'Novembro de 2024, na programação cultural do Svatojánské Muzeum, na mesma viagem que levou o Duo a Portugal.',
        en: 'November 2024, as part of the Svatojánské Muzeum’s cultural programme, on the same trip that took the duo to Portugal.'
      }
    },
    {
      id: 'suica', nome: { pt: 'Berna', en: 'Bern' }, pais: { pt: 'Suíça', en: 'Switzerland' },
      x: 439.6, y: 157.88, vistas: ['europa'],
      foto: 'images/t-2025-bern.jpg',
      alt: { pt: 'Plateia sentada no salão da residência da Embaixadora do Brasil em Berna', en: 'Audience seated in the hall of the Brazilian Ambassador’s residence in Bern' },
      legenda: { pt: 'Residência da Embaixadora do Brasil, Berna.', en: 'Residence of the Brazilian Ambassador, Bern.' },
      texto: {
        pt: 'Março de 2025, na residência da Embaixadora do Brasil, para uma plateia de embaixadores de vários países. Na mesma turnê, Marcelo Fernandes fez um recital solo no Conservatório de Winterthur.',
        en: 'March 2025, at the residence of the Brazilian Ambassador, for an audience of ambassadors from several countries. On the same tour Marcelo Fernandes gave a solo recital at the Winterthur Conservatory.'
      }
    },
    {
      id: 'paris', nome: 'Paris', pais: { pt: 'França', en: 'France' },
      x: 426.84, y: 151.79, vistas: ['europa'],
      foto: 'images/t-2025-paris.jpg',
      alt: { pt: 'Cartaz do recital do Duo Amábile na Université Sorbonne Nouvelle', en: 'Poster for the Duo Amábile recital at the Université Sorbonne Nouvelle' },
      legenda: { pt: 'Recital na Université Sorbonne Nouvelle, abril de 2025.', en: 'Recital at the Université Sorbonne Nouvelle, April 2025.' },
      texto: {
        pt: 'Abril de 2025. No programa, canções inéditas de Marcelo Fernandes, algumas em nheengatu, língua indígena da Amazônia, e obras de Otto Pintiaski.',
        en: 'April 2025. The programme had new songs by Marcelo Fernandes, some in Nheengatu, an Indigenous language of the Amazon, and works by Otto Pintiaski.'
      },
      cidades: ['Maison de l’Amérique Latine', 'Université Sorbonne Nouvelle']
    },
    {
      id: 'umbria', nome: { pt: 'Todi e Deruta', en: 'Todi and Deruta' }, pais: { pt: 'Itália', en: 'Italy' },
      x: 452.03, y: 170.46, vistas: ['europa'],
      foto: 'images/t-2025-todi.jpg',
      alt: { pt: 'O Duo se apresentando ao ar livre em Todi, à noite', en: 'The duo performing outdoors at night in Todi' },
      legenda: { pt: 'Festival “Suoni dal legno”, Todi.', en: '“Suoni dal legno” festival, Todi.' },
      texto: { pt: 'Julho de 2025, na Úmbria.', en: 'July 2025, in Umbria.' },
      cidades: [
        { pt: 'Todi, festival “Suoni dal legno”', en: 'Todi, “Suoni dal legno” festival' },
        'Deruta, Museo Regionale della Ceramica'
      ]
    }
  ];

  /* ---- monta o SVG ------------------------------------------------------ */

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'mapa__svg');
  svg.setAttribute('viewBox', CAIXA.x + ' ' + CAIXA.y + ' ' + CAIXA.w + ' ' + CAIXA.h);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', PT
    ? 'Mapa-múndi com os países onde o Duo Amábile e Marcelo Fernandes se apresentaram'
    : 'World map showing the countries where Duo Amábile and Marcelo Fernandes have performed');

  var grupo = document.createElementNS(NS, 'g');
  grupo.setAttribute('class', 'mapa__grupo');

  Object.keys(window.MAPA_PAISES).forEach(function (cod) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', window.MAPA_PAISES[cod]);
    p.setAttribute('data-pais', cod);
    var classe = 'pais';
    if (PAISES_DUO.indexOf(cod) !== -1) classe += ' duo';
    else if (PAISES_SOLO.indexOf(cod) !== -1) classe += ' solo';
    p.setAttribute('class', classe);
    grupo.appendChild(p);
  });

  svg.appendChild(grupo);
  tela.appendChild(svg);

  var camadaPinos = document.createElement('div');
  camadaPinos.className = 'mapa__pinos';
  tela.appendChild(camadaPinos);

  /* ---- os pinos -------------------------------------------------------- */

  var pinos = LUGARES.map(function (lugar) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pino';
    b.innerHTML = '<span class="pino__nota"></span><span class="pino__nome"></span>';
    b.querySelector('.pino__nome').textContent = L(lugar.nome);
    b.setAttribute('aria-label', lugar.aproxima
      ? (PT ? 'Aproximar o mapa em ' : 'Zoom in on ') + L(lugar.nome)
      : (PT ? 'Ver os concertos em ' : 'See the concerts in ') + L(lugar.nome) + ', ' + L(lugar.pais));
    b.addEventListener('click', function () {
      if (lugar.aproxima) { mudarVista(lugar.aproxima); return; }
      abrirFicha(lugar, b);
    });
    camadaPinos.appendChild(b);
    return { el: b, lugar: lugar };
  });

  /* ---- vistas ---------------------------------------------------------- */

  var vistaAtual = 'mundo';

  function transformacaoDa(vista) {
    var v = VISTAS[vista];
    var s = CAIXA.w / v.w;
    return { s: s, tx: CAIXA.x - s * v.x, ty: CAIXA.y - s * v.y };
  }

  function posicionarPinos() {
    var t = transformacaoDa(vistaAtual);
    var largura = svg.getBoundingClientRect().width || tela.clientWidth;
    if (!largura) return;
    var ppu = largura / CAIXA.w;

    pinos.forEach(function (p) {
      var px = (t.tx + t.s * p.lugar.x - CAIXA.x) * ppu;
      var py = (t.ty + t.s * p.lugar.y - CAIXA.y) * ppu;
      p.el.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px)';
      // o rótulo troca de lado perto da borda direita, ou quando o lugar pede
      // (é assim que São Paulo e Rio de Janeiro não escrevem um por cima do outro)
      p.el.classList.toggle('pino--esq', p.lugar.esq === true || px > largura * 0.62);
    });
  }

  var aparecer;

  function mudarVista(vista) {
    if (!VISTAS[vista]) return;
    vistaAtual = vista;

    var t = transformacaoDa(vista);
    grupo.style.transform = 'translate(' + t.tx.toFixed(1) + 'px,' + t.ty.toFixed(1) + 'px) scale(' + t.s.toFixed(4) + ')';

    botoes.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.vista === vista));
    });

    // some com os que saem já; os que entram aparecem quando o zoom assenta
    clearTimeout(aparecer);
    pinos.forEach(function (p) {
      if (p.lugar.vistas.indexOf(vista) === -1) p.el.hidden = true;
    });
    posicionarPinos();
    aparecer = setTimeout(function () {
      pinos.forEach(function (p) {
        if (p.lugar.vistas.indexOf(vistaAtual) !== -1) p.el.hidden = false;
      });
      posicionarPinos();
    }, 320);
  }

  var botoes = Array.prototype.slice.call(document.querySelectorAll('.mapa__ctrl button'));
  botoes.forEach(function (b) {
    b.addEventListener('click', function () { mudarVista(b.dataset.vista); });
  });

  /* ---- a ficha --------------------------------------------------------- */

  function texto(tag, classe, conteudo) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    el.textContent = conteudo;
    return el;
  }

  function abrirFicha(lugar, botao) {
    pinos.forEach(function (p) { p.el.classList.toggle('is-ativo', p.el === botao); });

    ficha.textContent = '';

    if (lugar.foto) {
      var img = document.createElement('img');
      img.src = RAIZ + lugar.foto;
      img.alt = L(lugar.alt) || '';
      img.loading = 'lazy';
      ficha.appendChild(img);
    }

    ficha.appendChild(texto('h3', null, L(lugar.nome)));
    ficha.appendChild(texto('p', 'pais', L(lugar.pais)));
    if (lugar.texto) ficha.appendChild(texto('p', null, L(lugar.texto)));

    if (lugar.cidades) {
      var ul = document.createElement('ul');
      lugar.cidades.forEach(function (c) { ul.appendChild(texto('li', null, L(c))); });
      ficha.appendChild(ul);
    }

    if (lugar.legenda) {
      var leg = texto('p', 'vazio', L(lugar.legenda));
      leg.style.marginTop = '16px';
      ficha.appendChild(leg);
    }
  }

  /* ---- ligar ----------------------------------------------------------- */

  mudarVista('mundo');
  pinos.forEach(function (p) { p.el.hidden = p.lugar.vistas.indexOf('mundo') === -1; });
  posicionarPinos();

  var remedir;
  window.addEventListener('resize', function () {
    clearTimeout(remedir);
    remedir = setTimeout(posicionarPinos, 120);
  });
  window.addEventListener('load', posicionarPinos);
})();
