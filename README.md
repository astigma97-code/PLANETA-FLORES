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

