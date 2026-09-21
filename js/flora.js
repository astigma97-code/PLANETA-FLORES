/* js/flora.js
   El jardín: un sol hecho de flores en el centro, y anillos de flores
   alrededor —como los de Saturno, pero de pétalos—. Unas pocas flores
   más grandes derivan sueltas cerca de los anillos.
*/
(function (C) {
  'use strict';

  var grupo, nucleo, halo, anillos = [], sueltas = [];
  var reducido = C.prefiereMenosMovimiento();

  // Pares [pétalo-claro, pétalo-oscuro, centro-claro, centro-oscuro] por capa,
  // de más cálido/claro (cerca del sol) a más profundo (anillo exterior).
  var PALETA_ANILLOS = [
    ['#fff3c4', '#ffb545', '#fff8dc', '#ffcf6b'],
    ['#ffdf8a', '#ff9d3d', '#fff1c9', '#ffb453'],
    ['#ffc46b', '#f97a4d', '#ffe2a8', '#ff9a5c'],
    ['#ff9e7a', '#e85f7a', '#ffd0a8', '#ff8a7a'],
    ['#ffb0c9', '#d6598f', '#ffe3ea', '#ff9fb8'],
  ];

  function construir() {
    grupo = new THREE.Group();

    grupo.add(crearHalo());
    grupo.add(crearNucleo());
    for (var i = 0; i < PALETA_ANILLOS.length; i++) {
      var anillo = crearAnillo(i);
      anillos.push(anillo);
      grupo.add(anillo);
    }
    crearSueltas().forEach(function (s) { grupo.add(s.sprite); sueltas.push(s); });

    C.escena.obtener().add(grupo);
    C.escena.alActualizar(actualizar);
  }

  function crearHalo() {
    var mapa = new THREE.CanvasTexture(C.texturaResplandor('rgba(255,236,180,.95)', 'rgba(255,140,60,0)', 256));
    var mat = new THREE.SpriteMaterial({ map: mapa, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(78, 78, 1);
    halo = sprite;
    return sprite;
  }

  // El núcleo: un racimo esférico de florecitas muy juntas, como un sol de pétalos.
  function crearNucleo() {
    var n = Math.round(340 * C.factorCalidad);
    var pos = new Float32Array(n * 3);
    var tam = new Float32Array(n);
    var color = new Float32Array(n * 3);
    var tonos = [[1, 0.95, 0.7], [1, 0.82, 0.42], [1, 0.68, 0.3], [1, 0.9, 0.6]];

    for (var i = 0; i < n; i++) {
      var r = 13 * Math.cbrt(Math.random());
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(C.azar(-1, 1));
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      tam[i] = C.azar(5, 9);
      var t = C.elegir(tonos);
      color[i * 3] = t[0]; color[i * 3 + 1] = t[1]; color[i * 3 + 2] = t[2];
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('tam', new THREE.BufferAttribute(tam, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(color, 3));

    var mapa = new THREE.CanvasTexture(C.texturaFlor('#fffbe6', '#ffb545', '#fff3c4', '#ff8a2e', 96));
    var mat = materialParticula(mapa);
    nucleo = new THREE.Points(geo, mat);
    return nucleo;
  }

  function crearAnillo(indice) {
    var col = PALETA_ANILLOS[indice];
    var radioBase = 26 + indice * 13.5;
    var n = Math.round((90 + indice * 26) * C.factorCalidad);

    var pos = new Float32Array(n * 3);
    var tam = new Float32Array(n);
    var color = new Float32Array(n * 3);

    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2 + C.azar(-0.05, 0.05);
      var r = radioBase + C.azar(-3.2, 3.2);
      pos[i * 3] = Math.cos(ang) * r;
      pos[i * 3 + 1] = C.azar(-1.6, 1.6);
      pos[i * 3 + 2] = Math.sin(ang) * r;
      tam[i] = C.azar(3.4, 6.6);
      var brillo = C.azar(0.82, 1.12);
      color[i * 3] = brillo; color[i * 3 + 1] = brillo; color[i * 3 + 2] = brillo;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('tam', new THREE.BufferAttribute(tam, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(color, 3));

    var mapa = new THREE.CanvasTexture(C.texturaFlor(col[0], col[1], col[2], col[3], 96));
    var mat = materialParticula(mapa);
    var puntos = new THREE.Points(geo, mat);
    puntos.userData.velocidad = 0.05 + indice * 0.018;
    return puntos;
  }

  // Un puñado de flores grandes, sueltas, que derivan alrededor del jardín.
  function crearSueltas() {
    if (reducido) return [];
    var n = 7;
    var lista = [];
    for (var i = 0; i < n; i++) {
      var col = C.elegir(PALETA_ANILLOS);
      var mapa = new THREE.CanvasTexture(C.texturaFlor(col[0], col[1], col[2], col[3], 96));
      var mat = new THREE.SpriteMaterial({ map: mapa, transparent: true, depthWrite: false });
      var sprite = new THREE.Sprite(mat);
      var escala = C.azar(6, 11);
      sprite.scale.set(escala, escala, 1);
      lista.push({
        sprite: sprite,
        radio: C.azar(48, 92),
        altura: C.azar(-14, 22),
        angulo: Math.random() * Math.PI * 2,
        velocidad: C.azar(0.03, 0.09) * (Math.random() < 0.5 ? -1 : 1),
        bamboleo: C.azar(2, 5),
        faseBamboleo: Math.random() * 6.28,
      });
    }
    return lista;
  }

  function materialParticula(mapa) {
    return new THREE.PointsMaterial({
      map: mapa, size: 6, sizeAttenuation: true, vertexColors: true,
      transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    });
  }

  function actualizar(dt, t) {
    if (!grupo) return;
    if (!reducido) {
      grupo.rotation.y += dt * 0.018;
      var pulso = 1 + Math.sin(t * 0.7) * 0.05;
      halo.scale.set(78 * pulso, 78 * pulso, 1);
      anillos.forEach(function (a) { a.rotation.y += dt * a.userData.velocidad; });
    }
    sueltas.forEach(function (s) {
      s.angulo += dt * s.velocidad;
      var y = s.altura + Math.sin(t * 0.6 + s.faseBamboleo) * s.bamboleo;
      s.sprite.position.set(Math.cos(s.angulo) * s.radio, y, Math.sin(s.angulo) * s.radio);
    });
  }

  C.flora = {
    construir: construir,
    grupo: function () { return grupo; },
  };

})(window.Cielo = window.Cielo || {});
