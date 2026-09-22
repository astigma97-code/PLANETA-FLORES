/* js/espacio.js
   El cielo: estrellas que titilan, constelaciones, el polvo de nebulosa que
   flota alrededor del jardín y los cometas que se lanzan al tocar el cielo.
*/
(function (C) {
  'use strict';

  var grupo, estrellas, constelaciones, nebulosa, polvoCosmico, cuerposLejanos = [], fuegos = [], auroras = [], fondos = [], detalles = [];
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
    grupo.add(crearPolvoCosmico());
    grupo.add(crearPlanetasLejanos());
    grupo.add(crearSupernovas());
    grupo.add(crearFuegosArtificiales());
    grupo.add(crearAuroras());
    grupo.add(crearGalaxiasNebulosas());
    grupo.add(crearDetallesCosmicos());

    C.escena.obtener().add(grupo);
    C.escena.alActualizar(actualizar);

    proximaLluvia = Infinity;
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

  function crearPolvoCosmico() {
    var g = new THREE.Group();
    var capas = [
      { cantidad: 900, color: [1, 0.28, 0.7], radio: 420, alto: 260 },
      { cantidad: 700, color: [0.25, 0.65, 1], radio: 620, alto: 360 },
      { cantidad: 500, color: [1, 0.62, 0.22], radio: 820, alto: 440 },
    ];
    capas.forEach(function (capa, indice) {
      var pos = new Float32Array(capa.cantidad * 3);
      var colores = new Float32Array(capa.cantidad * 3);
      for (var i = 0; i < capa.cantidad; i++) {
        var angulo = Math.random() * 6.28;
        var radio = Math.sqrt(Math.random()) * capa.radio;
        pos[i * 3] = Math.cos(angulo) * radio + C.azar(-120, 120);
        pos[i * 3 + 1] = C.azar(-capa.alto, capa.alto);
        pos[i * 3 + 2] = Math.sin(angulo) * radio - 260;
        var brillo = C.azar(0.35, 1);
        colores[i * 3] = capa.color[0] * brillo;
        colores[i * 3 + 1] = capa.color[1] * brillo;
        colores[i * 3 + 2] = capa.color[2] * brillo;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colores, 3));
      var puntos = new THREE.Points(geo, new THREE.PointsMaterial({
        map: new THREE.CanvasTexture(C.texturaMota('rgba(255,255,255,.9)', 32)),
        size: indice === 0 ? 4 : 5.5, sizeAttenuation: true,
        vertexColors: true, transparent: true,
        opacity: indice === 0 ? 0.22 : 0.13,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      puntos.userData = { velocidad: 0.0008 + indice * 0.0006 };
      g.add(puntos);
    });
    polvoCosmico = g;
    return g;
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

  function texturaCometa(colores) {
    var c = document.createElement('canvas'); c.width = 900; c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 900, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.58, colores[0]);
    g.addColorStop(0.8, colores[1]);
    g.addColorStop(0.95, colores[2]);
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g; ctx.shadowColor = colores[1]; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.ellipse(650, 32, 270, 19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.beginPath(); ctx.arc(760, 32, 10, 0, Math.PI * 2); ctx.fill();
    return c;
  }

  function crearPlanetasLejanos() {
    var g = new THREE.Group();
    var colores = [0x596dff, 0xff6f9f, 0x42d7c4, 0xffb84f, 0xa579ff, 0x6cb6ff];
    for (var i = 0; i < 16; i++) {
      var planeta = crearPlanetaSolido(C.elegir(colores), C.azar(3.5, 8.5));
      var ang = Math.random() * Math.PI * 2, radio = C.azar(300, 720);
      planeta.position.set(Math.cos(ang) * radio, C.azar(-130, 180), Math.sin(ang) * radio);
      planeta.userData = { angulo: ang, radio: radio, velocidad: C.azar(-0.012, 0.012), altura: planeta.position.y };
      g.add(planeta); cuerposLejanos.push(planeta);
    }

    for (var j = 0; j < 4; j++) {
      var sistema = new THREE.Group();
      var centro = crearPlanetaSolido(C.elegir(colores), C.azar(7, 13));
      sistema.add(centro);
      for (var k = 0; k < C.azarEntero(2, 4); k++) {
        var luna = crearPlanetaSolido(C.elegir(colores), C.azar(2, 4.5));
        var orbita = C.azar(18, 30), fase = Math.random() * 6.28;
        luna.userData = { orbita: orbita, fase: fase, velocidad: C.azar(0.18, 0.42) };
        luna.position.set(Math.cos(fase) * orbita, C.azar(-3, 3), Math.sin(fase) * orbita);
        sistema.add(luna);
      }
      var anguloSistema = Math.random() * 6.28, radioSistema = C.azar(430, 760);
      sistema.position.set(Math.cos(anguloSistema) * radioSistema, C.azar(-100, 190), Math.sin(anguloSistema) * radioSistema);
      sistema.userData = { angulo: anguloSistema, radio: radioSistema, velocidad: C.azar(-0.009, 0.009), grupoPlanetario: true };
      g.add(sistema);
      cuerposLejanos.push(sistema);
    }
    return g;
  }

  function crearPlanetaSolido(color, radio) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radio, 16, 12),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.92 })
    );
  }

  function crearSupernovas() {
    var g = new THREE.Group();
    var mapa = new THREE.CanvasTexture(C.texturaResplandor('rgba(255,255,255,1)', 'rgba(255,90,180,0)', 128));
    for (var i = 0; i < 6; i++) {
      var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: mapa, color: i % 2 ? 0xff8bd8 : 0x8bc7ff,
        transparent: true, opacity: C.azar(0.35, 0.8), depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      sprite.scale.setScalar(C.azar(12, 26));
      sprite.position.set(C.azar(-520, 520), C.azar(-160, 260), C.azar(-700, -300));
      sprite.userData = { fase: Math.random() * 6.28, base: sprite.scale.x };
      g.add(sprite); cuerposLejanos.push(sprite);
    }

    var corazon = new THREE.Shape();
    corazon.moveTo(0, 4); corazon.bezierCurveTo(-18, -8, -13, -20, 0, -10);
    corazon.bezierCurveTo(13, -20, 18, -8, 0, 4);
    var puntos = corazon.getPoints(40).map(function (p) {
      return new THREE.Vector3(p.x, p.y, 0);
    });
    var linea = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(puntos),
      new THREE.LineBasicMaterial({ color: 0xff6fae, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending })
    );
    linea.position.set(360, 150, -630); linea.scale.setScalar(1.7);
    g.add(linea);

    for (var j = 0; j < 3; j++) {
      var explosion = new THREE.Group();
      var centro = new THREE.Sprite(new THREE.SpriteMaterial({
        map: mapa, color: 0xffb36b, transparent: true, opacity: 0.7,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      var escalaExplosion = C.azar(0.65, 1.8);
      centro.scale.setScalar(18 * escalaExplosion);
      explosion.add(centro);
      for (var k = 0; k < 7; k++) {
        var rayo = new THREE.Mesh(
          new THREE.TorusGeometry(C.azar(10, 19), 0.55, 6, 24),
          new THREE.MeshBasicMaterial({ color: k % 2 ? 0xff6d9e : 0xffd36b, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending })
        );
        rayo.rotation.x = C.azar(-0.7, 0.7); rayo.rotation.z = Math.random() * 6.28;
        rayo.scale.setScalar(C.azar(0.7, 1.4));
        explosion.add(rayo);
      }
      explosion.position.set(C.azar(-500, 500), C.azar(-120, 170), C.azar(-720, -420));
      explosion.userData = {
        fase: Math.random() * 6.28,
        base: escalaExplosion,
        brillo: C.azar(0.75, 1.35),
      };
      g.add(explosion); cuerposLejanos.push(explosion);
    }
    return g;
  }

  function crearFuegosArtificiales() {
    var g = new THREE.Group();
    var paleta = [0xff79b7, 0xffcf68, 0x7ee8ff, 0xb68cff, 0x8dffc9];
    for (var i = 0; i < 5; i++) {
      var estallido = new THREE.Group();
      var posiciones = [];
      for (var j = 0; j < 18; j++) {
        var angulo = (Math.PI * 2 * j) / 18;
        var radio = C.azar(15, 28);
        posiciones.push(0, 0, 0, Math.cos(angulo) * radio, Math.sin(angulo) * radio, C.azar(-3, 3));
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
      var material = new THREE.LineBasicMaterial({
        color: C.elegir(paleta), transparent: true, opacity: 0.78,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      estallido.add(new THREE.LineSegments(geo, material));
      var resplandor = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(C.texturaResplandor('rgba(255,255,255,1)', 'rgba(255,100,180,0)', 96)),
        color: C.elegir(paleta), transparent: true, opacity: 0.8,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      resplandor.scale.setScalar(20);
      estallido.add(resplandor);
      estallido.position.set(C.azar(-560, 560), C.azar(-150, 230), C.azar(-760, -480));
      estallido.scale.setScalar(0.05);
      estallido.userData = {
        fase: C.azar(0, 6.28),
        duracion: C.azar(2.8, 5.5),
        retraso: C.azar(0, 4),
        tamano: C.azar(0.55, 2.2),
        brillo: C.azar(0.75, 1.4),
      };
      g.add(estallido);
      fuegos.push(estallido);
    }
    return g;
  }

  function crearAuroras() {
    var g = new THREE.Group();
    var colores = [0x8d7bff, 0xff79be, 0x55e5d0];
    for (var i = 0; i < 3; i++) {
      var puntos = [];
      for (var j = 0; j <= 18; j++) {
        var x = -520 + j * 58;
        var y = 245 + Math.sin(j * 0.55 + i * 1.7) * 26 + i * 24;
        puntos.push(new THREE.Vector3(x, y, -640 - i * 22));
      }
      var linea = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(puntos),
        new THREE.LineBasicMaterial({
          color: colores[i], transparent: true, opacity: 0.1,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      linea.userData = { fase: i * 1.8 };
      g.add(linea);
      auroras.push(linea);
    }
    return g;
  }

  function crearGalaxiasNebulosas() {
    var g = new THREE.Group();
    var colores = [0xff6fb5, 0x8b7dff, 0x59d9e8, 0xffb85c, 0xb77dff];
    for (var i = 0; i < 8; i++) {
      var galaxia = new THREE.Group();
      var color = C.elegir(colores);
      var halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(C.texturaResplandor('rgba(255,255,255,.72)', 'rgba(100,80,255,0)', 128)),
        color: color, transparent: true, opacity: C.azar(0.12, 0.3),
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      halo.scale.setScalar(C.azar(34, 72));
      galaxia.add(halo);
      var puntos = [];
      for (var j = 0; j < 80; j++) {
        var angulo = j * 0.42;
        var radio = 2 + j * 0.48;
        puntos.push(new THREE.Vector3(
          Math.cos(angulo) * radio,
          Math.sin(angulo) * radio * 0.42,
          Math.sin(j * 0.7) * 2
        ));
      }
      var espiral = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(puntos),
        new THREE.LineBasicMaterial({
          color: color, transparent: true, opacity: C.azar(0.3, 0.7),
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      espiral.scale.setScalar(C.azar(1.2, 2.4));
      espiral.rotation.z = C.azar(-0.5, 0.5);
      galaxia.add(espiral);
      galaxia.position.set(C.azar(-650, 650), C.azar(-220, 300), C.azar(-920, -520));
      galaxia.rotation.z = Math.random() * 6.28;
      galaxia.userData = { fase: Math.random() * 6.28, base: galaxia.scale.x };
      g.add(galaxia);
      fondos.push(galaxia);
    }

    for (var k = 0; k < 7; k++) {
      var nube = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(C.texturaResplandor('rgba(255,190,240,.22)', 'rgba(50,130,255,0)', 256)),
        color: C.elegir(colores), transparent: true, opacity: C.azar(0.08, 0.2),
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      nube.scale.set(C.azar(130, 260), C.azar(50, 120), 1);
      nube.position.set(C.azar(-700, 700), C.azar(-260, 280), C.azar(-980, -580));
      nube.material.rotation = C.azar(-0.6, 0.6);
      g.add(nube);
      fondos.push(nube);
    }
    return g;
  }

  function crearDetallesCosmicos() {
    var g = new THREE.Group();
    var colores = [0xffd58a, 0x9bdcff, 0xffa8d7, 0xbba7ff];

    for (var i = 0; i < 6; i++) {
      var n = 35 + C.azarEntero(0, 25);
      var posiciones = new Float32Array(n * 3);
      for (var j = 0; j < n; j++) {
        var angulo = Math.random() * 6.28;
        var radio = Math.sqrt(Math.random()) * C.azar(18, 42);
        posiciones[j * 3] = Math.cos(angulo) * radio;
        posiciones[j * 3 + 1] = Math.sin(angulo) * radio * 0.55;
        posiciones[j * 3 + 2] = C.azar(-6, 6);
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
      var cluster = new THREE.Points(geo, new THREE.PointsMaterial({
        color: C.elegir(colores), size: C.azar(1.2, 2.4),
        transparent: true, opacity: C.azar(0.28, 0.65),
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      cluster.position.set(C.azar(-700, 700), C.azar(-240, 280), C.azar(-1000, -560));
      cluster.rotation.z = Math.random() * 6.28;
      cluster.userData = { fase: Math.random() * 6.28, velocidad: C.azar(-0.012, 0.012) };
      g.add(cluster);
      detalles.push(cluster);
    }

    for (var k = 0; k < 12; k++) {
      var chispa = new THREE.Sprite(new THREE.SpriteMaterial({
        map: mapaDestello, color: C.elegir(colores),
        transparent: true, opacity: 0, depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      chispa.scale.setScalar(C.azar(2.5, 5.5));
      chispa.position.set(C.azar(-620, 620), C.azar(-180, 240), C.azar(-850, -390));
      chispa.userData = { fase: Math.random() * 6.28, ritmo: C.azar(0.7, 1.8), base: chispa.material.opacity };
      g.add(chispa);
      detalles.push(chispa);
    }

    for (var m = 0; m < 4; m++) {
      var sendero = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-90, 0, 0),
          new THREE.Vector3(-30, 3, 2),
          new THREE.Vector3(30, -2, -1),
          new THREE.Vector3(90, 0, 0),
        ]),
        new THREE.LineBasicMaterial({
          color: C.elegir(colores), transparent: true, opacity: 0.15,
          depthWrite: false, blending: THREE.AdditiveBlending,
        })
      );
      sendero.position.set(C.azar(-650, 650), C.azar(-180, 260), C.azar(-900, -500));
      sendero.rotation.set(C.azar(-0.5, 0.5), C.azar(-0.5, 0.5), Math.random() * 6.28);
      sendero.scale.setScalar(C.azar(0.8, 1.8));
      sendero.userData = { fase: Math.random() * 6.28 };
      g.add(sendero);
      detalles.push(sendero);
    }
    return g;
  }

  function lanzarEstrellaFugaz(xNdc, yNdc) {
    if (fugaces.length > 10) {
      var antigua = fugaces.shift();
      grupo.remove(antigua.sprite);
      grupo.remove(antigua.brillo);
      antigua.sprite.material.dispose();
      antigua.brillo.material.dispose();
    }
    var camara = C.escena.camara();
    var frente = camara.getWorldDirection(new THREE.Vector3());
    var profundidad = C.elegir([125, 265, 430]);
    var centro = camara.position.clone().add(frente.clone().multiplyScalar(profundidad));
    var derecha = new THREE.Vector3().setFromMatrixColumn(camara.matrixWorld, 0);
    var arriba = new THREE.Vector3().setFromMatrixColumn(camara.matrixWorld, 1);
    var variacion = C.azar(-24, 24);
    var nivel = C.azar(-105, 105);
    var profundidadVariable = C.azar(-24, 24);
    var origen = centro.clone()
      .addScaledVector(derecha, -620 + variacion)
      .addScaledVector(arriba, nivel)
      .addScaledVector(frente, profundidadVariable);
    var destino = centro.clone()
      .addScaledVector(derecha, 620 + variacion)
      .addScaledVector(arriba, nivel)
      .addScaledVector(frente, profundidadVariable);
    var direccion = destino.clone().sub(origen).normalize();
    var distancia = origen.distanceTo(destino);
    var vida = C.azar(10, 14);
    var vel = direccion.clone().multiplyScalar(distancia / vida);
    var largo = C.azar(95, 135);

    var paletas = [
      ['rgba(255,99,196,.15)', 'rgba(255,151,214,.75)', 'rgba(255,230,151,.98)'],
      ['rgba(80,177,255,.15)', 'rgba(115,217,255,.78)', 'rgba(213,164,255,.98)'],
      ['rgba(80,255,195,.12)', 'rgba(130,255,205,.72)', 'rgba(255,255,255,.98)'],
      ['rgba(255,71,133,.15)', 'rgba(255,122,139,.78)', 'rgba(255,205,109,.98)'],
    ];
    var mat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(texturaCometa(C.elegir(paletas))), transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(largo, largo * 0.11, 1);
    sprite.position.copy(origen);
    sprite.renderOrder = 1;
    sprite.material.depthTest = true;
    grupo.add(sprite);

    var brillo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: mapaDestello,
      color: C.elegir([0xfff4be, 0xffa8ef, 0x9ee8ff, 0xffffff]),
      transparent: true, opacity: 0.95, depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    brillo.scale.setScalar(C.azar(9, 14));
    brillo.position.copy(origen);
    brillo.renderOrder = 2;
    brillo.material.depthTest = true;
    grupo.add(brillo);

    fugaces.push({
      sprite: sprite,
      brillo: brillo,
      vel: vel,
      edad: 0,
      vida: vida,
      dir: direccion.clone(),
    });
  }

  function actualizarFugaces(dt) {
    for (var i = fugaces.length - 1; i >= 0; i--) {
      var f = fugaces[i];
      f.edad += dt;
      var t = f.edad / f.vida;
      if (t >= 1) {
        grupo.remove(f.sprite);
        grupo.remove(f.brillo);
        f.sprite.material.dispose();
        f.brillo.material.dispose();
        fugaces.splice(i, 1);
        continue;
      }
      f.sprite.position.addScaledVector(f.vel, dt);
      f.brillo.position.copy(f.sprite.position).addScaledVector(f.dir, 18);
      var op = t < 0.12 ? t / 0.12 : (t > 0.72 ? (1 - t) / 0.28 : 1);
      f.sprite.material.opacity = op;
      f.brillo.material.opacity = op * 0.95;
      f.brillo.scale.setScalar((8 + Math.sin(t * 28) * 2) * op);

      f.sprite.material.rotation = Math.atan2(f.dir.y, f.dir.x);
    }
  }

  function actualizar(dt, t) {
    if (estrellas) estrellas.material.uniforms.tiempo.value = t;
    if (constelaciones) constelaciones.children[1].material.uniforms.tiempo.value = t;
    if (!reducido) grupo.rotation.y += dt * 0.0025;
    cuerposLejanos.forEach(function (cuerpo) {
      if (cuerpo.userData && cuerpo.userData.radio) {
        cuerpo.userData.angulo += dt * cuerpo.userData.velocidad;
        cuerpo.position.x = Math.cos(cuerpo.userData.angulo) * cuerpo.userData.radio;
        cuerpo.position.z = Math.sin(cuerpo.userData.angulo) * cuerpo.userData.radio;
        if (cuerpo.userData.grupoPlanetario) {
          cuerpo.children.forEach(function (planeta) {
            if (!planeta.userData || !planeta.userData.orbita) return;
            planeta.userData.fase += dt * planeta.userData.velocidad;
            planeta.position.x = Math.cos(planeta.userData.fase) * planeta.userData.orbita;
            planeta.position.z = Math.sin(planeta.userData.fase) * planeta.userData.orbita;
          });
        }
      } else if (cuerpo.userData && cuerpo.userData.fase !== undefined) {
        var pulso = 1 + Math.sin(t * 2 + cuerpo.userData.fase) * 0.18;
        cuerpo.scale.setScalar(cuerpo.userData.base * pulso);
        if (cuerpo.material) {
              cuerpo.material.opacity = 0.45 + Math.sin(t * 2 + cuerpo.userData.fase) * 0.25;
        } else {
          cuerpo.rotation.z += dt * 0.35;
        }
      }
    });
    fuegos.forEach(function (fuego) {
      var ciclo = (t + fuego.userData.fase) % fuego.userData.duracion;
      var progreso = (ciclo - fuego.userData.retraso) / (fuego.userData.duracion - fuego.userData.retraso);
      if (progreso < 0 || progreso > 1) {
        fuego.scale.setScalar(0.05);
        fuego.children[0].material.opacity = 0;
        return;
      }
      var visible = progreso < 0.18 ? progreso / 0.18 : 1 - (progreso - 0.18) / 0.82;
      var crecimiento = 0.05 + Math.max(0, progreso) * fuego.userData.tamano;
      fuego.scale.setScalar(crecimiento);
      fuego.children[0].material.opacity = Math.max(0, visible) * fuego.userData.brillo;
      fuego.children[1].material.opacity = Math.max(0, visible) * fuego.userData.brillo * 0.7;
    });
    auroras.forEach(function (aurora) {
      aurora.material.opacity = 0.07 + Math.sin(t * 0.35 + aurora.userData.fase) * 0.035;
      aurora.position.x = Math.sin(t * 0.12 + aurora.userData.fase) * 16;
    });
    fondos.forEach(function (fondo) {
      if (fondo.userData && fondo.userData.fase !== undefined) {
        fondo.rotation.z += dt * 0.004;
        fondo.children[0].material.opacity = 0.18 + Math.sin(t * 0.18 + fondo.userData.fase) * 0.06;
      }
    });
    detalles.forEach(function (detalle) {
      if (detalle.userData && detalle.userData.velocidad) {
        detalle.rotation.z += dt * detalle.userData.velocidad;
        detalle.material.opacity = 0.3 + Math.sin(t * 0.3 + detalle.userData.fase) * 0.16;
      } else if (detalle.userData && detalle.userData.ritmo) {
        var brillo = 0.28 + Math.max(0, Math.sin(t * detalle.userData.ritmo + detalle.userData.fase)) * 0.72;
        detalle.material.opacity = brillo;
        detalle.scale.setScalar((3.5 + Math.sin(t * 1.3 + detalle.userData.fase) * 0.8) * brillo);
      } else if (detalle.userData && detalle.userData.fase !== undefined) {
        detalle.material.opacity = 0.08 + Math.max(0, Math.sin(t * 0.45 + detalle.userData.fase)) * 0.18;
      }
    });
    if (polvoCosmico && !reducido) {
      polvoCosmico.rotation.y += dt * 0.0015;
      polvoCosmico.rotation.x = Math.sin(t * 0.08) * 0.025;
    }

    actualizarFugaces(dt);

    // Los cometas se reservan para la interacción explícita del visitante.
  }

  C.espacio = {
    construir: construir,
    lanzarEstrellaFugaz: lanzarEstrellaFugaz,
  };

})(window.Cielo = window.Cielo || {});
