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

     A trajetória é a seção mais alta e mais vazia do site: uma coluna de
     texto e muita margem. As notas ocupam essa margem.

     Elas vagam devagar, quicam nas bordas da seção e se afastam umas das
     outras — nunca se tocam. O cursor as empurra dentro de um raio, e o
     clique dá um empurrão maior. Fora isso, ninguém as comanda.

     A camada é `pointer-events:none`, então nada aqui rouba o clique de um
     link da trajetória. O movimento só roda enquanto a seção está na tela, e
     não roda de jeito nenhum para quem pediu menos movimento.
     ====================================================================== */

  var caixaNotas = document.querySelector('[data-notas]');
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  var temCursor = window.matchMedia('(hover: hover) and (pointer: fine)');
  var telaLarga = window.matchMedia('(min-width: 761px)');

  // As mesmas condições que o CSS usa para esconder a camada. Repetidas aqui
  // porque esconder não basta: sem isto o laço continuaria calculando física
  // para notas que ninguém vê.
  var podeAnimar = function () {
    return telaLarga.matches && !menosMovimento.matches;
  };

  if (caixaNotas && temCursor.matches) {
    // os quatro desenhos, em caixa de 44 × 62
    var FIGURAS = [
      // semínima
      '<ellipse cx="13" cy="50" rx="8.4" ry="5.9" transform="rotate(-20 13 50)"/>' +
      '<path d="M21.4 46.6V9" stroke-width="2.9" stroke-linecap="round"/>',
      // colcheia
      '<ellipse cx="13" cy="50" rx="8.4" ry="5.9" transform="rotate(-20 13 50)"/>' +
      '<path d="M21.4 46.6V9" stroke-width="2.9" stroke-linecap="round"/>' +
      '<path d="M21.4 9c9.6 4.6 12.6 11 8.4 20 2.6-9.4-.6-14.4-8.4-15.6Z" class="cheia"/>',
      // mínima, de cabeça vazada
      '<ellipse cx="13" cy="50" rx="8.4" ry="5.9" transform="rotate(-20 13 50)" ' +
      'fill="none" stroke-width="3"/>' +
      '<path d="M21.4 46.6V9" stroke-width="2.9" stroke-linecap="round"/>',
      // duas colcheias sob a mesma barra
      '<ellipse cx="11" cy="52" rx="7.6" ry="5.3" transform="rotate(-20 11 52)"/>' +
      '<ellipse cx="34" cy="46" rx="7.6" ry="5.3" transform="rotate(-20 34 46)"/>' +
      '<path d="M18.5 49V13M41.5 43V7" stroke-width="2.7" stroke-linecap="round"/>' +
      '<path d="M17.4 13 42.6 7v6l-25.2 6Z" class="cheia"/>'
    ];

    var QUANTAS  = window.innerWidth < 1100 ? 15 : 21;
    var RAIO     = 165;   // alcance do cursor, em px
    var EMPURRAO = 1500;  // força do cursor
    var CLIQUE   = 5200;  // força do clique
    var VMAX     = 46;    // px por segundo
    var VMIN     = 7;

    var notas = [];
    var larg = 0, alt = 0;
    var mx = -9999, my = -9999;
    var rodando = false, ultimo = 0;

    for (var i = 0; i < QUANTAS; i++) {
      var el = document.createElement('span');
      el.className = 'nota';
      var escala = 0.48 + Math.random() * 0.62;
      el.innerHTML =
        '<svg viewBox="0 0 44 62" fill="currentColor" stroke="currentColor" ' +
        'focusable="false" aria-hidden="true">' +
        FIGURAS[Math.floor(Math.random() * FIGURAS.length)] + '</svg>';
      el.style.width = (36 * escala).toFixed(1) + 'px';
      caixaNotas.appendChild(el);

      var ang = Math.random() * Math.PI * 2;
      var vel = VMIN + Math.random() * 14;
      notas.push({
        el: el, r: 27 * escala,
        x: 0, y: 0,
        vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
        giro: Math.random() * 360,
        vgiro: (Math.random() - 0.5) * 9
      });
    }

    var medir = function (espalhar) {
      var cx = caixaNotas.getBoundingClientRect();
      larg = cx.width; alt = cx.height;
      notas.forEach(function (n) {
        if (espalhar) {
          n.x = n.r + Math.random() * Math.max(1, larg - n.r * 2);
          n.y = n.r + Math.random() * Math.max(1, alt - n.r * 2);
        } else {
          n.x = Math.min(Math.max(n.r, n.x), Math.max(n.r, larg - n.r));
          n.y = Math.min(Math.max(n.r, n.y), Math.max(n.r, alt - n.r));
        }
      });
    };

    var pintar = function () {
      notas.forEach(function (n) {
        n.el.style.transform =
          'translate3d(' + (n.x - n.r).toFixed(1) + 'px,' + (n.y - n.r).toFixed(1) + 'px,0)' +
          ' rotate(' + n.giro.toFixed(1) + 'deg)';
      });
    };

    // "animar", e não "passo": o carrossel da imprensa já usa esse nome neste
    // mesmo escopo, e um segundo `var passo` apagaria o dele
    var animar = function (agora) {
      if (!rodando) return;
      var dt = Math.min(0.05, (agora - ultimo) / 1000 || 0.016);
      ultimo = agora;

      for (var a = 0; a < notas.length; a++) {
        var n = notas[a];

        // o cursor empurra, e a força cresce quanto mais perto ele está
        var dx = n.x - mx, dy = n.y - my;
        var d = Math.hypot(dx, dy);
        if (d < RAIO && d > 0.01) {
          var f = 1 - d / RAIO;
          n.vx += (dx / d) * f * f * EMPURRAO * dt;
          n.vy += (dy / d) * f * f * EMPURRAO * dt;
        }

        // e uma da outra, para nunca se encostarem
        for (var b = a + 1; b < notas.length; b++) {
          var o = notas[b];
          var ex = n.x - o.x, ey = n.y - o.y;
          var de = Math.hypot(ex, ey);
          var minimo = n.r + o.r + 8;
          if (de < minimo && de > 0.01) {
            var g = (minimo - de) / minimo * 260 * dt;
            n.vx += (ex / de) * g; n.vy += (ey / de) * g;
            o.vx -= (ex / de) * g; o.vy -= (ey / de) * g;
          }
        }

        n.vx *= 0.986; n.vy *= 0.986;

        // nem paradas nem em disparada
        var v = Math.hypot(n.vx, n.vy);
        if (v > VMAX) { n.vx = n.vx / v * VMAX; n.vy = n.vy / v * VMAX; }
        else if (v < VMIN) {
          var t = Math.random() * Math.PI * 2;
          n.vx += Math.cos(t) * 9 * dt * 10;
          n.vy += Math.sin(t) * 9 * dt * 10;
        }

        n.x += n.vx * dt; n.y += n.vy * dt;
        n.giro += n.vgiro * dt;

        // quicam nas bordas da seção
        if (n.x < n.r)        { n.x = n.r;        n.vx = Math.abs(n.vx) * 0.86; }
        if (n.x > larg - n.r) { n.x = larg - n.r; n.vx = -Math.abs(n.vx) * 0.86; }
        if (n.y < n.r)        { n.y = n.r;        n.vy = Math.abs(n.vy) * 0.86; }
        if (n.y > alt - n.r)  { n.y = alt - n.r;  n.vy = -Math.abs(n.vy) * 0.86; }
      }

      pintar();
      requestAnimationFrame(animar);
    };

    var seguirCursor = function (e) {
      var cx = caixaNotas.getBoundingClientRect();
      mx = e.clientX - cx.left;
      my = e.clientY - cx.top;
    };

    var secaoNotas = caixaNotas.parentElement;

    secaoNotas.addEventListener('pointermove', seguirCursor);
    secaoNotas.addEventListener('pointerleave', function () { mx = my = -9999; });

    // o clique espalha tudo em volta, com alcance maior
    secaoNotas.addEventListener('pointerdown', function (e) {
      seguirCursor(e);
      notas.forEach(function (n) {
        var dx = n.x - mx, dy = n.y - my;
        var d = Math.hypot(dx, dy) || 0.01;
        if (d < RAIO * 2.1) {
          var f = 1 - d / (RAIO * 2.1);
          n.vx += (dx / d) * f * CLIQUE * 0.016;
          n.vy += (dy / d) * f * CLIQUE * 0.016;
          n.vgiro += (Math.random() - 0.5) * 90;
        }
      });
    });

    medir(true);
    pintar();

    var naTela = false;

    var ligar = function (sim) {
      if (sim === rodando) return;
      rodando = sim;
      if (sim) { ultimo = performance.now(); requestAnimationFrame(animar); }
    };

    // só se mexem enquanto a seção está à vista
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        naTela = es[0].isIntersecting;
        ligar(naTela && podeAnimar());
      }, { rootMargin: '120px' }).observe(secaoNotas);
    } else {
      naTela = true;
      ligar(podeAnimar());
    }

    var reavaliar = function () { ligar(naTela && podeAnimar()); };
    menosMovimento.addEventListener('change', reavaliar);
    telaLarga.addEventListener('change', reavaliar);

    var remedir;
    window.addEventListener('resize', function () {
      clearTimeout(remedir);
      remedir = setTimeout(function () { medir(false); pintar(); }, 160);
    });
    window.addEventListener('load', function () { medir(false); pintar(); });
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
