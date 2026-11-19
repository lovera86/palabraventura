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

**Actualizar la web publicada:** cualquier cambio que llegue a la rama `main` del repositorio se publica solo en uno o dos minutos.

## Cómo se juega (versión 3: camino de lecciones)

1. **¿Quién juega?** Si hay varios jugadores en el dispositivo, cada uno elige su perfil al entrar. Sin registro: solo apodo, compañero y su nombre.
2. **Aventura (pantalla principal):** un camino de lecciones en zigzag, agrupado en unidades de colores: Ciudad de B/V → Pantano de la H → Cascada de LL/Y → Montaña de las Tildes → Castillo de los Retos, y unidades futuras («Próximamente»). La lección que toca lleva el globo «¡EMPIEZA!». Al tocar un círculo se abre una tarjeta con la historia y el botón EMPEZAR. Cada unidad tiene 3 lecciones y un desafío final (👑); la siguiente se abre al completar 2 lecciones de la anterior.
3. **Lección (5–8 min, 7 retos; 8 en los desafíos):** un reto por pantalla, se elige una respuesta y se pulsa COMPROBAR. Abajo aparece una franja verde (acierto) o naranja (solución, explicación y ánimo) con CONTINUAR. A mitad, una decisión: un camino da un tesoro y el otro, monedas. En el ordenador: teclas 1-3 para elegir e Intro para comprobar o continuar.
4. **Formatos de reto:** Detective de palabras, Hechizo de letras, Robot corrector y Construye la palabra. Botón «💡 Pista» en cada reto, sin penalización.
5. **Final de lección:** estrellas, monedas y % de aciertos; tesoros y cofres se abren solos; evolución del compañero, nuevas unidades e insignias; una frase que anticipa la siguiente aventura.
6. **Arriba:** racha de días seguidos 🔥 (no castiga: solo cuenta), estrellas ⭐ y monedas 🪙.
7. **Colección:** álbum de tesoros, compañero (nombre, animal, accesorios, evolución), tienda de accesorios e insignias.
8. **Ajustes:** sonido, menos animaciones, cambiar o añadir jugador y acceso a la zona de adultos.

En el móvil la navegación está abajo; en el ordenador hay un menú lateral y un panel con el compañero, la racha y el álbum.

Los datos de la versión 1 se migran solos al primer perfil al abrir la nueva versión, y la clave antigua se conserva como copia (`palabraventura.progreso`).

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
```

Los ejercicios están en archivos `.js` (con datos en formato JSON) en lugar de `.json` para que la app funcione también abriendo `index.html` con doble clic, donde el navegador no permite leer archivos `.json` sueltos.

## Contenido del MVP

| Bloque | Ejercicios | Reglas trabajadas |
|---|---|---|
| B / V | 25 | bl/br, nv, -aba, verbos en -bir (y excepciones), -ivo/-iva, bu-/bus-/bur-, bi-, vocabulario |
| H / sin H | 25 | hue-/hie-/hui-, hum- + vocal, hacer, hablar, haber (hay, ha), hola/ola, h intercalada, vocabulario, palabras sin h |
| LL / Y | 23 | -illo/-illa, y final, verbos con y (cayó, leyó), vocabulario |
| Tildes básicas | 24 | agudas, llanas, esdrújulas (con y sin tilde) |

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
