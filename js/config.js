/* js/config.js
   Lo único que hace falta tocar para ajustar el comportamiento (no las palabras,
   esas están en js/datos.js).
*/
(function (C) {
  'use strict';

  // Para poner el nombre sin usar el enlace ?para=Nombre, escríbelo aquí:
  var NOMBRE_FIJO = '';

  var MAX_NOMBRE = 40;
  var params = new URLSearchParams(window.location.search);
  var deLaUrl = (params.get('para') || '').trim().slice(0, MAX_NOMBRE);

  C.config = {
    nombre: deLaUrl || NOMBRE_FIJO.trim().slice(0, MAX_NOMBRE),

    // Ritmo de las frases grandes.
    primeraFraseMs: 2600,
    duracionFraseMs: 6200,
    pausaFraseMinMs: 2400,
    pausaFraseMaxMs: 4600,

    // Ritmo de las etiquetas flotantes en el jardín 3D.
    primeraEtiquetaMs: 4200,
    duracionEtiquetaMs: 5200,
    pausaEtiquetaMinMs: 3200,
    pausaEtiquetaMaxMs: 6000,

    // Música: assets/musica.mp3. Volumen de 0 a 1 y milisegundos del fundido.
    volumen: 0.55,
    fundidoMs: 1800,

    // El vuelo inicial hacia el jardín, al tocar «entrar».
    duracionViajeMs: 3400,

    // Velocidad de la órbita de la cámara alrededor del jardín (1 = normal).
    velocidadOrbita: 1,

    // Cada cuánto puede aparecer sola una estrella fugaz (además de las que
    // se lanzan al tocar el cielo). En milisegundos, [mínimo, máximo].
    lluviaMinMs: 5000,
    lluviaMaxMs: 11000,
  };

})(window.Cielo = window.Cielo || {});
