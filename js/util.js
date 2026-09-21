/* js/util.js
   Espacio de nombres `Cielo`, utilidades pequeñas y generadores de texturas
   en <canvas> (flores, resplandores, estrellas, etiquetas de texto) para
   usar como partículas dentro de la escena 3D.
*/
(function (C) {
  'use strict';

  C.clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };
  C.azar = function (a, b) { return a + Math.random() * (b - a); };
  C.azarEntero = function (a, b) { return Math.floor(C.azar(a, b + 1)); };
  C.elegir = function (lista) { return lista[(Math.random() * lista.length) | 0]; };
  C.mezclar = function (a, b, t) { return a + (b - a) * t; };

  // Curva de aceleración/desaceleración suave, para los movimientos de cámara.
  C.suavizar = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  C.prefiereMenosMovimiento = function () {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  // Reemplaza {nombre} en un texto. Si no hay nombre, deja el texto normal
  // (se filtran antes las frases que exigen nombre; esto es un resguardo).
  C.conNombre = function (texto, nombre) {
    return texto.replace(/\{nombre\}/g, nombre || '');
  };

  // -- Calidad según el dispositivo: menos partículas en equipos modestos --
  C.calidad = (function () {
    var nucleos = navigator.hardwareConcurrency || 4;
    var memoria = navigator.deviceMemory || 4; // no todos los navegadores la exponen
    var movil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    var nivel = 2; // 0 baja, 1 media, 2 alta
    if (movil || nucleos <= 4 || memoria <= 4) nivel = 1;
    if (nucleos <= 2 || memoria <= 2) nivel = 0;
    return nivel;
  })();

  C.factorCalidad = [0.45, 0.7, 1][C.calidad];

  // ---------------------------------------------------------------------
  // Texturas en canvas, pensadas para usarse como `map` de THREE.PointsMaterial
  // o THREE.SpriteMaterial. Se generan una sola vez y se reusan.
  // ---------------------------------------------------------------------

  // Una florecita de cinco pétalos vista de frente.
  C.texturaFlor = function (petaloA, petaloB, centroA, centroB, tam) {
    tam = tam || 128;
    var c = document.createElement('canvas');
    c.width = c.height = tam;
    var ctx = c.getContext('2d');
    var cx = tam / 2, cy = tam / 2, rP = tam * 0.34, rC = tam * 0.16;
    ctx.translate(cx, cy);
    for (var i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 5);
      var g = ctx.createRadialGradient(0, -rP * 0.5, 1, 0, -rP * 0.5, rP);
      g.addColorStop(0, petaloA);
      g.addColorStop(1, petaloB);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, -rP * 0.52, rP * 0.44, rP * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    var gc = ctx.createRadialGradient(0, 0, 0, 0, 0, rC);
    gc.addColorStop(0, centroA);
    gc.addColorStop(1, centroB);
    ctx.fillStyle = gc;
    ctx.beginPath();
    ctx.arc(0, 0, rC, 0, Math.PI * 2);
    ctx.fill();
    return c;
  };

  // Resplandor radial suave: para el núcleo del sol-flor y los halos.
  C.texturaResplandor = function (colorDentro, colorFuera, tam) {
    tam = tam || 256;
    var c = document.createElement('canvas');
    c.width = c.height = tam;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
    g.addColorStop(0, colorDentro);
    g.addColorStop(0.35, colorDentro);
    g.addColorStop(1, colorFuera);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, tam, tam);
    return c;
  };

  // Destello de cuatro puntas, para estrellas brillantes y chispas.
  C.texturaDestello = function (tam) {
    tam = tam || 64;
    var c = document.createElement('canvas');
    c.width = c.height = tam;
    var ctx = c.getContext('2d');
    var cx = tam / 2, cy = tam / 2;
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, tam / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(.22, 'rgba(255,244,214,.95)');
    g.addColorStop(1, 'rgba(255,244,214,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, tam, tam);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,250,235,.55)';
    ctx.lineWidth = Math.max(1, tam * 0.02);
    ctx.beginPath();
    ctx.moveTo(cx, 2); ctx.lineTo(cx, tam - 2);
    ctx.moveTo(2, cy); ctx.lineTo(tam - 2, cy);
    ctx.stroke();
    return c;
  };

  // Una mota redonda simple y suave, para el polvo/nebulosa de fondo.
  C.texturaMota = function (color, tam) {
    tam = tam || 48;
    var c = document.createElement('canvas');
    c.width = c.height = tam;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, tam, tam);
    return c;
  };

  // Una "cápsula" con texto, para las etiquetas flotantes en 3D.
  // Devuelve {canvas, ancho, alto} — el tamaño real depende del texto.
  C.texturaEtiqueta = function (texto) {
    var escala = 2; // nitidez en pantallas de alta densidad
    var fuente = 'italic 600 26px "Instrument Serif", Georgia, serif';
    var medidor = document.createElement('canvas').getContext('2d');
    medidor.font = fuente;
    var anchoTexto = medidor.measureText(texto).width;

    var pad = 30, altoBase = 64;
    var ancho = Math.ceil(anchoTexto + pad * 2);
    var alto = altoBase;

    var c = document.createElement('canvas');
    c.width = ancho * escala;
    c.height = alto * escala;
    var ctx = c.getContext('2d');
    ctx.scale(escala, escala);
    ctx.font = fuente;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    var r = alto / 2;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(ancho, 0, ancho, alto, r);
    ctx.arcTo(ancho, alto, 0, alto, r);
    ctx.arcTo(0, alto, 0, 0, r);
    ctx.arcTo(0, 0, ancho, 0, r);
    ctx.closePath();
    ctx.fillStyle = 'rgba(20,8,26,.5)';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(255,175,205,.55)';
    ctx.stroke();

    ctx.fillStyle = '#fff2df';
    ctx.shadowColor = 'rgba(255,180,120,.85)';
    ctx.shadowBlur = 10;
    ctx.fillText(texto, ancho / 2, alto / 2 + 2);

    return { canvas: c, ancho: ancho, alto: alto };
  };

})(window.Cielo = window.Cielo || {});
