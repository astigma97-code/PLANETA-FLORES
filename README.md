# 21 de septiembre

Una portada, y después un viaje en 3D: la cámara vuela desde lejos hasta un
jardín de flores que gira despacio en medio del universo —un sol hecho de
pétalos, con anillos de flores alrededor, como los de Saturno—. Alrededor,
estrellas que titilan, constelaciones, estrellas fugaces, y unas frases que
van apareciendo solas, dirigidas a una persona.

Tocar el cielo lanza una estrella fugaz, como pedir un deseo.

## Estructura

```
index.html             HTML   · la portada y la escena
css/styles.css          CSS   · portada, textos, botón de sonido, bandas de cine, grano, móviles
js/util.js               JS   · utilidades y texturas en <canvas> (flores, resplandores, etiquetas)
js/config.js              JS  · nombre y tiempos (lo único que se toca para ajustar el ritmo)
js/datos.js                JS · las frases, las etiquetas flotantes, la firma y la fecha
js/escena.js                JS· el núcleo de three.js: renderer, cámara, reloj de animación
js/espacio.js                 estrellas, constelaciones, nebulosa y estrellas fugaces
js/flora.js                   el jardín: el sol de flores y sus anillos
js/viaje.js                   el vuelo inicial de la cámara y la órbita alrededor del jardín
js/interaccion.js             el paralaje con el puntero y el toque para pedir un deseo
js/frases.js                  el ritmo de las frases y de las etiquetas flotantes en 3D
js/audio.js                   la música de fondo, con fundidos
js/intro.js                   el paso de la portada a la experiencia principal
js/main.js                    arranque: pone el nombre donde corresponde
assets/favicon.svg            ícono de la pestaña
assets/musica.mp3             música de fondo
server.py              Python · servidor local, opcional
.nojekyll                      para GitHub Pages (sirve la carpeta tal cual)
```

El viaje 3D lo dibuja [three.js](https://threejs.org), que se carga desde un
CDN (una sola línea en `index.html`). Todo lo demás es HTML, CSS y JavaScript
comunes, sin instalar nada ni compilar nada.

## Abrirla

- **Doble clic en `index.html`.** Funciona directo; solo hace falta internet
  la primera vez, para traer la tipografía y three.js.
- **Con servidor** (por si preferís ver la dirección en la terminal, o
  abrirla desde el celular):

  ```
  python3 server.py --para Valeria --abrir
  ```

  Con `--red` también se abre desde otro dispositivo de la misma Wi-Fi; el
  script imprime la dirección. Funciona igual en Termux (`pkg install python`).

## Personalizar

- **Nombre:** enlace `index.html?para=Valeria`, o la variable `NOMBRE_FIJO`
  en `js/config.js`. Con nombre cambia la firma ("Para Valeria") y entran
  las frases que contienen `{nombre}`.
- **Frases y etiquetas:** todas están en `js/datos.js` —es el único archivo
  que hace falta tocar para cambiar las palabras—. No hace falta servidor ni
  paso extra: es JavaScript plano, así que el cambio se ve apenas se guarda
  el archivo, tanto con doble clic como publicado.
  - `frases`: el texto grande que aparece y desaparece. Las que llevan
    `{nombre}` solo salen si hay nombre puesto. Conviene no pasar de unas 90
    letras, y tiene que quedar al menos una frase sin `{nombre}`.
  - `etiquetas`: las palabras cortas que flotan alrededor del jardín en 3D.
    Mejor cortas (hasta unas 24 letras).
- **Ritmo:** en `js/config.js` — `primeraFraseMs`, `duracionFraseMs`,
  `pausaFraseMinMs`/`pausaFraseMaxMs` para las frases; los mismos con
  `Etiqueta` para las etiquetas flotantes; `duracionViajeMs` para lo que dura
  el vuelo inicial; `velocidadOrbita` para lo rápido que gira la cámara
  alrededor del jardín.
- **Música:** reemplaza `assets/musica.mp3` por otro archivo con el mismo
  nombre. El volumen (`volumen`, de 0 a 1) y la suavidad del fundido
  (`fundidoMs`) están en `js/config.js`.
- **Colores de las flores:** la paleta de cada anillo está en
  `PALETA_ANILLOS`, al principio de `js/flora.js`.

## La música

Empieza sola apenas se toca «Entrar al universo» —ya hay un gesto de la
persona en ese momento, así que los navegadores la dejan sonar sin
restricciones— y se repite en bucle. El botón de abajo a la derecha la
silencia con un fundido suave.

## Publicarla

Sube la carpeta completa (no solo `index.html`) a Netlify Drop, GitHub Pages
o cualquier hosting estático. No necesita `server.py` ni compilar nada.

### GitHub Pages, paso a paso

1. Crea un repositorio nuevo (público) en GitHub.
2. Sube **todo el contenido de esta carpeta** manteniendo las subcarpetas
   (`css/`, `js/`, `assets/`). Con «Add file → Upload files» puedes arrastrar
   la carpeta entera; GitHub conserva la estructura.
3. En el repositorio: **Settings → Pages → Source: Deploy from a branch**,
   rama `main`, carpeta `/ (root)`, y **Save**.
4. En uno o dos minutos la dirección queda en
   `https://TU-USUARIO.github.io/TU-REPO/`. Con nombre:
   `https://TU-USUARIO.github.io/TU-REPO/?para=Valeria`.

Detalles que ya están resueltos:

- Todas las rutas son relativas, así que funciona dentro de un subdirectorio
  (`/TU-REPO/`) sin tocar nada.
- `.nojekyll` evita que GitHub procese la carpeta con Jekyll.
- El mp3 pesa unos 5 MB: en la primera visita con datos móviles puede
  tardar un poco. Si quieres que cargue antes, reemplázalo por una versión
  de menor bitrate con el mismo nombre.

## Si el dispositivo no tiene WebGL

Es rarísimo hoy en día, pero si pasara, la página no se rompe: se ve un
fondo de degradé fijo en vez del jardín en 3D, y las frases, la música y la
firma siguen funcionando igual.

## Detalles

- Respeta "reducir movimiento" del sistema: la cámara no viaja ni orbita, no
  aparecen etiquetas flotantes en 3D, y las frases se muestran con un
  desvanecido simple.
- La calidad (cantidad de estrellas y de flores) se ajusta sola según el
  equipo, para que ande bien también en celulares modestos.
- Tocar el cielo lanza una estrella fugaz; de tanto en tanto cae una sola,
  como una pequeña lluvia de meteoros.
- La tipografía (Instrument Serif) viene de Google Fonts; sin conexión usa
  una serif del sistema.
