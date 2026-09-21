/* js/audio.js
   La música de fondo. Arranca apenas se toca «entrar» —ya hay un gesto de
   la persona, así que los navegadores la dejan sonar— y se apaga o prende
   con un fundido suave desde el botón de abajo a la derecha.
*/
(function (C) {
  'use strict';

  var audio, boton, encendido = false;

  function construir() {
    audio = document.getElementById('musica');
    boton = document.getElementById('sonido');
    audio.loop = true;
    audio.volume = 0;
    boton.addEventListener('click', alternar);
  }

  function fundido(destino, duracion) {
    var inicio = audio.volume;
    var t0 = performance.now();
    duracion = duracion || C.config.fundidoMs;
    function paso(ahora) {
      var p = Math.min(1, Math.max(0, (ahora - t0) / duracion));
      audio.volume = C.clamp(C.mezclar(inicio, destino, p), 0, 1);
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  function iniciar() {
    var promesa = audio.play();
    if (promesa && promesa.catch) {
      promesa.catch(function () {
        var reintentar = function () { audio.play().catch(function () {}); };
        document.addEventListener('pointerdown', reintentar, { once: true });
      });
    }
    fundido(C.config.volumen);
    encendido = true;
    actualizarBoton();
  }

  function alternar() {
    encendido = !encendido;
    fundido(encendido ? C.config.volumen : 0);
    if (encendido && audio.paused) audio.play().catch(function () {});
    actualizarBoton();
  }

  function actualizarBoton() {
    boton.classList.toggle('off', !encendido);
    boton.setAttribute('aria-pressed', String(encendido));
    boton.setAttribute('aria-label', encendido ? 'Silenciar la música' : 'Activar la música');
  }

  C.audio = { construir: construir, iniciar: iniciar, alternar: alternar };

})(window.Cielo = window.Cielo || {});
