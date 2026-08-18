/* ==========================================================================
   DUO AMÁBILE — comportamento

   1. Revelação no scroll (discreta: opacidade e 12 px)
   2. Navegação: menu no celular, link ativo, cabeçalho preso
   3. Carrossel da imprensa
   4. Índice do currículo, nas páginas de intérprete
   5. Hub de vídeos
   6. Gravuras: o disco de pauta e o violão
   7. Notas flutuantes da trajetória
   8. Régua de leitura
   9. Miudezas

   Nada aqui é decorativo: o site funciona inteiro sem JavaScript, só sem as
   transições e sem os botões do carrossel — que continua rolando com o dedo.
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     1. REVELAÇÃO NO SCROLL
     ====================================================================== */

  var aRevelar = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-vista');
          olho.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    aRevelar.forEach(function (el) { olho.observe(el); });
  } else {
    aRevelar.forEach(function (el) { el.classList.add('is-vista'); });
  }

  /* ======================================================================
     2. NAVEGAÇÃO
     ====================================================================== */

  var topo   = document.getElementById('topo');
  var nav    = document.getElementById('nav');
  var burger = document.getElementById('hamburguer');

  if (nav && burger) {
    var fecharMenu = function () {
      nav.classList.remove('is-aberto');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
    };

    burger.addEventListener('click', function () {
      var aberto = nav.classList.toggle('is-aberto');
      burger.setAttribute('aria-expanded', String(aberto));
      burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fecharMenu); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-aberto')) {
        fecharMenu();
        burger.focus();
      }
    });
  }

  if (topo) {
    window.addEventListener('scroll', function () {
      topo.classList.toggle('is-preso', window.scrollY > 8);
    }, { passive: true });
  }

  // link do menu aceso conforme a seção visível
  var comId = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var links = {};
  if (nav) {
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
  }

  if ('IntersectionObserver' in window && comId.length) {
    var vistas = new Set();
    var espia = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) vistas.add(e.target.id); else vistas.delete(e.target.id);
      });
      var atual = comId.filter(function (s) { return vistas.has(s.id); })[0];
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle('is-atual', !!atual && atual.id === id);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    comId.forEach(function (s) { espia.observe(s); });
  }

  /* ======================================================================
     3. CARROSSEL DA IMPRENSA
     A rolagem é nativa (dedo, trackpad, teclado). Os botões só empurram o
     trilho um cartão para cada lado e se apagam quando chegam ao fim.
     ====================================================================== */

  var trilho  = document.getElementById('trilhoImprensa');
  var recuar  = document.getElementById('recuar');
  var avancar = document.getElementById('avancar');

  if (trilho && recuar && avancar) {
    var passo = function () {
      var cartao = trilho.querySelector('.recorte');
      if (!cartao) return trilho.clientWidth * 0.8;
      var vao = parseFloat(getComputedStyle(trilho).columnGap) || 20;
      return cartao.getBoundingClientRect().width + vao;
    };

    var conferirPontas = function () {
      var fim = trilho.scrollWidth - trilho.clientWidth;
      recuar.disabled  = trilho.scrollLeft <= 2;
      avancar.disabled = trilho.scrollLeft >= fim - 2;
    };

    recuar.addEventListener('click', function () {
      trilho.scrollBy({ left: -passo(), behavior: 'smooth' });
    });
    avancar.addEventListener('click', function () {
      trilho.scrollBy({ left: passo(), behavior: 'smooth' });
    });

    trilho.addEventListener('scroll', conferirPontas, { passive: true });
    window.addEventListener('resize', conferirPontas);
    conferirPontas();
  }

  /* ======================================================================
     4. ÍNDICE DO CURRÍCULO
     Acende o item do bloco que está sendo lido. Só existe nas páginas de
     intérprete; nas outras, o seletor não encontra nada e nada acontece.
     ====================================================================== */

  var indice = document.querySelector('.indice');
  if (indice && 'IntersectionObserver' in window) {
    var blocos = Array.prototype.slice.call(document.querySelectorAll('.cv__bloco[id]'));
    var itens = {};
    indice.querySelectorAll('a[href^="#"]').forEach(function (a) {
      itens[a.getAttribute('href').slice(1)] = a;
    });

    if (blocos.length) {
      var lidos = new Set();
      var leitor = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) lidos.add(e.target.id); else lidos.delete(e.target.id);
        });
        var atual = blocos.filter(function (b) { return lidos.has(b.id); })[0];
        Object.keys(itens).forEach(function (id) {
          itens[id].classList.toggle('is-atual', !!atual && atual.id === id);
        });
      }, { rootMargin: '-15% 0px -70% 0px' });

      blocos.forEach(function (b) { leitor.observe(b); });
    }
  }

  /* ======================================================================
     5. HUB DE VÍDEOS

     O quadro começa com a miniatura e um botão. Só quando alguém clica é que
     o iframe do YouTube entra na página — antes disso o site não conversa
     com o Google, e não paga o peso do player.
     ====================================================================== */

  var palco = document.querySelector('[data-palco]');

  if (palco) {
    var quadro  = palco.querySelector('.palco__quadro');
    var fichaEl = {
      obra:    palco.querySelector('[data-ficha="obra"]'),
      credito: palco.querySelector('[data-ficha="credito"]'),
      onde:    palco.querySelector('[data-ficha="onde"]'),
      link:    palco.querySelector('[data-ficha="link"]')
    };
    var faixas = Array.prototype.slice.call(document.querySelectorAll('.faixa-item'));

    // a miniatura de melhor resolução nem sempre existe; caindo, usa a padrão
    var comReserva = function (img, id) {
      img.addEventListener('error', function aoFalhar() {
        img.removeEventListener('error', aoFalhar);
        img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
      });
    };

    var montarCartaz = function (item) {
      var id = item.getAttribute('data-video');

      quadro.innerHTML = '';

      var img = document.createElement('img');
      img.width = 1280; img.height = 720; img.loading = 'lazy';
      img.alt = 'Miniatura do vídeo “' + item.getAttribute('data-obra') + '”';
      comReserva(img, id);
      img.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';

      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'palco__toca';
      botao.setAttribute('aria-label', 'Assistir a “' + item.getAttribute('data-obra') + '”');
      botao.innerHTML =
        '<span class="palco__botao">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>' +
        '</span>';
      botao.addEventListener('click', function () { tocar(id, item); });

      quadro.appendChild(img);
      quadro.appendChild(botao);
    };

    // youtube.com/embed, e não youtube-nocookie.com: o domínio nocookie é
    // bloqueado por várias extensões de privacidade, e o resultado é um quadro
    // preto que não faz nada. O escape abaixo cobre o caso de o embed falhar
    // mesmo assim — em vez do quadro preto, um convite para abrir no YouTube.
    var tocar = function (id, item) {
      quadro.innerHTML = '';

      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      iframe.title = item.getAttribute('data-obra') + ' — Duo Amábile';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.setAttribute('allowfullscreen', '');
      quadro.appendChild(iframe);

      var escape = document.createElement('a');
      escape.className = 'palco__escape';
      escape.href = 'https://www.youtube.com/watch?v=' + id;
      escape.target = '_blank';
      escape.rel = 'noopener';
      escape.textContent = 'Não carregou? Abrir no YouTube';
      quadro.appendChild(escape);

      // se em 3,5 s o player não tiver pintado nada, mostra o escape
      var relogio = setTimeout(function () { quadro.classList.add('is-travado'); }, 3500);
      iframe.addEventListener('load', function () { clearTimeout(relogio); });
    };

    var escolher = function (item, tocarJa) {
      var id = item.getAttribute('data-video');

      faixas.forEach(function (f) {
        f.setAttribute('aria-current', String(f === item));
      });

      fichaEl.obra.textContent    = item.getAttribute('data-obra');
      fichaEl.credito.textContent = item.getAttribute('data-credito');
      fichaEl.onde.textContent    = item.getAttribute('data-onde') || '';
      fichaEl.onde.hidden         = !item.getAttribute('data-onde');
      fichaEl.link.href           = 'https://www.youtube.com/watch?v=' + id;

      if (tocarJa) tocar(id, item); else montarCartaz(item);
    };

    faixas.forEach(function (item) {
      item.addEventListener('click', function () {
        // já escolhida: o clique repetido é um pedido para tocar
        escolher(item, item.getAttribute('aria-current') === 'true');
        if (window.matchMedia('(max-width:820px)').matches) {
          quadro.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
    });

    if (faixas.length) escolher(faixas[0], false);
  }

  /* ======================================================================
     6. GRAVURAS — O DISCO DE PAUTA

     Cinco linhas concêntricas: uma pauta dobrada em círculo. Quatro barras
     de compasso, dupla no começo, e as notas apoiadas nas linhas e nos
     espaços, com as hastes apontando para fora.

     É desenhado aqui, e não no HTML, para existir uma vez só e aparecer
     igual na abertura e na régua.
     ====================================================================== */

  var NS = 'http://www.w3.org/2000/svg';

  // ângulo em graus → ponto sobre o círculo de raio r
  var ponto = function (ang, r) {
    var t = (ang - 90) * Math.PI / 180;
    return [100 + r * Math.cos(t), 100 + r * Math.sin(t)];
  };

  var desenharDisco = function () {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    var traco = document.createElementNS(NS, 'g');
    traco.setAttribute('fill', 'none');
    traco.setAttribute('stroke', 'currentColor');
    traco.setAttribute('stroke-width', '1');

    // as cinco linhas da pauta
    [56, 62, 68, 74, 80].forEach(function (r) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', '100'); c.setAttribute('cy', '100'); c.setAttribute('r', String(r));
      traco.appendChild(c);
    });

    // barras de compasso — dupla no ângulo 0, onde o cânone recomeça
    [[0, 2.6], [356, 1], [90, 1], [180, 1], [270, 1] ].forEach(function (b) {
      var a = ponto(b[0], 56), z = ponto(b[0], 80);
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', a[0].toFixed(2)); l.setAttribute('y1', a[1].toFixed(2));
      l.setAttribute('x2', z[0].toFixed(2)); l.setAttribute('y2', z[1].toFixed(2));
      l.setAttribute('stroke-width', String(b[1]));
      traco.appendChild(l);
    });

    svg.appendChild(traco);

    // as notas: [ângulo, raio]. Os raios são linhas (56…80) e espaços (59…77).
    var notas = [
      [10, 65], [30, 71], [50, 68], [70, 62],
      [100, 59], [120, 56], [140, 62], [160, 68],
      [190, 74], [210, 71], [230, 77], [250, 71],
      [280, 65], [300, 62], [320, 68], [340, 59]
    ];

    notas.forEach(function (n) {
      var ang = n[0], r = n[1];
      var p = ponto(ang, r);

      // haste, apontando para fora da pauta
      var a = ponto(ang, r + 4), z = ponto(ang, r + 21);
      var haste = document.createElementNS(NS, 'line');
      haste.setAttribute('x1', a[0].toFixed(2)); haste.setAttribute('y1', a[1].toFixed(2));
      haste.setAttribute('x2', z[0].toFixed(2)); haste.setAttribute('y2', z[1].toFixed(2));
      haste.setAttribute('stroke', 'currentColor');
      haste.setAttribute('stroke-width', '1');
      svg.appendChild(haste);

      // a cabeça, inclinada como a de uma semínima
      var cabeca = document.createElementNS(NS, 'ellipse');
      cabeca.setAttribute('cx', p[0].toFixed(2)); cabeca.setAttribute('cy', p[1].toFixed(2));
      cabeca.setAttribute('rx', '4.8'); cabeca.setAttribute('ry', '3.4');
      cabeca.setAttribute('fill', 'currentColor');
      cabeca.setAttribute('transform', 'rotate(' + (ang - 20) + ' ' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ')');
      svg.appendChild(cabeca);
    });

    return svg;
  };

  document.querySelectorAll('.disco').forEach(function (el) { el.appendChild(desenharDisco()); });

  /* --- o violão em fio único ---------------------------------------------
     Contorno de um violão clássico: caixa, braço, cabeça com as fendas,
     trastes, boca com as duas rosetas, cavalete e as seis cordas indo do
     cavalete à pestana. Nada é preenchido — é gravura, não ilustração.
     O recorte mostra do encaixe do braço para baixo.
     --------------------------------------------------------------------- */

  var VIOLAO =
    '<g transform="translate(0,-330)">' +
    '<path d="M210 382c90 0 140 50 140 120 0 60-28 98-28 150 0 60 66 100 66 180 0 100-68 180-178 180S32 932 32 832c0-80 66-120 66-180 0-52-28-90-28-150 0-70 50-120 140-120Z"/>' +
    '<path d="M180 382 187 96h46l7 286"/>' +
    '<path d="M187 96 180 20c0-8 6-12 14-12h32c8 0 14 4 14 12l-7 76"/>' +
    '<path d="M187 96h46"/>' +
    '<rect x="192" y="26" width="12" height="54" rx="6"/>' +
    '<rect x="216" y="26" width="12" height="54" rx="6"/>' +
    '<path d="M181 340h58M182 300h56M183 262h54M184 226h52M185 192h50M185 160h49M186 130h48" stroke-width="1.4"/>' +
    '<circle cx="210" cy="596" r="60"/>' +
    '<circle cx="210" cy="596" r="68" stroke-width="1.2"/>' +
    '<circle cx="210" cy="596" r="73" stroke-width="1.2"/>' +
    '<rect x="112" y="848" width="196" height="28" rx="4"/>' +
    '<path d="M112 862h196" stroke-width="1.2"/>' +
    '<path d="M170 862 191 96M186 862 199 96M202 862 206 96M218 862 214 96M234 862 222 96M250 862 229 96" stroke-width="1.1"/>' +
    '</g>';

  document.querySelectorAll('[data-violao]').forEach(function (el) {
    el.innerHTML =
      '<svg viewBox="0 0 420 700" fill="none" stroke="currentColor" stroke-width="2.2" ' +
      'stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">' +
      VIOLAO + '</svg>';
  });

  /* ======================================================================
     7. NOTAS FLUTUANTES DA TRAJETÓRIA

     A trajetória é a seção mais alta e mais vazia do site. As notas ocupam
     essa margem: nascem espalhadas pelos oito mil pixels da seção, vagam
     em todas as direções, quicam nas bordas e se afastam umas das outras.
     O cursor — ou o dedo — as empurra; o toque espalha.

     Duas coisas mantêm isso barato mesmo com mais de cem notas:

     - Só as que estão perto da tela são calculadas. As outras ficam
       congeladas onde estão, e ninguém vê a diferença.
     - Os blocos de texto viram campos circulares de exclusão, medidos uma
       vez a cada layout. A nota que entra num campo é devolvida para a
       borda dele na hora — atrás do texto elas nunca chegam a passar.

     A camada é `pointer-events:none`, então nada aqui rouba o clique de um
     link da trajetória.
     ====================================================================== */

  var caixaNotas = document.querySelector('[data-notas]');
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (caixaNotas) {
    // os quatro desenhos, em caixa de 44 x 62
    var FIGURAS = [
      // seminima
      '<ellipse cx="13" cy="50" rx="8.4" ry="5.9" transform="rotate(-20 13 50)"/>' +
      '<path d="M21.4 46.6V9" stroke-width="2.9" stroke-linecap="round"/>',
      // colcheia
      '<ellipse cx="13" cy="50" rx="8.4" ry="5.9" transform="rotate(-20 13 50)"/>' +
      '<path d="M21.4 46.6V9" stroke-width="2.9" stroke-linecap="round"/>' +
      '<path d="M21.4 9c9.6 4.6 12.6 11 8.4 20 2.6-9.4-.6-14.4-8.4-15.6Z" class="cheia"/>',
      // minima, de cabeca vazada
      '<ellipse cx="13" cy="50" rx="8.4" ry="5.9" transform="rotate(-20 13 50)" ' +
      'fill="none" stroke-width="3"/>' +
      '<path d="M21.4 46.6V9" stroke-width="2.9" stroke-linecap="round"/>',
      // duas colcheias sob a mesma barra
      '<ellipse cx="11" cy="52" rx="7.6" ry="5.3" transform="rotate(-20 11 52)"/>' +
      '<ellipse cx="34" cy="46" rx="7.6" ry="5.3" transform="rotate(-20 34 46)"/>' +
      '<path d="M18.5 49V13M41.5 43V7" stroke-width="2.7" stroke-linecap="round"/>' +
      '<path d="M17.4 13 42.6 7v6l-25.2 6Z" class="cheia"/>'
    ];

    var RAIO     = 190;    // alcance do ponteiro, em px
    var EMPURRAO = 2600;   // forca do ponteiro
    var TOQUE    = 9000;   // forca do clique ou toque
    var VMAX     = 170;    // px por segundo
    var VMIN     = 48;
    var FOLGA    = 20;     // respiro em volta do texto (menor no celular)
    var BORDA    = 700;    // quanto alem da tela ainda se calcula

    var secaoNotas = caixaNotas.parentElement;

    var notas = [], zonas = [];
    var larg = 0, alt = 0, topoSecao = 0;
    var mx = -99999, my = -99999;
    var rodando = false, naTela = false, ultimo = 0;

    /* --- os campos de exclusão -------------------------------------------
       Cada bloco de texto vira uma fila de círculos ao longo do seu lado
       maior. Como eles se sobrepõem, a união não tem cantos: é um campo
       arredondado, e não a divisória retangular do elemento.
       ------------------------------------------------------------------- */
    var medirZonas = function () {
      zonas = [];
      var folga = larg < 760 ? 9 : FOLGA;
      var base = secaoNotas.getBoundingClientRect();
      var alvos = secaoNotas.querySelectorAll(
        '.cab__in > div, .marco__ano, .marco__cabeca, ' +
        '.marco__corpo > div > p, .marco__foto figcaption'
      );

      alvos.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;

        var x = r.left - base.left, y = r.top - base.top;
        var raio = Math.min(r.width, r.height) / 2 + folga;
        var cx, cy;

        if (r.width >= r.height) {
          var passoX = Math.max(12, raio * 0.85);
          for (cx = x + r.height / 2; cx < x + r.width - r.height / 2 + passoX; cx += passoX) {
            zonas.push({ x: Math.min(cx, x + r.width - r.height / 2), y: y + r.height / 2, r: raio });
          }
        } else {
          var passoY = Math.max(12, raio * 0.85);
          for (cy = y + r.width / 2; cy < y + r.height - r.width / 2 + passoY; cy += passoY) {
            zonas.push({ x: x + r.width / 2, y: Math.min(cy, y + r.height - r.width / 2), r: raio });
          }
        }
      });

      zonas.sort(function (a, b) { return a.y - b.y; });
    };

    /* Devolve a nota para fora de qualquer campo em que tenha entrado.

       Em várias passadas: onde dois campos se sobrepõem, a correção de um
       pode empurrar a nota para dentro do outro, e uma passada só deixaria
       notas presas atrás do texto. Três resolvem na prática. */
    var desviarDoTexto = function (n) {
      for (var passada = 0; passada < 3; passada++) desviarUmaVez(n);

      /* Última saída. No celular o texto ocupa quase toda a largura, e sobra
         vão mais estreito que a nota: ela fica entalada entre dois campos e
         as passadas acima empatam. Aqui ela é jogada para fora pelo lado de
         cima ou de baixo — o vão entre um marco e o seguinte sempre cabe. */
      var preso = zonaDe(n);
      if (!preso) return;

      var limite = preso.r + n.r;
      var acima = preso.y - limite, abaixo = preso.y + limite;
      n.y = (Math.abs(n.y - acima) < Math.abs(n.y - abaixo)) ? acima : abaixo;
      n.vy = -n.vy;
      desviarUmaVez(n);
    };

    // o campo em que a nota está enfiada, se houver
    var zonaDe = function (n) {
      for (var i = 0; i < zonas.length; i++) {
        var z = zonas[i];
        if (z.y < n.y - 1200) continue;
        if (z.y > n.y + 1200) break;
        var limite = z.r + n.r;
        if (Math.abs(n.x - z.x) > limite || Math.abs(n.y - z.y) > limite) continue;
        if (Math.hypot(n.x - z.x, n.y - z.y) < limite - 0.5) return z;
      }
      return null;
    };

    var desviarUmaVez = function (n) {
      for (var i = 0; i < zonas.length; i++) {
        var z = zonas[i];
        if (z.y < n.y - 1200) continue;
        if (z.y > n.y + 1200) break;

        var dx = n.x - z.x, dy = n.y - z.y;
        var limite = z.r + n.r;
        if (Math.abs(dx) > limite || Math.abs(dy) > limite) continue;

        var d = Math.hypot(dx, dy);
        if (d >= limite) continue;

        if (d < 0.01) { dx = 1; dy = 0; d = 1; }
        n.x = z.x + (dx / d) * limite;
        n.y = z.y + (dy / d) * limite;

        // sai deslizando pela borda, em vez de bater e voltar
        var radial = (n.vx * dx + n.vy * dy) / d;
        if (radial < 0) {
          n.vx -= 1.7 * radial * (dx / d);
          n.vy -= 1.7 * radial * (dy / d);
        }
      }
    };

    var criar = function (quantas) {
      caixaNotas.innerHTML = '';
      notas = [];
      for (var i = 0; i < quantas; i++) {
        var el = document.createElement('span');
        el.className = 'nota';
        // No celular o texto ocupa quase toda a largura. Nota grande não cabe
        // nos vãos e acaba espremida por cima da leitura; miúda, cabe.
        var escala = larg < 760
          ? 0.30 + Math.random() * 0.26
          : 0.45 + Math.random() * 0.65;
        el.innerHTML =
          '<svg viewBox="0 0 44 62" fill="currentColor" stroke="currentColor" ' +
          'focusable="false" aria-hidden="true">' +
          FIGURAS[Math.floor(Math.random() * FIGURAS.length)] + '</svg>';
        el.style.width = (36 * escala).toFixed(1) + 'px';
        caixaNotas.appendChild(el);

        var ang = Math.random() * Math.PI * 2;
        var vel = VMIN + Math.random() * (VMAX - VMIN) * 0.7;
        notas.push({
          el: el, r: 27 * escala,
          x: 0, y: 0,
          vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
          giro: Math.random() * 360,
          vgiro: (Math.random() - 0.5) * 26
        });
      }
    };

    /* Distribui em grade embaralhada, e não a esmo: com posições puramente
       aleatórias a seção de oito mil pixels ficava com trechos lotados e
       trechos vazios. Cada nota sorteia dentro da sua célula, e repete o
       sorteio ate cair fora dos campos de texto. */
    var espalhar = function () {
      var quantas = notas.length;
      var colunas = Math.max(1, Math.round(Math.sqrt(quantas * larg / Math.max(1, alt))));
      var linhas  = Math.ceil(quantas / colunas);
      var lc = larg / colunas, ll = alt / linhas;

      notas.forEach(function (n, i) {
        var c = i % colunas, l = Math.floor(i / colunas);
        for (var t = 0; t < 14; t++) {
          n.x = Math.min(Math.max(n.r, (c + Math.random()) * lc), larg - n.r);
          n.y = Math.min(Math.max(n.r, (l + Math.random()) * ll), alt - n.r);
          var livre = true;
          for (var j = 0; j < zonas.length; j++) {
            var z = zonas[j];
            if (Math.abs(z.y - n.y) > z.r + n.r) continue;
            if (Math.hypot(n.x - z.x, n.y - z.y) < z.r + n.r) { livre = false; break; }
          }
          if (livre) break;
        }
      });
    };

    var lugar = function (n) {
      return 'translate3d(' + (n.x - n.r).toFixed(1) + 'px,' + (n.y - n.r).toFixed(1) + 'px,0)' +
             ' rotate(' + n.giro.toFixed(1) + 'deg)';
    };

    var pintar = function () {
      notas.forEach(function (n) { n.el.style.transform = lugar(n); });
    };

    var animar = function (agora) {
      if (!rodando) return;
      var dt = Math.min(0.05, (agora - ultimo) / 1000 || 0.016);
      ultimo = agora;

      // a faixa da seção que vale calcular, em coordenadas da própria seção
      var de  = window.scrollY - topoSecao - BORDA;
      var ate = de + window.innerHeight + BORDA * 2;

      var vivas = [], a, b, n, o;
      for (a = 0; a < notas.length; a++) {
        if (notas[a].y > de && notas[a].y < ate) vivas.push(notas[a]);
      }

      for (a = 0; a < vivas.length; a++) {
        n = vivas[a];

        // o ponteiro empurra, e a força cresce quanto mais perto ele está
        var dx = n.x - mx, dy = n.y - my;
        var d = Math.hypot(dx, dy);
        if (d < RAIO && d > 0.01) {
          var f = 1 - d / RAIO;
          n.vx += (dx / d) * f * f * EMPURRAO * dt;
          n.vy += (dy / d) * f * f * EMPURRAO * dt;
        }

        // e uma da outra, para nunca se encostarem
        for (b = a + 1; b < vivas.length; b++) {
          o = vivas[b];
          var ex = n.x - o.x, ey = n.y - o.y;
          var minimo = n.r + o.r + 2;
          if (Math.abs(ex) > minimo || Math.abs(ey) > minimo) continue;
          var dv = Math.hypot(ex, ey);
          if (dv < minimo && dv > 0.01) {
            var g = (minimo - dv) / minimo * 260 * dt;
            n.vx += (ex / dv) * g; n.vy += (ey / dv) * g;
            o.vx -= (ex / dv) * g; o.vy -= (ey / dv) * g;
          }
        }

        n.vx *= 0.995; n.vy *= 0.995;

        // nem paradas nem em disparada
        var v = Math.hypot(n.vx, n.vy);
        if (v > VMAX) { n.vx = n.vx / v * VMAX; n.vy = n.vy / v * VMAX; }
        else if (v < VMIN) {
          var t = Math.random() * Math.PI * 2;
          n.vx += Math.cos(t) * 260 * dt;
          n.vy += Math.sin(t) * 260 * dt;
        }

        n.x += n.vx * dt; n.y += n.vy * dt;
        n.giro += n.vgiro * dt;

        desviarDoTexto(n);

        // quicam nas bordas da seção
        if (n.x < n.r)        { n.x = n.r;        n.vx = Math.abs(n.vx) * 0.9; }
        if (n.x > larg - n.r) { n.x = larg - n.r; n.vx = -Math.abs(n.vx) * 0.9; }
        if (n.y < n.r)        { n.y = n.r;        n.vy = Math.abs(n.vy) * 0.9; }
        if (n.y > alt - n.r)  { n.y = alt - n.r;  n.vy = -Math.abs(n.vy) * 0.9; }

        n.el.style.transform = lugar(n);
      }

      requestAnimationFrame(animar);
    };

    var seguirPonteiro = function (e) {
      var cx = caixaNotas.getBoundingClientRect();
      mx = e.clientX - cx.left;
      my = e.clientY - cx.top;
    };

    var soltarPonteiro = function () { mx = my = -99999; };

    secaoNotas.addEventListener('pointermove', seguirPonteiro, { passive: true });
    secaoNotas.addEventListener('pointerleave', soltarPonteiro);

    // No celular o dedo some quando solta. Sem isto as notas ficariam fugindo
    // de um ponteiro parado que já não está lá.
    secaoNotas.addEventListener('pointerup', soltarPonteiro, { passive: true });
    secaoNotas.addEventListener('pointercancel', soltarPonteiro, { passive: true });

    // o toque espalha tudo em volta, com alcance maior
    secaoNotas.addEventListener('pointerdown', function (e) {
      seguirPonteiro(e);
      notas.forEach(function (n) {
        var dx = n.x - mx, dy = n.y - my;
        var d = Math.hypot(dx, dy) || 0.01;
        if (d < RAIO * 2.4) {
          var f = 1 - d / (RAIO * 2.4);
          n.vx += (dx / d) * f * TOQUE * 0.016;
          n.vy += (dy / d) * f * TOQUE * 0.016;
          n.vgiro += (Math.random() - 0.5) * 160;
        }
      });
    }, { passive: true });

    var medir = function (recriar) {
      var cx = secaoNotas.getBoundingClientRect();
      larg = cx.width; alt = cx.height;
      topoSecao = cx.top + window.scrollY;
      medirZonas();

      // densidade constante: quanto maior a seção, mais notas
      var porNota = larg < 760 ? 21000 : 27000;
      var quantas = Math.max(30, Math.min(260, Math.round(larg * alt / porNota)));

      if (recriar || !notas.length || Math.abs(quantas - notas.length) > 14) {
        criar(quantas);
        espalhar();
      } else {
        notas.forEach(function (n) {
          n.x = Math.min(Math.max(n.r, n.x), Math.max(n.r, larg - n.r));
          n.y = Math.min(Math.max(n.r, n.y), Math.max(n.r, alt - n.r));
        });
      }
      pintar();
    };

    var ligar = function (sim) {
      if (sim === rodando) return;
      rodando = sim;
      if (sim) { ultimo = performance.now(); requestAnimationFrame(animar); }
    };

    var reavaliar = function () { ligar(naTela && !menosMovimento.matches); };

    medir(true);

    // só se mexem enquanto a seção está à vista
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        naTela = es[0].isIntersecting;
        reavaliar();
      }, { rootMargin: '200px' }).observe(secaoNotas);
    } else {
      naTela = true;
      reavaliar();
    }

    menosMovimento.addEventListener('change', reavaliar);

    var remedir;
    var aoMudarTamanho = function () {
      clearTimeout(remedir);
      remedir = setTimeout(function () { medir(false); }, 180);
    };
    window.addEventListener('resize', aoMudarTamanho);
    window.addEventListener('load', function () { medir(true); });

    // A seção cresce quando as fotos terminam de carregar. Sem remedir, os
    // campos de exclusão ficariam nas posições antigas.
    if ('ResizeObserver' in window) {
      new ResizeObserver(aoMudarTamanho).observe(secaoNotas);
    }
  }
  /* ======================================================================
     8. RÉGUA DE LEITURA

     Uma barra de compasso por seção, na posição que ela ocupa na altura da
     página. Cada uma é um botão que leva até lá. O fio dourado marca quanto
     já foi lido; o disco gira junto.

     Some quando o rodapé aparece — dali para baixo não há mais o que marcar.
     ====================================================================== */

  var marcadas = Array.prototype.slice.call(document.querySelectorAll('[data-regua]'));
  var rodape   = document.querySelector('.rodape');

  if (marcadas.length > 2) {
    var regua = document.createElement('div');
    regua.className = 'regua';
    regua.innerHTML =
      '<i class="regua__progresso"></i>' +
      '<span class="disco regua__disco" aria-hidden="true"></span>' +
      '<span class="regua__onde" aria-live="off">Abertura</span>' +
      '<span class="regua__compassos"></span>';

    regua.querySelector('.regua__disco').appendChild(desenharDisco());

    var compassos = regua.querySelector('.regua__compassos');
    var ondeEl    = regua.querySelector('.regua__onde');

    marcadas.forEach(function (secao) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'regua__marca';
      b.innerHTML = '<span class="regua__nome"></span>';
      b.querySelector('.regua__nome').textContent = secao.getAttribute('data-regua');
      b.setAttribute('aria-label', 'Ir para ' + secao.getAttribute('data-regua'));
      b.addEventListener('click', function () {
        secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      compassos.appendChild(b);
      secao.__marca = b;
    });

    document.body.appendChild(regua);

    var alturaDoc = 0;

    var recolocar = function () {
      alturaDoc = document.documentElement.scrollHeight;
      marcadas.forEach(function (secao) {
        var topo = secao.getBoundingClientRect().top + window.scrollY;
        secao.__marca.style.left = (topo / alturaDoc * 100).toFixed(3) + '%';
      });
    };

    var pedido = false;

    var atualizar = function () {
      pedido = false;

      var y     = window.scrollY;
      var rolar = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var lido  = Math.min(1, Math.max(0, y / rolar));

      regua.style.setProperty('--lido', lido.toFixed(4));
      document.documentElement.style.setProperty('--giro', (y * 0.05).toFixed(2));

      // visível só no meio da leitura: depois da abertura, antes do rodapé
      var chegouAoFim = rodape && rodape.getBoundingClientRect().top < window.innerHeight - 40;
      regua.classList.toggle('is-viva', y > 380 && !chegouAoFim);

      // a seção em que se está: a última cujo topo já passou do meio da tela
      var atual = null;
      for (var i = 0; i < marcadas.length; i++) {
        if (marcadas[i].getBoundingClientRect().top <= window.innerHeight * 0.5) atual = marcadas[i];
      }
      marcadas.forEach(function (s) {
        s.__marca.setAttribute('aria-current', String(s === atual));
      });
      ondeEl.textContent = atual ? atual.getAttribute('data-regua') : 'Abertura';
    };

    var aoRolar = function () {
      if (!pedido) { pedido = true; requestAnimationFrame(atualizar); }
    };

    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', function () { recolocar(); aoRolar(); });
    window.addEventListener('load', function () { recolocar(); atualizar(); });

    recolocar();
    atualizar();
  }

  /* ======================================================================
     9. MIUDEZAS
     ====================================================================== */

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
