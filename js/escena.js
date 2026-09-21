/* js/escena.js
   El núcleo de three.js: renderer, cámara, escena y el reloj de animación.
   Los demás módulos (espacio.js, flora.js, viaje.js, frases.js) se anotan
   aquí con `alActualizar(fn)` para recibir un tic en cada cuadro, así que
   este archivo no necesita saber nada de estrellas ni de flores.
*/
(function (C) {
  'use strict';

  var escucharesActualizar = [];
  var renderer, camara, escena, reloj;
  var listo = false;
  var anchoCanvas = 0, altoCanvas = 0;

  function crear(canvas) {
    if (typeof THREE === 'undefined') return false;
    try {
      escena = new THREE.Scene();

      camara = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 3000);
      camara.position.set(0, 30, 260);

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x03010a, 1);
      var dpr = Math.min(window.devicePixelRatio || 1, C.calidad === 2 ? 2 : 1.5);
      renderer.setPixelRatio(dpr);
      ajustarTamano();

      reloj = new THREE.Clock();
      listo = true;
      window.addEventListener('resize', ajustarTamano);
      return true;
    } catch (e) {
      return false;
    }
  }

  function ajustarTamano() {
    if (!renderer) return;
    anchoCanvas = window.innerWidth;
    altoCanvas = window.innerHeight;
    camara.aspect = anchoCanvas / altoCanvas;
    camara.updateProjectionMatrix();
    renderer.setSize(anchoCanvas, altoCanvas, true);
  }

  function alActualizar(fn) { escucharesActualizar.push(fn); }

  var pausado = false;
  document.addEventListener('visibilitychange', function () {
    pausado = document.hidden;
  });

  function bucle() {
    requestAnimationFrame(bucle);
    if (!listo || pausado) return;
    var dt = Math.min(reloj.getDelta(), 0.05);
    var t = reloj.getElapsedTime();
    for (var i = 0; i < escucharesActualizar.length; i++) escucharesActualizar[i](dt, t);
    renderer.render(escena, camara);
  }

  C.escena = {
    crear: crear,
    iniciar: function () { requestAnimationFrame(bucle); },
    alActualizar: alActualizar,
    obtener: function () { return escena; },
    camara: function () { return camara; },
    renderer: function () { return renderer; },
  };

})(window.Cielo = window.Cielo || {});
