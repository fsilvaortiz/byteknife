---
title: 'Analisar Set-Cookie: SameSite, Secure e HttpOnly'
description: 'Cole cabeçalhos Set-Cookie ou Cookie e revise validade, domínio, Secure, HttpOnly, SameSite, os prefixos __Host- e __Secure- e erros de configuração.'
examples:
  - title: 'Um cookie de sessão bem configurado'
    input: |
      Set-Cookie: __Host-session=abc; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
    output: |
      Vence     amanhã (Max-Age 86400)
      Domain    Só este host
      Secure    Sim
      HttpOnly  Sim
      SameSite  Lax
      ✓ Bem configurado
  - title: 'Um cookie de terceiros que o navegador rejeita'
    input: |
      Set-Cookie: tracking=abc123; Domain=.ejemplo.dev; SameSite=None
    output: |
      ✗ SameSite=None sem Secure: o navegador a rejeita
      ! Sem Secure: também vai por HTTP
      i Com Domain: os subdomínios também a recebem
faq:
  - q: 'Qual SameSite devo usar?'
    a: 'Lax para a maioria dos cookies de sessão: é enviado ao navegar até o seu site, mas não em requisições de outros sites. Strict é ainda mais restritivo. None só se o cookie precisa ir em contextos de terceiros, e sempre com Secure.'
  - q: 'Para que servem os prefixos __Host- e __Secure-?'
    a: 'São garantias que o navegador verifica: __Secure- exige Secure; __Host- exige também Path=/ e nenhum Domain, então nenhum subdomínio pode sobrescrevê-lo.'
  - q: 'E se houver Max-Age e Expires?'
    a: 'Vale o Max-Age. Se Max-Age for 0 ou negativo, ou Expires estiver no passado, o navegador apaga o cookie. Sem nenhum dos dois, é um cookie de sessão.'
---

Os cookies controlam sessões, preferências e rastreamento, e os **atributos** decidem quem pode lê-los e quando são enviados. Um atributo faltando pode expor uma sessão ao JavaScript, ao HTTP sem criptografia ou a requisições de outros sites. Este analisador lê cabeçalhos `Set-Cookie` e `Cookie` e mostra cada detalhe.

Cole uma ou várias linhas `Set-Cookie:`, como as que o `curl -i` ou a aba Rede do navegador mostram. Para cada cookie você vê o valor, o valor decodificado se houver percent-encoding, quando vence (Max-Age tem prioridade sobre Expires), o domínio, o caminho e os atributos **Secure**, **HttpOnly**, **SameSite**, **Partitioned** e **Priority**. Se o valor parecer um JWT, isso é indicado.

A revisão aponta os erros que fazem o navegador **rejeitar** o cookie, como `SameSite=None` sem `Secure` ou um prefixo `__Host-` mal usado, e os riscos: cookies de sessão sem `HttpOnly`, sem `Secure` ou com `Domain`, que os compartilha com todos os subdomínios.

Se colar um cabeçalho `Cookie:`, você vê a lista de pares nome e valor que o navegador envia. Tudo é analisado no seu navegador.
