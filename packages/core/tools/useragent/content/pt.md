---
title: 'Analisar User-Agent: navegador, sistema e bots'
description: 'Cole uma string User-Agent e descubra o navegador, o motor, o sistema operacional, o tipo de dispositivo e se é um bot ou um cliente automatizado.'
examples:
  - title: 'Safari no iPhone'
    input: |
      Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1
    output: |
      Navegador             Safari 18.1
      Motor                 WebKit 605.1.15
      Sistema operacional   iOS 18.1
      Dispositivo           Celular
  - title: 'Rastreador do Google'
    input: |
      Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.69 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
    output: |
      Navegador       Chrome 131.0.6778.69
      Dispositivo     Bot ou cliente automatizado
      Bot ou cliente  Googlebot
faq:
  - q: 'Por que o Windows 11 aparece como «10 / 11»?'
    a: 'Os navegadores enviam Windows NT 10.0 tanto no Windows 10 quanto no 11, então o User-Agent não permite distinguir. Para saber, peça o cabeçalho Sec-CH-UA-Platform-Version (Client Hints).'
  - q: 'Dá para confiar no User-Agent?'
    a: 'Não totalmente: qualquer cliente pode enviar o texto que quiser, e os navegadores modernos congelam parte da informação. Use para estatísticas ou depuração, não para decisões de segurança.'
  - q: 'Quais bots são reconhecidos?'
    a: 'Os rastreadores do Google, Bing, DuckDuckGo, Apple, Yandex e Baidu, os de IA como GPTBot, ClaudeBot e PerplexityBot, os de redes sociais, Lighthouse, Chrome headless e clientes como curl, Wget, Postman ou python-requests.'
---

O **User-Agent** é a string com que cada navegador ou cliente HTTP se apresenta a um servidor. Ela é longa e confusa porque carrega décadas de compatibilidade: quase todos dizem ser «Mozilla» e muitos incluem «Safari» sem ser. Este analisador a decompõe.

Cole uma string dos seus logs, de uma ferramenta de analytics ou das DevTools, ou clique em **Usar o do meu navegador** para ver a sua. Você vê o **navegador** e a versão, o **motor** de renderização (Blink, Gecko, WebKit ou Trident), o **sistema operacional** e o **tipo de dispositivo**: desktop, celular, tablet, TV ou console.

Ele também identifica **bots** e clientes automatizados: rastreadores de buscadores e de IA, prévias de redes sociais, ferramentas de teste e clientes como `curl` ou `python-requests`. Isso ajuda a filtrar tráfego nos logs ou a entender por que um site responde diferente a um cliente.

Muitos navegadores já enviam um **User-Agent reduzido**, com a versão menor em `0.0.0` e o sistema congelado. A ferramenta indica isso para você não tirar conclusões demais. Tudo é processado no seu navegador.
