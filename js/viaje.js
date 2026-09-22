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
  var controlAzimut = ORBITA.azimut, controlElev = ORBITA.elev, controlRadio = ORBITA.radio;
  var controlActivo = false;
  var explorado = false;
  var sacudida = 0;
  var cinematicaActiva = false;
  var cinematicaInicio = 0;
  var cinematicaDuracion = 32;
  var cinematicaEscenas = [
    { radio: 138, azimut: -0.42, elev: 0.36, mira: [0, 6, 0] },
    { radio: 220, azimut: 0.42, elev: 0.62, mira: [90, 38, -520] },
    { radio: 310, azimut: 1.35, elev: 0.22, mira: [-250, 110, -700] },
    { radio: 185, azimut: 2.2, elev: 0.78, mira: [160, 120, -640] },
    { radio: 126, azimut: 3.45, elev: 0.3, mira: [0, 5, 0] },
  ];

  function construir() {
    duracionViaje = (C.config.duracionViajeMs || 3200) / 1000;
    velOrbita = 0.072 * (C.config.velocidadOrbita || 1);

    var camara = C.escena.camara();
    if (reducido) {
      ubicar(camara, ORBITA.radio, ORBITA.azimut, ORBITA.elev);
    } else {
      ubicar(camara, INICIO.radio, INICIO.azimut, INICIO.elev);
    }
    cinematicaInicio = duracionViaje + 3;
    cinematicaActiva = !reducido;
    C.escena.alActualizar(actualizar);
  }

  function ubicar(camara, radio, azimut, elev, mira) {
    camara.position.set(
      radio * Math.cos(elev) * Math.cos(azimut),
      radio * Math.sin(elev) + 6,
      radio * Math.cos(elev) * Math.sin(azimut)
    );
    camara.lookAt(mira ? new THREE.Vector3(mira[0], mira[1], mira[2]) : new THREE.Vector3(0, ORBITA.altoMirar, 0));
  }

  function setParallax(x, y) {
    parXObjetivo = C.clamp(x, -1, 1);
    parYObjetivo = C.clamp(y, -1, 1);
  }

  function detenerCinematica() {
    if (!cinematicaActiva) return;
    var camara = C.escena.camara();
    var objetivo = new THREE.Vector3(0, ORBITA.altoMirar, 0);
    var relativo = camara.position.clone().sub(objetivo);
    controlRadio = relativo.length();
    controlAzimut = Math.atan2(relativo.z, relativo.x);
    controlElev = Math.asin(C.clamp(relativo.y / Math.max(controlRadio, 1), -1, 1));
    cinematicaActiva = false;
    explorado = true;
  }

  function comenzarControl() {
    detenerCinematica();
    controlActivo = true;
  }

  function moverControl(dx, dy) {
    if (!controlActivo) return;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) explorado = true;
    controlAzimut -= dx * 0.008;
    controlElev = C.clamp(controlElev + dy * 0.006, -0.75, 1.25);
  }

  function terminarControl() { controlActivo = false; }

  function zoom(delta) {
    detenerCinematica();
    explorado = true;
    controlRadio = C.clamp(controlRadio + delta, 72, 330);
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

    if (cinematicaActiva && t >= cinematicaInicio) {
      var tiempo = (t - cinematicaInicio) % cinematicaDuracion;
      var tramo = cinematicaDuracion / cinematicaEscenas.length;
      var indice = Math.floor(tiempo / tramo);
      var progreso = C.suavizar((tiempo % tramo) / tramo);
      var actual = cinematicaEscenas[indice];
      var siguiente = cinematicaEscenas[(indice + 1) % cinematicaEscenas.length];
      radio = C.mezclar(actual.radio, siguiente.radio, progreso);
      azimut = C.mezclar(actual.azimut, siguiente.azimut, progreso);
      elev = C.mezclar(actual.elev, siguiente.elev, progreso);
      var mira = [
        C.mezclar(actual.mira[0], siguiente.mira[0], progreso),
        C.mezclar(actual.mira[1], siguiente.mira[1], progreso),
        C.mezclar(actual.mira[2], siguiente.mira[2], progreso),
      ];
      ubicar(camara, radio, azimut, elev, mira);
      return;
    }

    if (reducido) {
      radio = controlRadio;
      azimut = controlAzimut + parX * 0.04;
      elev = controlElev + parY * 0.02;
    } else if (t < duracionViaje) {
      var p = C.suavizar(C.clamp(t / duracionViaje, 0, 1));
      radio = C.mezclar(INICIO.radio, ORBITA.radio, p);
      azimut = C.mezclar(INICIO.azimut, ORBITA.azimut, p);
      elev = C.mezclar(INICIO.elev, ORBITA.elev, p);
    } else {
      var tOrbita = t - duracionViaje;
      radio = controlRadio + Math.sin(t * 0.17) * 5 - sacudida * 20;
      azimut = controlAzimut + (!explorado && !controlActivo ? tOrbita * velOrbita : 0) + parX * 0.06;
      elev = controlElev + Math.sin(t * 0.11) * 0.018 + parY * 0.04;
    }

    ubicar(camara, radio, azimut, elev);
  }

  C.viaje = {
    construir: construir,
    setParallax: setParallax,
    comenzarControl: comenzarControl,
    moverControl: moverControl,
    terminarControl: terminarControl,
    zoom: zoom,
    impulso: impulso,
    detenerCinematica: detenerCinematica,
  };

})(window.Cielo = window.Cielo || {});
