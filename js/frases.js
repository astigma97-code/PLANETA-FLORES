/* js/frases.js
   Dos cosas que van en el mismo ritmo, pero por caminos distintos:
   - la frase grande, en un rótulo 2D fijo (fácil de leer, con aria-live);
   - las etiquetas cortas que flotan como globitos sueltos en el jardín 3D.
*/
(function (C) {
  'use strict';

  var reducido = C.prefiereMenosMovimiento();
  var elFrase, elFraseSr;
  var indiceFrase = 0, poolFrases = [];
  var etiquetaActual = null;

  function construir() {
    elFrase = document.getElementById('frase');
    elFraseSr = document.getElementById('frase-sr');

    var nombre = C.config.nombre;
    poolFrases = C.datos.frases
      .filter(function (f) { return nombre || f.indexOf('{nombre}') === -1; })
      .map(function (f) { return C.conNombre(f, nombre); });
    if (!poolFrases.length) poolFrases = ['Para ti.'];

    if (animar3D()) C.escena.alActualizar(actualizarEtiqueta);
  }

  function animar3D() { return !reducido && !C.sinWebGL; }

  function iniciar() {
    setTimeout(mostrarSiguienteFrase, C.config.primeraFraseMs);
    if (animar3D()) setTimeout(mostrarSiguienteEtiqueta, C.config.primeraEtiquetaMs);
  }

  // -- La frase grande --
  function mostrarSiguienteFrase() {
    var texto = poolFrases[indiceFrase % poolFrases.length];
    indiceFrase++;
    elFrase.textContent = texto;
    elFraseSr.textContent = texto;
    requestAnimationFrame(function () { elFrase.classList.add('visible'); });

    setTimeout(function () {
      elFrase.classList.remove('visible');
      setTimeout(mostrarSiguienteFrase, C.azar(C.config.pausaFraseMinMs, C.config.pausaFraseMaxMs));
    }, C.config.duracionFraseMs);
  }

  // -- Las etiquetas flotantes en 3D --
  function crearEtiqueta(texto) {
    var camara = C.escena.camara();
    var azimutCam = Math.atan2(camara.position.z, camara.position.x);
    var angulo = azimutCam + C.azar(-0.45, 0.45);
    var radio = C.azar(58, 102);
    var altura = C.azar(0, 26);

    var datosTex = C.texturaEtiqueta(texto);
    var textura = new THREE.CanvasTexture(datosTex.canvas);
    var mat = new THREE.SpriteMaterial({ map: textura, transparent: true, opacity: 0, depthWrite: false });
    var sprite = new THREE.Sprite(mat);
    var alto = 7.4, ancho = alto * (datosTex.ancho / datosTex.alto);
    sprite.scale.set(ancho, alto, 1);
    sprite.position.set(Math.cos(angulo) * radio, altura, Math.sin(angulo) * radio);
    C.escena.obtener().add(sprite);

    etiquetaActual = {
      sprite: sprite, mat: mat, textura: textura,
      angulo: angulo, radio: radio, altura: altura,
      faseBamboleo: Math.random() * 6.28, saliendo: false,
    };
  }

  function quitarEtiqueta() {
    if (!etiquetaActual) return;
    C.escena.obtener().remove(etiquetaActual.sprite);
    etiquetaActual.textura.dispose();
    etiquetaActual.mat.dispose();
    etiquetaActual = null;
  }

  function mostrarSiguienteEtiqueta() {
    crearEtiqueta(C.elegir(C.datos.etiquetas));
    setTimeout(function () {
      if (etiquetaActual) etiquetaActual.saliendo = true;
      setTimeout(function () {
        quitarEtiqueta();
        setTimeout(mostrarSiguienteEtiqueta, C.azar(C.config.pausaEtiquetaMinMs, C.config.pausaEtiquetaMaxMs));
      }, 650);
    }, C.config.duracionEtiquetaMs);
  }

  function actualizarEtiqueta(dt, t) {
    if (!etiquetaActual) return;
    var e = etiquetaActual;
    var objetivo = e.saliendo ? 0 : 0.95;
    e.mat.opacity += (objetivo - e.mat.opacity) * Math.min(1, dt * 4);
    var y = e.altura + Math.sin(t * 0.8 + e.faseBamboleo) * 1.7;
    e.sprite.position.set(Math.cos(e.angulo) * e.radio, y, Math.sin(e.angulo) * e.radio);
  }

  C.frases = { construir: construir, iniciar: iniciar };

})(window.Cielo = window.Cielo || {});
