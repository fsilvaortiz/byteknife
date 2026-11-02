---
title: 'Analisar Content-Security-Policy (CSP) online'
description: 'Cole uma CSP e descubra os pontos fracos: unsafe-inline, unsafe-eval, curingas, object-src, base-uri, frame-ancestors e diretivas obsoletas.'
examples:
  - title: 'Uma CSP comum com brechas'
    input: |
      script-src 'self' 'unsafe-inline' https:; img-src *
    output: |
      ✗ script-src permite 'unsafe-inline': a CSP não impede XSS.
      ✗ script-src aceita «https:»: scripts podem vir de quase qualquer lugar.
      ! object-src não é 'none'
      ! Falta base-uri
      ! Falta frame-ancestors
  - title: 'Uma CSP estrita com nonce'
    input: |
      default-src 'self'; script-src 'nonce-r4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; report-to csp
    output: |
      ✓ Usa 'strict-dynamic'
      ✓ Usa nonces: gere um novo e aleatório a cada resposta.
faq:
  - q: 'Por que unsafe-inline é tão grave?'
    a: 'Porque o ataque XSS mais comum injeta um <script> inline. Se a política permite, a CSP deixa de proteger contra ele. Use nonces ou hashes para autorizar só os seus scripts.'
  - q: 'O que é strict-dynamic?'
    a: 'Permite que um script autorizado por nonce ou hash carregue outros scripts sem listar domínios. Junto com nonces, é a forma recomendada de escrever uma CSP estrita.'
  - q: 'Posso colar a tag <meta>?'
    a: 'Sim. Aceita a política sozinha, o cabeçalho completo com Content-Security-Policy: ou Content-Security-Policy-Report-Only: e o atributo content de um <meta http-equiv>.'
---

A **Content-Security-Policy** diz ao navegador de onde ele pode carregar scripts, estilos, imagens ou iframes. Bem escrita, é a defesa mais eficaz contra XSS; mal escrita, dá uma falsa sensação de segurança. Este analisador a lê diretiva por diretiva e aponta os problemas.

Cole a política como aparece nos cabeçalhos ou numa tag `<meta>`. Você vê uma tabela com cada **diretiva**, as fontes e o que ela controla. As diretivas não declaradas herdam de `default-src`, e a revisão leva isso em conta.

A **revisão** marca como graves `'unsafe-inline'` sem nonce nem hash, `'unsafe-eval'` e os curingas em `script-src` (`*`, `https:`, `data:`). Como avisos aparecem `object-src` diferente de `'none'`, a falta de `base-uri` ou de `frame-ancestors`, origens `http://`, diretivas repetidas, obsoletas e com erro de digitação. As boas práticas também são reconhecidas: nonces e `'strict-dynamic'`.

Com **Copiar limpa** você obtém a política numa linha, sem duplicados nem espaços a mais. Use antes de publicar uma política nova ou para revisar a de um site de terceiros. A análise acontece no seu navegador.
