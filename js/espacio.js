/* js/espacio.js
   El cielo: estrellas que titilan, constelaciones, el polvo de nebulosa que
   flota alrededor del jardín y las estrellas fugaces (las que se lanzan
   solas de a poco, y la que se lanza al tocar el cielo para pedir un deseo).
*/
(function (C) {
  'use strict';

  var grupo, estrellas, constelaciones, nebulosa;
  var fugaces = [];
  var raycaster, mapaDestello, texturaFugaz;
  var proximaLluvia = 0;
  var reducido = C.prefiereMenosMovimiento();

  function construir() {
    grupo = new THREE.Group();

    mapaDestello = new THREE.CanvasTexture(C.texturaDestello(64));
    texturaFugaz = new THREE.CanvasTexture(construirTexturaEstela());
    raycaster = new THREE.Raycaster();

    grupo.add(crearEstrellas());
    grupo.add(crearConstelaciones());
    grupo.add(crearNebulosa());

    C.escena.obtener().add(grupo);
    C.escena.alActualizar(actualizar);

    proximaLluvia = C.azar(1500, 3500);
  }

  // -- Estrellas con titileo (shader propio: el tamaño de cada una respira) --
  function crearEstrellas() {
    var n = Math.round(2600 * C.factorCalidad);
    var pos = new Float32Array(n * 3);
    var tam = new Float32Array(n);
    var fase = new Float32Array(n);
    var color = new Float32Array(n * 3);

    var paleta = [
      [1, 0.98, 0.92], [1, 0.93, 0.78], [0.85, 0.92, 1], [1, 1, 1],
    ];

    for (var i = 0; i < n; i++) {
      var r = C.azar(220, 1200);
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(C.azar(-1, 1));
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      tam[i] = C.azar(1.1, 3.2);
      fase[i] = Math.random() * Math.PI * 2;
      var col = C.elegir(paleta);
      color[i * 3] = col[0]; color[i * 3 + 1] = col[1]; color[i * 3 + 2] = col[2];
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('tam', new THREE.BufferAttribute(tam, 1));
    geo.setAttribute('fase', new THREE.BufferAttribute(fase, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(color, 3));

    var mat = materialEstrella(mapaDestello, !reducido);
    var puntos = new THREE.Points(geo, mat);
    puntos.frustumCulled = false;
    estrellas = puntos;
    return puntos;
  }

  function materialEstrella(mapa, animar) {
    return new THREE.ShaderMaterial({
      uniforms: { mapa: { value: mapa }, tiempo: { value: 0 }, animar: { value: animar ? 1 : 0 } },
      vertexShader: [
        'attribute float tam;', 'attribute float fase;',
        'varying float vOp;', 'varying vec3 vColor;',
        'uniform float tiempo;', 'uniform float animar;',
        'void main() {',
        '  vColor = color;',
        '  float parp = animar > 0.5 ? (0.55 + 0.45 * sin(tiempo * 1.6 + fase)) : 0.85;',
        '  vOp = parp;',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = tam * parp * (300.0 / -mv.z);',
        '  gl_Position = projectionMatrix * mv;',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D mapa;', 'varying float vOp;', 'varying vec3 vColor;',
        'void main() {',
        '  vec4 tex = texture2D(mapa, gl_PointCoord);',
        '  gl_FragColor = vec4(vColor, 1.0) * tex * vOp;',
        '}',
      ].join('\n'),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  // -- Constelaciones: unas cuantas figuras de líneas fijas en la bóveda --
  function crearConstelaciones() {
    var figuras = [
      [[0, 0], [1, 0.4], [1.8, 0.1], [2.6, 0.7], [1.6, 1.4]],
      [[0, 0], [0.9, 0.6], [1.9, 0.3], [1.5, -0.7], [0.4, -0.5]],
      [[0, 0.6], [0.8, 0], [1.6, 0.5], [2.2, -0.2]],
      [[0, 0], [1.1, 0.3], [2.0, -0.1], [2.6, 0.6], [1.8, 1.1], [0.9, 0.9]],
      [[0, 0], [0.7, -0.6], [1.6, -0.4], [1.9, 0.5]],
    ];

    var posLineas = [], posEstrellas = [];
    var radio = 850;

    figuras.forEach(function (figura) {
      var dir = new THREE.Vector3(C.azar(-1, 1), C.azar(-0.35, 0.5), C.azar(-1, 1)).normalize();
      var arriba = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      var derecha = new THREE.Vector3().crossVectors(arriba, dir).normalize();
      var subir = new THREE.Vector3().crossVectors(dir, derecha).normalize();
      var escala = C.azar(38, 70);

      var centro = dir.clone().multiplyScalar(radio);
      var puntos = figura.map(function (p) {
        return centro.clone()
          .addScaledVector(derecha, (p[0] - 1) * escala)
          .addScaledVector(subir, (p[1] - 0.3) * escala);
      });

      for (var i = 0; i < puntos.length - 1; i++) {
        posLineas.push(puntos[i].x, puntos[i].y, puntos[i].z);
        posLineas.push(puntos[i + 1].x, puntos[i + 1].y, puntos[i + 1].z);
      }
      puntos.forEach(function (p) { posEstrellas.push(p.x, p.y, p.z); });
    });

    var geoLineas = new THREE.BufferGeometry();
    geoLineas.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posLineas), 3));
    var matLineas = new THREE.LineBasicMaterial({
      color: 0xd9b878, transparent: true, opacity: 0.28,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    var lineas = new THREE.LineSegments(geoLineas, matLineas);

    var n = posEstrellas.length / 3;
    var tam = new Float32Array(n).fill(2.6);
    var fase = new Float32Array(n);
    var color = new Float32Array(n * 3);
    for (var j = 0; j < n; j++) { fase[j] = Math.random() * 6.28; color[j*3]=1; color[j*3+1]=0.95; color[j*3+2]=0.82; }
    var geoEstrellas = new THREE.BufferGeometry();
    geoEstrellas.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posEstrellas), 3));
    geoEstrellas.setAttribute('tam', new THREE.BufferAttribute(tam, 1));
    geoEstrellas.setAttribute('fase', new THREE.BufferAttribute(fase, 1));
    geoEstrellas.setAttribute('color', new THREE.BufferAttribute(color, 3));
    var puntosEstrellas = new THREE.Points(geoEstrellas, materialEstrella(mapaDestello, !reducido));

    var g = new THREE.Group();
    g.add(lineas); g.add(puntosEstrellas);
    constelaciones = g;
    return g;
  }

  // -- Polvo cálido (rosa/violeta) flotando en la parte baja de la escena --
  function crearNebulosa() {
    var n = Math.round(900 * C.factorCalidad);
    var pos = new Float32Array(n * 3);
    var tam = new Float32Array(n);
    var color = new Float32Array(n * 3);
    var paleta = [
      [1, 0.4, 0.66], [0.95, 0.3, 0.55], [1, 0.62, 0.42], [0.8, 0.35, 0.7],
    ];
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var r = Math.pow(Math.random(), 0.5) * 210 + 40;
      pos[i * 3] = Math.cos(ang) * r + C.azar(-30, 30);
      pos[i * 3 + 1] = C.azar(-70, -8) - r * 0.06;
      pos[i * 3 + 2] = Math.sin(ang) * r + C.azar(-30, 30);
      tam[i] = C.azar(3, 9);
      var col = C.elegir(paleta);
      color[i * 3] = col[0]; color[i * 3 + 1] = col[1]; color[i * 3 + 2] = col[2];
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('tam', new THREE.BufferAttribute(tam, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(color, 3));

    var mapa = new THREE.CanvasTexture(C.texturaMota('rgba(255,255,255,1)', 48));
    var mat = new THREE.PointsMaterial({
      map: mapa, size: 6, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    var puntos = new THREE.Points(geo, mat);
    nebulosa = puntos;
    return puntos;
  }

  // -- Estrellas fugaces --
  function construirTexturaEstela() {
    var w = 220, h = 24;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.82, 'rgba(255,250,235,.55)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w * 0.7, h / 2, w * 0.5, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    return c;
  }

  function lanzarEstrellaFugaz(xNdc, yNdc) {
    if (fugaces.length > 7) return;
    var camara = C.escena.camara();
    var origen;
    if (typeof xNdc === 'number') {
      raycaster.setFromCamera({ x: xNdc, y: yNdc }, camara);
      origen = raycaster.ray.at(C.azar(160, 260), new THREE.Vector3());
    } else {
      var theta = Math.random() * Math.PI * 2;
      origen = new THREE.Vector3(Math.cos(theta) * 300, C.azar(60, 220), Math.sin(theta) * 300);
    }

    var direccion = new THREE.Vector3(C.azar(-1, 1), C.azar(-0.6, -0.15), C.azar(-1, 1)).normalize();
    var largo = C.azar(30, 55);
    var vel = direccion.clone().multiplyScalar(C.azar(220, 320));

    var mat = new THREE.SpriteMaterial({
      map: texturaFugaz, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(largo, largo * 0.11, 1);
    sprite.position.copy(origen);
    grupo.add(sprite);

    fugaces.push({ sprite: sprite, vel: vel, edad: 0, vida: C.azar(0.9, 1.4), dir: direccion.clone() });
  }

  function actualizarFugaces(dt) {
    for (var i = fugaces.length - 1; i >= 0; i--) {
      var f = fugaces[i];
      f.edad += dt;
      var t = f.edad / f.vida;
      if (t >= 1) {
        grupo.remove(f.sprite);
        f.sprite.material.dispose();
        fugaces.splice(i, 1);
        continue;
      }
      f.sprite.position.addScaledVector(f.vel, dt);
      var op = t < 0.15 ? t / 0.15 : (t > 0.7 ? (1 - t) / 0.3 : 1);
      f.sprite.material.opacity = op;

      f.sprite.material.rotation = Math.atan2(f.dir.y, f.dir.x);
    }
  }

  function actualizar(dt, t) {
    if (estrellas) estrellas.material.uniforms.tiempo.value = t;
    if (constelaciones) constelaciones.children[1].material.uniforms.tiempo.value = t;
    if (!reducido) grupo.rotation.y += dt * 0.0025;

    actualizarFugaces(dt);

    if (!reducido) {
      proximaLluvia -= dt * 1000;
      if (proximaLluvia <= 0) {
        lanzarEstrellaFugaz();
        proximaLluvia = C.azar(C.config.lluviaMinMs, C.config.lluviaMaxMs);
      }
    }
  }

  C.espacio = {
    construir: construir,
    lanzarEstrellaFugaz: lanzarEstrellaFugaz,
  };

})(window.Cielo = window.Cielo || {});
