/* ==========================================================================
   DUO AMÁBILE — comportamento

   1. A pauta. A melodia está impressa de ponta a ponta no rodapé; rolar a
      página é tocá-la. A nota corrente anda com a rolagem e as notas que já
      passaram ficam acesas atrás dela.
   2. O violão. Fica cortado pela borda direita e gira devagar conforme a
      página anda. Quando uma seção nova entra, uma corda soa — a única coisa
      que pisca no site inteiro.
   3. Revelação, navegação e miudezas.
   ========================================================================== */

(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  function avancoDaPagina() {
    var alcance = document.documentElement.scrollHeight - window.innerHeight;
    if (alcance <= 0) return 0;
    return Math.min(1, Math.max(0, window.scrollY / alcance));
  }

  /* ======================================================================
     1. A PAUTA
     ====================================================================== */

  var pauta      = document.getElementById('pauta');
  var pautaSvg   = document.getElementById('pautaSvg');
  var gLinhas    = document.getElementById('pautaLinhas');
  var gRastro    = document.getElementById('pautaRastro');
  var gNota      = document.getElementById('pautaNota');
  var notaCabeca = document.getElementById('notaCabeca');
  var notaHaste  = document.getElementById('notaHaste');
  var barra      = document.getElementById('pautaProgresso');

  // Alturas na pauta: 0 é a linha de baixo, 8 é a de cima, cada passo é meio
  // espaço. A frase sobe em três arcos e desce para repousar no fim.
  var MELODIA = [2, 4, 5, 7, 6, 4, 5, 3, 4, 6, 8, 7, 5, 6, 4, 5, 3, 5, 7, 8, 6, 4, 3, 1];
  var MARGEM = 26;

  var L = 0, A = 0, espaco = 9, baseY = 0;
  var impressas = [];          // as cabeças de nota desenhadas na pauta
  var yAtual = null;           // y da nota corrente, suavizado quadro a quadro

  function alturaDe(grau) { return baseY - grau * (espaco / 2); }
  function xDe(i) { return MARGEM + (i / (MELODIA.length - 1)) * (L - MARGEM * 2); }

  function medirPauta() {
    if (!pauta) return;
    L = pauta.clientWidth;
    A = pauta.clientHeight;
    if (!L || !A) return;

    pautaSvg.setAttribute('viewBox', '0 0 ' + L + ' ' + A);

    espaco = Math.max(5.5, Math.min(9.5, A * 0.115));
    var alturaPauta = espaco * 4;
    baseY = A - 11;                       // linha de baixo
    var topo = baseY - alturaPauta;

    // as cinco linhas, mais as barras de compasso das pontas
    var d = '';
    for (var i = 0; i < 5; i++) {
      var y = (topo + i * espaco).toFixed(1);
      d += 'M' + MARGEM * 0.5 + ',' + y + 'H' + (L - MARGEM * 0.5) + ' ';
    }
    d += 'M' + MARGEM * 0.5 + ',' + topo.toFixed(1) + 'V' + baseY.toFixed(1) + ' ';
    d += 'M' + (L - MARGEM * 0.5) + ',' + topo.toFixed(1) + 'V' + baseY.toFixed(1);
    gLinhas.innerHTML = '<path d="' + d + '" fill="none"/>';

    // a melodia impressa
    gRastro.textContent = '';
    impressas = [];
    for (var n = 0; n < MELODIA.length; n++) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      var cx = xDe(n), cy = alturaDe(MELODIA[n]);
      e.setAttribute('cx', cx.toFixed(1));
      e.setAttribute('cy', cy.toFixed(1));
      e.setAttribute('rx', (espaco * 0.38).toFixed(2));
      e.setAttribute('ry', (espaco * 0.28).toFixed(2));
      e.setAttribute('transform', 'rotate(-20 ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')');
      e.setAttribute('fill', 'rgba(232,200,122,.16)');
      gRastro.appendChild(e);
      impressas.push(e);
    }

    notaCabeca.setAttribute('rx', (espaco * 0.5).toFixed(2));
    notaCabeca.setAttribute('ry', (espaco * 0.37).toFixed(2));
    yAtual = null;
  }

  function tocarPauta(avanco, suave) {
    if (!pauta || !L) return;

    barra.style.width = (avanco * 100).toFixed(2) + '%';

    var x = MARGEM + avanco * (L - MARGEM * 2);

    // a nota que está soando é a última cuja posição já foi ultrapassada
    var indice = Math.round(avanco * (MELODIA.length - 1));
    var alvoY = alturaDe(MELODIA[indice]);

    if (yAtual === null || !suave) yAtual = alvoY;
    else yAtual += (alvoY - yAtual) * 0.18;

    notaCabeca.setAttribute('cx', x.toFixed(1));
    notaCabeca.setAttribute('cy', yAtual.toFixed(1));
    notaCabeca.setAttribute('transform', 'rotate(-20 ' + x.toFixed(1) + ' ' + yAtual.toFixed(1) + ')');

    // haste: para baixo acima da linha do meio, para cima abaixo dela
    var paraCima = MELODIA[indice] < 4;
    var comp = espaco * 3.4;
    var hx = x + (paraCima ? espaco * 0.48 : -espaco * 0.48);
    notaHaste.setAttribute('x1', hx.toFixed(1));
    notaHaste.setAttribute('x2', hx.toFixed(1));
    notaHaste.setAttribute('y1', yAtual.toFixed(1));
    notaHaste.setAttribute('y2', (yAtual + (paraCima ? -comp : comp)).toFixed(1));

    for (var i = 0; i < impressas.length; i++) {
      impressas[i].setAttribute('fill', i <= indice ? 'rgba(232,200,122,.62)' : 'rgba(232,200,122,.16)');
    }
  }

  /* ======================================================================
     2. O VIOLÃO
     ====================================================================== */

  var violao = document.getElementById('violao');
  var gCordas = document.getElementById('cordas');
  var gLongas = document.getElementById('cordasLongas');
  var cordas = [];              // cada corda: as três partes que soam juntas

  if (gCordas && gLongas) {
    var naInstrumento = gCordas.children;
    var prolongamento = gLongas.children;
    for (var c = 0; c < 6; c++) {
      cordas.push([naInstrumento[c], prolongamento[c], prolongamento[c + 6]].filter(Boolean));
    }
  }

  function girarViolao(avanco) {
    if (!violao) return;
    // um giro curto de ponta a ponta: o instrumento acompanha a leitura
    var ang = -7 + avanco * 13;
    var desce = -50 + avanco * 6;
    violao.style.transform = 'translateY(' + desce.toFixed(2) + '%) rotate(' + ang.toFixed(2) + 'deg)';
  }

  var proximaCorda = 0;
  function soarCorda() {
    if (!cordas.length || semMovimento.matches) return;
    var partes = cordas[proximaCorda % cordas.length];
    proximaCorda++;
    partes.forEach(function (p) {
      p.style.transition = 'none';
      p.style.opacity = '1';
      p.style.strokeWidth = '1.4';
      // deixa o quadro seguinte aplicar a transição de volta
      requestAnimationFrame(function () {
        p.style.transition = 'opacity 1.6s ease-out, stroke-width 1.6s ease-out';
        p.style.opacity = '';
        p.style.strokeWidth = '';
      });
    });
  }

  /* ======================================================================
     3. O QUADRO
     ====================================================================== */

  var pedido = null;

  function quadro() {
    pedido = null;
    var a = avancoDaPagina();
    tocarPauta(a, true);
    girarViolao(a);
  }

  function pedirQuadro() {
    if (pedido === null) pedido = requestAnimationFrame(quadro);
  }

  function ligar() {
    medirPauta();
    var a = avancoDaPagina();
    tocarPauta(a, false);
    girarViolao(a);
  }

  window.addEventListener('scroll', pedirQuadro, { passive: true });

  var remedir;
  window.addEventListener('resize', function () {
    clearTimeout(remedir);
    remedir = setTimeout(ligar, 150);
  });

  ligar();
  // as fontes mudam a altura do documento; refaz a conta quando assentarem
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ligar);
  window.addEventListener('load', ligar);

  /* ======================================================================
     4. REVELAÇÃO NO SCROLL
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
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

    aRevelar.forEach(function (el) { olho.observe(el); });

    // uma corda soa a cada seção nova que entra em cena
    var secoes = document.querySelectorAll('main section');
    if (secoes.length) {
      var ouvido = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) { if (e.isIntersecting) soarCorda(); });
      }, { rootMargin: '-30% 0px -55% 0px' });
      secoes.forEach(function (s) { ouvido.observe(s); });
    }
  } else {
    aRevelar.forEach(function (el) { el.classList.add('is-vista'); });
  }

  /* ======================================================================
     5. NAVEGAÇÃO
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

  // link ativo conforme a seção visível
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
     6. MIUDEZAS
     ====================================================================== */

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
