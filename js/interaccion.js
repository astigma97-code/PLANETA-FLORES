/* js/interaccion.js
   El puntero (mouse, dedo) mueve un poco la cámara —paralaje— y tocar el
   cielo lanza una estrella fugaz, como pedir un deseo.
*/
(function (C) {
  'use strict';

  var lienzo, activo = false;
  var bajadaX = 0, bajadaY = 0, bajadaT = 0;
  var alPrimerToque = null;

  function construir(canvas) {
    lienzo = canvas;
    activo = true;

    lienzo.addEventListener('pointermove', enMovimiento, { passive: true });
    lienzo.addEventListener('pointerdown', enBajada, { passive: true });
    lienzo.addEventListener('pointerup', enSubida, { passive: true });
    lienzo.addEventListener('pointercancel', function () { bajadaT = 0; }, { passive: true });
  }

  function aNdc(x, y) {
    return {
      x: (x / window.innerWidth) * 2 - 1,
      y: -((y / window.innerHeight) * 2 - 1),
    };
  }

  function enMovimiento(ev) {
    if (!activo) return;
    var x = (ev.clientX / window.innerWidth) * 2 - 1;
    var y = (ev.clientY / window.innerHeight) * 2 - 1;
    C.viaje.setParallax(x, y);
  }

  function enBajada(ev) {
    bajadaX = ev.clientX; bajadaY = ev.clientY; bajadaT = performance.now();
  }

  function enSubida(ev) {
    if (!bajadaT) return;
    var dx = ev.clientX - bajadaX, dy = ev.clientY - bajadaY;
    var dt = performance.now() - bajadaT;
    bajadaT = 0;
    if (Math.hypot(dx, dy) > 14 || dt > 550) return; // fue un arrastre, no un toque

    var ndc = aNdc(ev.clientX, ev.clientY);
    C.espacio.lanzarEstrellaFugaz(ndc.x, ndc.y);
    C.viaje.impulso();
    if (alPrimerToque) { alPrimerToque(); alPrimerToque = null; }
  }

  C.interaccion = {
    construir: construir,
    alPrimerToque: function (fn) { alPrimerToque = fn; },
  };

})(window.Cielo = window.Cielo || {});
