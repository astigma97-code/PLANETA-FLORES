/* js/interaccion.js
   El puntero (mouse, dedo) mueve un poco la cámara —paralaje— y tocar el
   cielo lanza una estrella fugaz, como pedir un deseo.
*/
(function (C) {
  'use strict';

  var lienzo, activo = false;
  var bajadaX = 0, bajadaY = 0, bajadaT = 0, arrastrando = false;
  var alPrimerToque = null;

  function construir(canvas) {
    lienzo = canvas;
    activo = true;

    lienzo.addEventListener('pointermove', enMovimiento, { passive: true });
    lienzo.addEventListener('pointerdown', enBajada, { passive: true });
    lienzo.addEventListener('pointermove', enArrastre, { passive: true });
    lienzo.addEventListener('pointerup', enSubida, { passive: true });
    lienzo.addEventListener('pointercancel', terminarArrastre, { passive: true });
    lienzo.addEventListener('wheel', function (ev) {
      C.viaje.zoom(ev.deltaY * 0.08);
    }, { passive: true });
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
    C.viaje.detenerCinematica();
    bajadaX = ev.clientX; bajadaY = ev.clientY; bajadaT = performance.now();
    arrastrando = false;
    C.viaje.comenzarControl();
  }

  function enArrastre(ev) {
    if (!bajadaT) return;
    var dx = ev.clientX - bajadaX, dy = ev.clientY - bajadaY;
    if (Math.hypot(dx, dy) > 8) arrastrando = true;
    C.viaje.moverControl(ev.movementX || (ev.clientX - bajadaX), ev.movementY || (ev.clientY - bajadaY));
    bajadaX = ev.clientX; bajadaY = ev.clientY;
  }

  function terminarArrastre() {
    bajadaT = 0;
    arrastrando = false;
    C.viaje.terminarControl();
  }

  function enSubida(ev) {
    if (!bajadaT) return;
    var dx = ev.clientX - bajadaX, dy = ev.clientY - bajadaY;
    var dt = performance.now() - bajadaT;
    var fueArrastre = arrastrando || Math.hypot(dx, dy) > 14;
    terminarArrastre();
    if (fueArrastre || dt > 550) return; // fue un arrastre, no un toque

    var ndc = aNdc(ev.clientX, ev.clientY);
    C.espacio.lanzarEstrellaFugaz(ndc.x, ndc.y);
    if (alPrimerToque) { alPrimerToque(); alPrimerToque = null; }
  }

  C.interaccion = {
    construir: construir,
    alPrimerToque: function (fn) { alPrimerToque = fn; },
  };

})(window.Cielo = window.Cielo || {});
