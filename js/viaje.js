/* js/viaje.js
   El recorrido de la cámara: primero el vuelo desde lejos hacia el jardín
   (al tocar «entrar»), y después una órbita lenta y constante alrededor de
   las flores, con un poco de paralaje según el puntero o el dedo.
*/
(function (C) {
  'use strict';

  var INICIO = { radio: 560, azimut: -1.05, elev: 0.62 };
  var ORBITA = { radio: 152, azimut: -0.35, elev: 0.48, altoMirar: 6 };

  var reducido = C.prefiereMenosMovimiento();
  var duracionViaje = 3.2;
  var velOrbita = 0.072;

  var parX = 0, parY = 0, parXObjetivo = 0, parYObjetivo = 0;
  var sacudida = 0;

  function construir() {
    duracionViaje = (C.config.duracionViajeMs || 3200) / 1000;
    velOrbita = 0.072 * (C.config.velocidadOrbita || 1);

    var camara = C.escena.camara();
    if (reducido) {
      ubicar(camara, ORBITA.radio, ORBITA.azimut, ORBITA.elev);
    } else {
      ubicar(camara, INICIO.radio, INICIO.azimut, INICIO.elev);
    }
    C.escena.alActualizar(actualizar);
  }

  function ubicar(camara, radio, azimut, elev) {
    camara.position.set(
      radio * Math.cos(elev) * Math.cos(azimut),
      radio * Math.sin(elev) + 6,
      radio * Math.cos(elev) * Math.sin(azimut)
    );
    camara.lookAt(0, ORBITA.altoMirar, 0);
  }

  function setParallax(x, y) {
    parXObjetivo = C.clamp(x, -1, 1);
    parYObjetivo = C.clamp(y, -1, 1);
  }

  function impulso() {
    sacudida = Math.min(sacudida + 1, 1.6);
  }

  function actualizar(dt, t) {
    var camara = C.escena.camara();

    parX += (parXObjetivo - parX) * Math.min(1, dt * 2.2);
    parY += (parYObjetivo - parY) * Math.min(1, dt * 2.2);
    sacudida *= Math.exp(-dt * 3.2);

    var radio, azimut, elev;

    if (reducido) {
      radio = ORBITA.radio;
      azimut = ORBITA.azimut + parX * 0.1;
      elev = ORBITA.elev + parY * 0.04;
    } else if (t < duracionViaje) {
      var p = C.suavizar(C.clamp(t / duracionViaje, 0, 1));
      radio = C.mezclar(INICIO.radio, ORBITA.radio, p);
      azimut = C.mezclar(INICIO.azimut, ORBITA.azimut, p);
      elev = C.mezclar(INICIO.elev, ORBITA.elev, p);
    } else {
      var tOrbita = t - duracionViaje;
      radio = ORBITA.radio + Math.sin(t * 0.17) * 5 - sacudida * 20;
      azimut = ORBITA.azimut + tOrbita * velOrbita + parX * 0.16;
      elev = ORBITA.elev + Math.sin(t * 0.11) * 0.018 + parY * 0.06;
    }

    ubicar(camara, radio, azimut, elev);
  }

  C.viaje = { construir: construir, setParallax: setParallax, impulso: impulso };

})(window.Cielo = window.Cielo || {});
