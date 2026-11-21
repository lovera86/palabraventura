# Palabraventura

Aplicación web gratuita para practicar ortografía jugando (7–11 años). Sin registro, sin publicidad, sin compras, sin servidor y sin llamadas a IA. El progreso se guarda en el navegador (LocalStorage).

## Cómo abrirla en tu ordenador

Opción rápida: haz doble clic en `index.html`. Funciona sin instalar nada.

Opción recomendada (igual que cuando esté publicada): sirve la carpeta con un servidor local.

```bash
python -m http.server 8123
```

Después abre `http://localhost:8123` en el navegador.

## Cómo publicarla gratis con GitHub Pages

1. Crea una cuenta gratuita en github.com (si no la tienes).
2. Crea un repositorio nuevo, por ejemplo `palabraventura`, público.
3. Sube todos los archivos de esta carpeta (botón «Add file → Upload files», o con git).
4. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guarda.
5. En uno o dos minutos la app estará en `https://TU-USUARIO.github.io/palabraventura/` (HTTPS, gratis, sin dominio propio).

Con git, desde esta carpeta:

```bash
git init && git add . && git commit -m "Palabraventura MVP" && git branch -M main
```

```bash
git remote add origin https://github.com/TU-USUARIO/palabraventura.git && git push -u origin main
```

**Actualizar la web publicada:** cualquier cambio que llegue a la rama `main` del repositorio se publica solo en uno o dos minutos. Al publicar cambios, sube el número `?v=` de los archivos en `index.html` (por ejemplo de `v=6` a `v=7`) para que los navegadores no mezclen archivos nuevos con otros antiguos guardados en caché.

## Cómo se juega (versión 3: camino de lecciones)

1. **¿Quién juega?** Si hay varios jugadores en el dispositivo, cada uno elige su perfil al entrar. Sin registro: solo apodo, compañero y su nombre. Al crear un jugador se elige **Niño o niña** (aventura infantil) o **Adulto** (ortografía avanzada); cada tipo ve sus propias unidades, tesoros e insignias.
2. **Aventura (pantalla principal):** un camino de lecciones en zigzag, agrupado en unidades de colores: Ciudad de B/V → Pantano de la H → Cascada de LL/Y → Montaña de las Tildes → Cuevas de G/J → Bahía de C/Z/S → Torre de la Puntuación → Castillo de los Retos (mezcla de todo). La lección que toca lleva el globo «¡EMPIEZA!». Al tocar un círculo se abre una tarjeta con la historia y el botón EMPEZAR. Cada unidad tiene 3 lecciones y un desafío final (👑). **Todo está abierto desde el principio**: se puede jugar o repetir cualquier lección de cualquier unidad cuando se quiera; «¡EMPIEZA!» solo sugiere por dónde seguir.
3. **Lección (5–8 min, 7 retos; 8 en los desafíos):** un reto por pantalla, se elige una respuesta y se pulsa COMPROBAR. Abajo aparece una franja verde (acierto) o naranja (solución, explicación y ánimo) con CONTINUAR. A mitad, una decisión: un camino da un tesoro y el otro, monedas. En el ordenador: teclas 1-3 para elegir e Intro para comprobar o continuar.
4. **Formatos de reto:** Detective de palabras, Hechizo de letras, Robot corrector y Construye la palabra. Botón «💡 Pista» en cada reto, sin penalización.
5. **Final de lección:** estrellas, monedas y % de aciertos; tesoros y cofres se abren solos; evolución del compañero, nuevas unidades e insignias; una frase que anticipa la siguiente aventura.
6. **Arriba:** racha de días seguidos 🔥 (no castiga: solo cuenta), estrellas ⭐ y monedas 🪙.
7. **Colección:** álbum de tesoros, compañero (nombre, animal, accesorios, evolución), tienda e insignias. La tienda tiene 46 accesorios en 6 sitios (cabeza, cara, mano, cuello, efecto mágico de fondo y mascota): el compañero puede llevar uno en cada sitio a la vez, lo que se compra se lo pone al momento con una animación de «estreno», y lo comprado se puede poner o quitar desde la tienda o la ficha del compañero.
8. **Ajustes:** sonido, celebración «6 7» al acertar (el compañero hace el gesto con las manos y, con sonido, el navegador dice «six seven»; activada para niños y desactivada para adultos), menos animaciones, cambiar o añadir jugador y acceso a la zona de adultos.

En el móvil la navegación está abajo; en el ordenador hay un menú lateral y un panel con el compañero, la racha y el álbum. Fondo con letras y estrellas flotando, unidades con su color y adornos animados, lecciones teñidas con el color de su unidad y confeti al terminar (todo se desactiva con «Menos animaciones»).

