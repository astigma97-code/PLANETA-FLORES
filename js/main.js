/* js/main.js
   Arranca todo: pone el nombre donde corresponde y conecta el botón de
   entrada. El resto de los módulos ya se construyeron solos al cargar
   (cada uno se anota en `window.Cielo`); acá solo se los hace hablar entre sí.
*/
(function (C) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var nombre = C.config.nombre;

    var lineaNombre = document.getElementById('linea-nombre');
    if (nombre) lineaNombre.textContent = 'para ' + nombre;

    var firma = document.getElementById('firma');
    firma.textContent = nombre ? C.conNombre(C.datos.firmaConNombre, nombre) : C.datos.firma;

    C.audio.construir();
    C.intro.construir();

    var params = new URLSearchParams(location.search);
    if (params.has('directo')) {
      setTimeout(function () { C.intro.entrar(); }, 150);
    }
  });

})(window.Cielo = window.Cielo || {});
