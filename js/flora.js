/* js/flora.js
   El jardín: un sol sólido y luminoso en el centro, y anillos de flores
   alrededor —como los de Saturno, pero de pétalos—. Unas pocas flores
   más grandes derivan sueltas cerca de los anillos.
*/
(function (C) {
  'use strict';

  var grupo, sol, halo, detallesSol, anillos = [], sueltas = [];
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
    grupo.add(crearSol());
    grupo.add(crearDetallesSol());
    for (var i = 0; i < PALETA_ANILLOS.length; i++) {
      var anillo = crearAnillo(i);
      anillos.push(anillo);
      grupo.add(anillo);
    }
    crearSueltas().forEach(function (s) { grupo.add(s.sprite); sueltas.push(s); });

    C.escena.obtener().add(grupo);
    C.escena.alActualizar(actualizar);
  }

  function crearSol() {
    var geometria = new THREE.SphereGeometry(10.5, 32, 20);
    var material = new THREE.MeshBasicMaterial({
      color: 0xffd36b,
      transparent: true,
      opacity: 0.98,
    });
    sol = new THREE.Mesh(geometria, material);
    return sol;
  }

  function crearDetallesSol() {
    detallesSol = new THREE.Group();
    var mapa = new THREE.CanvasTexture(C.texturaResplandor('rgba(255,255,220,.95)', 'rgba(255,145,45,0)', 64));

    for (var i = 0; i < 3; i++) {
      var corona = new THREE.Mesh(
        new THREE.TorusGeometry(10.9 + i * 0.65, 0.12 + i * 0.035, 8, 64),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? 0xfff0a5 : 0xff9b42,
          transparent: true,
          opacity: 0.2 - i * 0.035,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      corona.rotation.set(0.5 + i * 0.28, i * 0.7, i * 0.45);
      detallesSol.add(corona);
    }

    for (var j = 0; j < 7; j++) {
      var mancha = new THREE.Sprite(new THREE.SpriteMaterial({
        map: mapa,
        color: j % 2 ? 0xff9a32 : 0xffe38a,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      var angulo = (Math.PI * 2 * j) / 7 + 0.2;
      var radio = 10.2;
      mancha.position.set(
        Math.cos(angulo) * radio,
        Math.sin(angulo * 1.7) * 5.2,
        Math.sin(angulo) * radio
      );
      mancha.scale.setScalar(C.azar(0.8, 1.7));
      detallesSol.add(mancha);
    }

    return detallesSol;
  }

  function crearHalo() {
    var mapa = new THREE.CanvasTexture(C.texturaResplandor('rgba(255,236,180,.95)', 'rgba(255,140,60,0)', 256));
    var mat = new THREE.SpriteMaterial({ map: mapa, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(78, 78, 1);
    halo = sprite;
    return sprite;
  }

  function crearAnillo(indice) {
    var col = PALETA_ANILLOS[indice];
    var radioBase = 26 + indice * 13.5;
    var n = Math.round((420 + indice * 105) * C.factorCalidad);

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
      sol.scale.setScalar(1 + Math.sin(t * 1.3) * 0.025);
      if (detallesSol) {
        detallesSol.rotation.y += dt * 0.025;
        detallesSol.rotation.x = Math.sin(t * 0.18) * 0.025;
        detallesSol.children.forEach(function (detalle, indice) {
          if (detalle.material && indice < 3) {
            detalle.material.opacity = 0.14 + Math.sin(t * 0.8 + indice) * 0.04;
          }
        });
      }
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
