/* js/datos.js
   Las frases, las etiquetas flotantes, la firma y la fecha.
   Este es el único archivo que hace falta tocar para cambiar las palabras.
   No hace falta servidor ni compilar nada: es JavaScript plano, así que
   funciona igual al abrir con doble clic que al publicarlo en internet.

   - «frases»: el texto grande que aparece y desaparece en el cielo.
     Las que llevan {nombre} solo salen si hay un nombre puesto (ver
     js/config.js o el enlace ?para=). Conviene no pasar de unas 90 letras.
     Tiene que quedar al menos una frase SIN {nombre}.
   - «etiquetas»: las palabras cortas que flotan alrededor del jardín de
     flores, como pequeñas notas suspendidas en el universo. Mejor cortas
     (hasta unas 24 letras) para que se lean bien como una insignia.
*/
(function (C) {
  'use strict';

  C.datos = {
    fecha: '21 de septiembre',

    firma: 'Para ti',
    firmaConNombre: 'Para {nombre}',

    frases: [
      'Hay personas que iluminan un día entero solo por existir.',
      '{nombre}, no sé qué nos depare el camino, pero hoy quería dejarte algo bonito.',
      'Estas flores son para recordarte lo bien que te queda existir.',
      'Cada estrella de este cielo se quedó quieta un segundo para que la vieras.',
      '{nombre}, hoy el universo entero se puso de tu lado.',
      'Un jardín entero no alcanza para decir lo que quiero decirte.',
      'Ojalá puedas sentir, aunque sea un poco, lo bonito que eres para quienes te quieren.',
      '{nombre}, este rincón del universo tiene tu nombre escrito con estrellas.',
      'No hacen falta fechas para decir esto, pero hoy es un buen día para hacerlo.',
      'Que cada pétalo de este jardín te recuerde que mereces cosas bonitas.',
      '{nombre}, gracias por ser una de las razones para sonreír este año.',
      'Si el cielo pudiera hablar, hoy diría gracias por tenerte cerca.',
    ],

    etiquetas: [
      'para ti 🌸',
      'gracias por existir',
      'una flor más',
      'hoy brillas distinto',
      'un pequeño universo',
      'esto es para ti',
      'una razón para sonreír',
      'con cariño 💛',
      'mira las estrellas',
      'un deseo más',
    ],
  };

})(window.Cielo = window.Cielo || {});
