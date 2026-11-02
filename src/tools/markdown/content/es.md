---
title: 'Vista previa de Markdown en línea (GFM)'
description: 'Escribe Markdown y míralo renderizado al instante: títulos, tablas, listas de tareas y código al estilo GitHub. Copia el HTML generado.'
examples:
  - title: 'Lista de tareas y código'
    input: |
      ## Pendientes
      - [x] Revisar el PR
      - [ ] Desplegar `v2.15`
    output: |
      <h2>Pendientes</h2>
      <ul>
      <li><span class="md-task">☑</span> Revisar el PR</li>
      <li><span class="md-task">☐</span> Desplegar <code>v2.15</code></li>
      </ul>
  - title: 'Tabla con alineación'
    input: |
      | Región    | Latencia |
      |-----------|---------:|
      | sa-east-1 |    84 ms |
    output: |
      Región      Latencia
      sa-east-1      84 ms
faq:
  - q: '¿Qué variante de Markdown usa?'
    a: 'GitHub Flavored Markdown (GFM), con tablas, listas de tareas, tachado, enlaces automáticos y bloques de código con lenguaje. Es lo que usan los README, los issues y la mayoría de los wikis.'
  - q: '¿Por qué no se ve el HTML que escribí?'
    a: 'Por seguridad, el HTML dentro del Markdown se muestra como texto y los enlaces javascript: se desactivan. Así, pegar un documento de origen desconocido no ejecuta nada en tu navegador.'
  - q: '¿Por qué no se cargan las imágenes?'
    a: 'Las imágenes externas se reemplazan por su texto alternativo: cargarlas haría una petición a otro servidor y la herramienta no envía nada fuera de tu navegador. Las imágenes data: incrustadas sí se muestran.'
---

Markdown es el formato de los README, la documentación, los issues y las notas de versión. Esta herramienta te deja escribirlo y ver el resultado **en vivo**, sin abrir un repositorio ni instalar un editor.

Escribe a la izquierda y la vista previa se actualiza mientras tecleas. Se admite **GitHub Flavored Markdown**: títulos, énfasis, listas, listas de tareas, tablas con alineación, citas, enlaces y bloques de código. Arriba verás cuántas palabras tiene el texto y el tiempo estimado de lectura.

Cambia a **HTML** para ver el código que genera el Markdown, listo para pegar en un correo, un CMS o una plantilla. **Copiar HTML** lo copia con un clic.

La vista previa es segura: el HTML crudo se muestra como texto, los enlaces `javascript:` pierden su destino y las imágenes externas no se descargan. Puedes revisar el README de un proyecto ajeno o un texto generado por una IA sin que se ejecute nada.

Todo ocurre en tu navegador: lo que escribes no se guarda ni se envía a ningún servidor.
