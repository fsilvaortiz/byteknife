---
title: 'Analizar Content-Security-Policy (CSP) en línea'
description: 'Pega una CSP y descubre sus puntos débiles: unsafe-inline, unsafe-eval, comodines, object-src, base-uri, frame-ancestors y directivas obsoletas.'
examples:
  - title: 'Una CSP habitual con huecos'
    input: |
      script-src 'self' 'unsafe-inline' https:; img-src *
    output: |
      ✗ script-src permite 'unsafe-inline': la CSP no frena XSS.
      ✗ script-src acepta «https:»: permite cargar scripts de casi cualquier lado.
      ! object-src no es 'none'
      ! Falta base-uri
      ! Falta frame-ancestors
  - title: 'Una CSP estricta con nonce'
    input: |
      default-src 'self'; script-src 'nonce-r4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; report-to csp
    output: |
      ✓ Usa 'strict-dynamic'
      ✓ Usa nonces: genera uno nuevo y aleatorio en cada respuesta.
faq:
  - q: '¿Por qué unsafe-inline es tan grave?'
    a: 'Porque el ataque XSS más común inyecta un <script> en línea. Si la política lo permite, la CSP deja de proteger contra él. Usa nonces o hashes para autorizar solo tus scripts.'
  - q: '¿Qué es strict-dynamic?'
    a: 'Permite que un script autorizado con nonce o hash cargue otros scripts, sin tener que listar dominios. Junto con nonces, es la forma recomendada de escribir una CSP estricta.'
  - q: '¿Puedo pegar la etiqueta <meta>?'
    a: 'Sí. Acepta la política sola, la cabecera completa con Content-Security-Policy: o Content-Security-Policy-Report-Only:, y el atributo content de un <meta http-equiv>.'
---

La **Content-Security-Policy** le dice al navegador desde dónde puede cargar scripts, estilos, imágenes o iframes. Bien escrita, es la defensa más efectiva contra XSS; mal escrita, da una falsa sensación de seguridad. Este analizador la lee directiva por directiva y señala los problemas.

Pega la política tal cual sale en las cabeceras o en una etiqueta `<meta>`. Verás una tabla con cada **directiva**, sus fuentes y qué controla. Las directivas que no declaras heredan de `default-src`, y la revisión lo tiene en cuenta.

La **revisión** marca como graves `'unsafe-inline'` sin nonce ni hash, `'unsafe-eval'` y los comodines en `script-src` (`*`, `https:`, `data:`). Como avisos aparecen `object-src` distinto de `'none'`, la falta de `base-uri` o de `frame-ancestors`, los orígenes `http://`, las directivas repetidas, las obsoletas y las mal escritas. También reconoce las buenas prácticas: nonces y `'strict-dynamic'`.

Con **Copiar limpia** obtienes la política en una línea, sin duplicados ni espacios de más. Úsala antes de desplegar una política nueva o para revisar la de un sitio de terceros. El análisis ocurre en tu navegador.
