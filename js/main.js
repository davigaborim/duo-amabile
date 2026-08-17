/* ==========================================================================
   DUO AMÁBILE — comportamento

   1. Revelação no scroll (discreta: opacidade e 12 px)
   2. Navegação: menu no celular, link ativo, cabeçalho preso
   3. Carrossel da imprensa
   4. Índice do currículo, nas páginas de intérprete
   5. Miudezas

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
     5. MIUDEZAS
     ====================================================================== */

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
