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

  var LUGARES = [
    {
      id: 'ms', nome: 'Mato Grosso do Sul', pais: 'Brasil',
      x: 284.18, y: 336.86, vistas: ['brasil'], esq: true,
      foto: 'images/t-2023-bioparque.jpg',
      alt: 'Teatro lotado no Bioparque Pantanal',
      legenda: 'Bioparque Pantanal, Campo Grande — encerramento do projeto “100 anos de Semana de Arte Moderna em Terras Pantaneiras”, 2023.',
      texto: 'A casa do Duo. Desde a estreia em Corumbá, em 2015, foram temporadas inteiras pelo interior do estado — quase sempre de graça, em parceria com a UFMS, a UEMS e o IFMS.',
      cidades: ['Campo Grande', 'Corumbá', 'Três Lagoas', 'Dourados', 'Ponta Porã', 'Aquidauana', 'Coxim', 'Bonito', 'Naviraí', 'Nova Andradina', 'Chapadão do Sul', 'Paranaíba', 'São Gabriel do Oeste', 'Sidrolândia', 'Rochedo', 'Corguinho']
    },
    {
      id: 'rio', nome: 'Rio de Janeiro', pais: 'Brasil',
      x: 312.85, y: 343.26, vistas: ['brasil'],
      foto: 'images/t-2023-rio.jpg',
      alt: 'Ana Lúcia e Marcelo no Rio de Janeiro, com o Pão de Açúcar ao fundo',
      legenda: 'Rio de Janeiro, 2023.',
      texto: 'Em 2023 o Duo tocou na sede do PEN Clube do Brasil, na instauração do PEN Clube Centro-Oeste, e na Academia Brasileira de Letras — estreando obra de Marcelo Fernandes sobre poema de Carlos Nejar.'
    },
    {
      id: 'sp', nome: 'São Paulo', pais: 'Brasil',
      x: 304.18, y: 344.96, vistas: ['brasil'], esq: true,
      foto: 'images/t-2023-saopaulo.jpg',
      alt: 'Palco iluminado em azul no Memorial da América Latina',
      legenda: 'Memorial da América Latina, São Paulo.',
      texto: 'Setembro de 2023: abertura do VIII IFLAC World Brazil — Peace Congress, no Memorial da América Latina, com participação do violinista Heitor Lotti.'
    },
    {
      id: 'br', nome: 'Brasil', pais: 'Brasil',
      x: 292, y: 341, vistas: ['mundo'], aproxima: 'brasil', esq: true
    },
    {
      id: 'europa', nome: 'Europa', pais: 'Europa',
      x: 434, y: 160, vistas: ['mundo'], aproxima: 'europa'
    },
    {
      id: 'aveiro', nome: 'Aveiro', pais: 'Portugal',
      x: 399.28, y: 177.18, vistas: ['europa'],
      foto: 'images/t-2024-aveiro.jpg',
      alt: 'O Duo diante da talha dourada da Igreja das Carmelitas, em Aveiro',
      legenda: 'Igreja das Carmelitas, Aveiro.',
      texto: 'Novembro de 2024. Convidados dos Festivais de Outono da Universidade de Aveiro, tocaram na Igreja das Carmelitas: canções europeias e brasileiras, incluindo composições de Marcelo Fernandes.'
    },
    {
      id: 'nepomuk', nome: 'Nepomuk', pais: 'República Tcheca',
      x: 454.97, y: 149.75, vistas: ['europa'],
      foto: 'images/t-2024-nepomuk.jpg',
      alt: 'Marcelo com o violão no salão do Svatojánské Muzeum',
      legenda: 'Svatojánské Muzeum, Nepomuk.',
      texto: 'Novembro de 2024, dentro da agenda cultural do tradicional Svatojánské Muzeum — na mesma viagem que levou o Duo a Portugal.'
    },
    {
      id: 'suica', nome: 'Berna', pais: 'Suíça',
      x: 439.6, y: 157.88, vistas: ['europa'],
      foto: 'images/t-2025-bern.jpg',
      alt: 'Plateia sentada no salão da residência da Embaixadora do Brasil em Berna',
      legenda: 'Casa da Embaixadora do Brasil, Berna.',
      texto: 'Março de 2025, na casa da Embaixadora do Brasil, diante de embaixadores de vários países. Na mesma turnê, Marcelo Fernandes fez um recital solo no Conservatório de Winterthur.'
    },
    {
      id: 'paris', nome: 'Paris', pais: 'França',
      x: 426.84, y: 151.79, vistas: ['europa'],
      foto: 'images/t-2025-paris.jpg',
      alt: 'Cartaz do recital do Duo Amábile na Université Sorbonne Nouvelle',
      legenda: 'Recital na Université Sorbonne Nouvelle, abril de 2025.',
      texto: 'Abril de 2025. No programa, canções inéditas de Marcelo Fernandes — algumas na língua indígena nheengatu — e obras de Otto Pintiaski.',
      cidades: ['Maison de l’Amérique Latine', 'Université Sorbonne Nouvelle']
    },
    {
      id: 'umbria', nome: 'Todi e Deruta', pais: 'Itália',
      x: 452.03, y: 170.46, vistas: ['europa'],
      foto: 'images/t-2025-todi.jpg',
      alt: 'O Duo se apresentando ao ar livre em Todi, à noite',
      legenda: 'Festival “Suoni dal legno”, Todi.',
      texto: 'Julho de 2025, na região da Umbria.',
      cidades: ['Todi — festival “Suoni dal legno”', 'Deruta — Museo Regionale della Ceramica']
    }
  ];

  /* ---- monta o SVG ------------------------------------------------------ */

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'mapa__svg');
  svg.setAttribute('viewBox', CAIXA.x + ' ' + CAIXA.y + ' ' + CAIXA.w + ' ' + CAIXA.h);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Mapa-múndi com os países onde o Duo Amábile e Marcelo Fernandes se apresentaram');

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
    b.querySelector('.pino__nome').textContent = lugar.nome;
    b.setAttribute('aria-label', lugar.aproxima
      ? 'Aproximar o mapa em ' + lugar.nome
      : 'Ver os concertos em ' + lugar.nome + ', ' + lugar.pais);
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
      img.src = lugar.foto;
      img.alt = lugar.alt || '';
      img.loading = 'lazy';
      ficha.appendChild(img);
    }

    ficha.appendChild(texto('p', 'pais', lugar.pais));
    ficha.appendChild(texto('h3', null, lugar.nome));
    if (lugar.texto) ficha.appendChild(texto('p', null, lugar.texto));

    if (lugar.cidades) {
      var ul = document.createElement('ul');
      lugar.cidades.forEach(function (c) { ul.appendChild(texto('li', null, c)); });
      ficha.appendChild(ul);
    }

    if (lugar.legenda) {
      var leg = texto('p', 'vazio', lugar.legenda);
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
