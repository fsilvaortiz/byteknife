# Seguridad

La promesa de ByteKnife es que nada de lo que pegas sale de tu navegador. Cualquier cosa que la rompa es una vulnerabilidad, por ejemplo:

- Una herramienta que envía la entrada del usuario a un servidor, directa o indirectamente.
- Una forma de que contenido pegado ejecute código en la página (XSS).
- Una dependencia que carga recursos de terceros.
- Datos que quedan expuestos fuera de la pestaña, como entradas en la URL o en logs.

## Cómo reportar

No abras una issue pública. Usa el reporte privado de GitHub: pestaña **Security** del repositorio → **Report a vulnerability**.

Incluye los pasos para reproducirlo, el navegador y, si puedes, qué dato se filtra y hacia dónde.

Responderemos en un plazo de 7 días. Cuando el problema esté corregido, publicaremos un aviso y te daremos crédito si lo deseas.

## Versiones soportadas

Solo la versión publicada en [byteknife.dev](https://byteknife.dev), que corresponde a la rama `main`.