Los datos de la versión 1 se migran solos al primer perfil al abrir la nueva versión, y la clave antigua se conserva como copia (`palabraventura.progreso`).

## La expedición de las palabras perdidas (en pruebas)

Primer juego de exploración y plataformas, pensado para el móvil en horizontal. **Está oculto** mientras se prueba: se activa en cada dispositivo desde **Ajustes → Zona de adultos → «Probar la expedición»** (o abriendo la app con `?expedicion`; `?expedicion=0` lo oculta). Entonces aparece una tarjeta arriba del todo en Aventura, para todos los jugadores.

- **Cómo se juega:** el compañero del jugador (con su accesorio de la cabeza) recorre un bosque con un joystick abajo a la izquierda y un botón de salto abajo a la derecha (se puede correr y saltar a la vez). En el ordenador, flechas o A/D y espacio. Le acompaña su mascota (la del hueco «mascota» o un pollito 🐣).
- **Letras:** las seis letras de PUENTE están repartidas en desorden; se recogen solas al pasar cerca y vuelan al marcador de arriba.
- **Reto:** al llegar al río con todas, se ordenan tocando fichas grandes; un hueco se toca para devolver su letra. Fallar no quita nada. Tras dos intentos hay pistas: imagen y definición; después, la voz dice la palabra y la primera letra queda fija.
- **Final:** el puente se reconstruye tablón a tablón, se cruza hasta la meta y hay celebración con premio: la primera vez ⭐ 10, 🪙 20 y la insignia «Puente mágico»; al repetir, ⭐ 3 y 🪙 5. «Volver a jugar» reinicia el nivel.
- **Móvil:** en vertical sale «Gira el móvil» (con «Jugar así»); en Android se intenta la pantalla completa en horizontal. Se pausa sola al cambiar de app o bloquear el móvil. Sin temporizadores, vidas ni castigos: caerse devuelve al último sitio seguro.
- **Contenido separado del motor:** `js/expedicion/nivel-puente.js` tiene el escenario, las letras, la palabra, las pistas y los premios; cambiarlos no exige tocar el motor.

## Estructura

```
index.html            Página única
css/app.css           Todos los estilos (mobile-first; menú lateral y panel derecho en pantallas grandes)
js/base.js            Utilidades, catálogo de habilidades, reglas y formatos de reto, validador del banco
js/datos/*.js         Banco de ejercicios en formato JSON, un archivo por bloque
js/mundo.js           Zonas, misiones, decisiones, tesoros, etapas del compañero y pistas (configuración)
                      + reglas de desbloqueo y de «siguiente misión»
js/almacen.js         Perfiles, guardar / cargar (esquema 2 con migración desde el 1), copia JSON, PIN
js/motor.js           Motor adaptativo: registrarRespuesta, actualizarHabilidad, programarRepaso,
                      seleccionarSesion (con reglas preferidas por misión), buscarComprobacion, estadoHabilidad
js/recompensas.js     Estrellas, monedas, cofres, tesoros, mercadillo, insignias, evolución; sonidos
js/app.js             Pantallas e interacción
js/expedicion/        La expedición: nivel-puente.js (contenido), motor.js (física, dibujo en canvas y controles
                      táctiles) y expedicion.js (pantallas del juego: intro, reto, pausa, meta)
```

Los ejercicios están en archivos `.js` (con datos en formato JSON) en lugar de `.json` para que la app funcione también abriendo `index.html` con doble clic, donde el navegador no permite leer archivos `.json` sueltos.

## Contenido del MVP

| Bloque | Ejercicios | Reglas trabajadas |
|---|---|---|
| B / V | 25 | bl/br, nv, -aba, verbos en -bir (y excepciones), -ivo/-iva, bu-/bus-/bur-, bi-, vocabulario |
| H / sin H | 25 | hue-/hie-/hui-, hum- + vocal, hacer, hablar, haber (hay, ha), hola/ola, h intercalada, vocabulario, palabras sin h |
| LL / Y | 23 | -illo/-illa, y final, verbos con y (cayó, leyó), vocabulario |
| Tildes básicas | 24 | agudas, llanas, esdrújulas (con y sin tilde) |
| G / J | 20 | verbos en -ger/-gir, -aje, -jero, gen, -gía, verbos con j (dije, trajeron), gue/gui y diéresis, vocabulario |
| C / Z / S | 21 | c delante de e/i, z delante de a/o/u, plural de -z en -ces, vocabulario |
| Puntuación y mayúsculas | 20 | ¿? y ¡!, mayúscula al empezar y en nombres propios, días y meses en minúscula, punto final |

**Ortografía para adultos** (perfil «Adulto», empieza en dificultad 2):

