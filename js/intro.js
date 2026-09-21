/* js/intro.js
   La bienvenida: el título, el botón «entrar», y el paso hacia la
   experiencia principal (arma la escena 3D la primera vez que hace falta,
   no antes, para no gastar batería mientras la persona todavía está leyendo
   la portada).
*/
(function (C) {
  'use strict';

  var yaEntro = false;
  var elBienvenida, elExperiencia, elTitulo, elHint, elBoton;

  function construir() {
    elBienvenida = document.getElementById('bienvenida');
    elExperiencia = document.getElementById('experiencia');
    elTitulo = document.getElementById('titulo');
    elHint = document.getElementById('hint');
    elBoton = document.getElementById('btn-entrar');

    elBoton.addEventListener('click', entrar);
  }

  function activarModoSimple() {
    C.sinWebGL = true;
    elExperiencia.classList.add('modo-simple');
  }

  function entrar() {
    if (yaEntro) return;
    yaEntro = true;
    elBoton.disabled = true;

    elBienvenida.classList.add('saliendo');
    elExperiencia.classList.remove('oculto');
    setTimeout(function () {
      elBienvenida.setAttribute('aria-hidden', 'true');
      elBienvenida.style.display = 'none';
    }, 900);

    var canvas = document.getElementById('universo');
    var huboEscena = C.escena.crear(canvas);
    if (!huboEscena) {
      activarModoSimple();
    } else {
      C.espacio.construir();
      C.flora.construir();
      C.viaje.construir();
      C.interaccion.construir(canvas);
      C.escena.iniciar();
    }

    C.frases.construir();
    C.frases.iniciar();
    C.audio.iniciar();

    if (elTitulo) setTimeout(function () { elTitulo.classList.add('visible'); }, 600);
    if (elHint) {
      setTimeout(function () { elHint.classList.add('visible'); }, 1600);
      C.interaccion.alPrimerToque && C.interaccion.alPrimerToque(function () {
        elHint.classList.remove('visible');
      });
      // Si no hay 3D (modo simple) igual la escondemos sola, más adelante.
      if (C.sinWebGL) setTimeout(function () { elHint.classList.remove('visible'); }, 9000);
    }
  }

  C.intro = { construir: construir, entrar: entrar };

})(window.Cielo = window.Cielo || {});
