---
title: 'Convertir a camelCase, snake_case, kebab-case y más'
description: 'Convierte texto a camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, slug, Title Case y más formatos a la vez. Quita acentos.'
examples:
  - title: 'Un nombre en todos los formatos'
    input: |
      user profile id
    output: |
      camelCase       userProfileId
      PascalCase      UserProfileId
      snake_case      user_profile_id
      CONSTANT_CASE   USER_PROFILE_ID
      kebab-case      user-profile-id
      dot.case        user.profile.id
      path/case       user/profile/id
      Title Case      User Profile Id
  - title: 'Slug sin acentos desde un título'
    input: |
      Configuración de envío      (Quitar acentos activado)
    output: |
      kebab-case / slug   configuracion-de-envio
      snake_case          configuracion_de_envio
      camelCase           configuracionDeEnvio
faq:
  - q: '¿Cómo separa las palabras?'
    a: 'Corta en espacios, guiones, guiones bajos, puntos y barras, y también en los cambios de minúscula a mayúscula. Las siglas se respetan como una palabra: getHTTPResponseCode se separa en get, HTTP, Response y Code.'
  - q: '¿Para qué sirve quitar acentos?'
    a: 'Para obtener identificadores y slugs ASCII, que funcionan en cualquier lenguaje, URL o sistema de archivos. Sin esa opción, las letras acentuadas se conservan tal cual.'
  - q: '¿Qué formato uso en cada lenguaje?'
    a: 'Por convención, camelCase para variables en JavaScript y Java, PascalCase para clases y tipos, snake_case en Python, Ruby y columnas SQL, CONSTANT_CASE para constantes y variables de entorno, y kebab-case para URLs, clases CSS y nombres de archivo.'
---

Cada lenguaje y cada herramienta tiene su convención para nombrar cosas: variables en `camelCase`, clases en `PascalCase`, columnas de base de datos en `snake_case`, variables de entorno en `CONSTANT_CASE` y URLs o clases CSS en `kebab-case`. Esta herramienta convierte un texto a **todos los formatos a la vez**, para que copies el que necesitas sin reescribirlo a mano ni equivocarte con una letra.

La entrada puede venir en cualquier forma: una frase con espacios, un identificador en camelCase, una constante con guiones bajos o una ruta. La herramienta detecta los límites de palabra, incluso en siglas como `HTTP` o `ID` pegadas a otras palabras, y genera camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, dot.case, path/case, Title Case, Sentence case, minúsculas y MAYÚSCULAS.

Activa **Quitar acentos** para obtener identificadores y **slugs** ASCII a partir de títulos en español o portugués: «Configuración de envío» se convierte en `configuracion-de-envio`, listo para una URL. Cada resultado tiene su botón para copiar.

Es útil al renombrar campos entre un backend y un frontend, al crear claves de i18n o al pasar nombres de columnas a propiedades de un objeto. Todo ocurre en tu navegador.