| Unidad | Ejercicios | Contenido |
|---|---|---|
| Plaza del le, la, lo | 20 | laísmo («la dije», «la duelen»), loísmo («los dije»), leísmo con cosas, con mujeres y en plural, concordancia «le/les» («le dije a mis padres»), «se lo / se los» |
| Tertulia del buen hablar | 20 | andé, conducí, satisfació, cabió, preveyó, haiga, dijistes; «si lo sabría»; «me se cayó»; «contra más»; «yo de ti»; «delante mía»; «habíamos diez»; «ves a comprar»; «ustedes vais»; nadien, cocreta, almóndiga |
| Laberinto de los parónimos | 20 | infringir/infligir, aptitud/actitud, prejuicio/perjuicio, absolver/absorber, apertura/abertura, inerte/inerme, prever/proveer, revelar/rebelar, desecho/deshecho, vasto/basto…; significados: sendos, adolecer, detentar, lívido |
| Museo de las palabras difíciles | 20 | exhaustivo, exuberante, ahínco, prohíbe, excavar, cónyuge, aeropuerto, inflación, objeción, meteorología, idiosincrasia, desternillarse, dentífrico, espurio, absceso, expectación… |
| Lo esencial | 79 | repaso de lo básico: tilde diacrítica, homófonos, porque/por qué, dudas gramaticales y tildes avanzadas |
| Gran Repaso | — | mezcla de todas las anteriores |

Las formas del habla de cada zona se presentan con respeto: se explica dónde se oyen y cuál es la forma de la norma culta.

Criterio: Ortografía de la RAE (2010) y Diccionario panhispánico de dudas.

Las regularidades con excepciones se presentan con «casi siempre» o «suele»; las palabras sin regla deducible se trabajan como vocabulario.

**Revisión manual pendiente:** el ticket pide revisar manualmente respuestas, distractores y explicaciones antes de publicar. El validador automático comprueba la estructura (la respuesta está entre las opciones, el hueco forma la palabra, el error aparece en la frase…), pero no sustituye a una lectura humana del contenido.

### Formato de un ejercicio

```json
{ "id": "bv02", "habilidad": "bv", "tipo": "completa", "dificultad": 1, "regla": "bl-br",
  "palabra": "libro", "frase": "Leo un ___ de piratas.", "hueco": "li_ro",
  "opciones": ["b", "v"], "correcta": "b",
  "explicacion": "Delante de R siempre se escribe B: libro, brazo, abrir." }
```

- `tipo`: `detective` (elegir la palabra bien escrita), `completa` (elegir la letra que falta; `""` = sin letra), `robot` (encontrar la palabra mal escrita en `frase`, indicada en `error`, y corregirla).
- `etiquetas`: opcional; si falta se usa `[habilidad, regla]`.
- Para añadir un ejercicio basta con añadirlo al archivo de su bloque. Al cargar la app, `PV.validarBanco()` avisa en la consola si algo no cuadra.
- Para un bloque nuevo: crea `js/datos/nuevo.js`, añádelo en `index.html`, registra la habilidad en `PV.HABILIDADES` y sus reglas en `PV.REGLAS` (`js/base.js`), añade sus pistas en `PV.PISTAS` y crea su zona en `PV.ZONAS` (`js/mundo.js`), con posición en el mapa, misiones y tesoros en `PV.COLECCION`. El mapa, el álbum y el progreso se adaptan solos.

## Cómo aprende la app

- Cada habilidad tiene una dificultad (1–3): sube tras 4 aciertos seguidos y baja si hay 2 errores en las 3 últimas respuestas.
- Tras un error: explicación breve, una pregunta de comprobación de la misma regla y el mismo reto otra vez al final de la sesión.
- Las palabras falladas entran en la lista de repaso: vuelven al día siguiente, a los 3 días y a la semana. Con tres repasos acertados salen de la lista.
- Una habilidad se marca como «dominada» solo con 10 respuestas recientes, al menos un 85 % de aciertos y práctica en 2 días distintos.
- Las estrellas premian acertar y mejorar (acertar algo que costaba vale doble), nunca la velocidad.

## Zona de adultos

En **Ajustes → Zona de adultos**. Se entra resolviendo una multiplicación o con un PIN (uno para todo el dispositivo). Muestra, para el jugador activo, misiones completadas, habilidades, errores frecuentes, pistas pedidas, palabras en repaso, evolución de 14 días y una recomendación. Permite exportar/importar una copia JSON del jugador y borrar su progreso (los demás jugadores no se tocan).

## Privacidad

Solo se pide un apodo. No se recogen nombre completo, correo ni fecha de nacimiento. Nada sale del navegador: no hay analítica, ni cookies de terceros, ni fuentes ni scripts externos.

## Pruebas

En la consola del navegador, `PV.util.desfase = 1` simula que es el día siguiente (para probar los repasos) y `PV.validarBanco()` revisa el banco.
