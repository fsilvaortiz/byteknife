---
title: 'Analizar User-Agent: navegador, sistema y bots'
description: 'Pega una cadena User-Agent y descubre el navegador, el motor, el sistema operativo, el tipo de dispositivo y si es un bot o un cliente automatizado.'
examples:
  - title: 'Safari en iPhone'
    input: |
      Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1
    output: |
      Navegador          Safari 18.1
      Motor              WebKit 605.1.15
      Sistema operativo  iOS 18.1
      Dispositivo        Móvil
  - title: 'Rastreador de Google'
    input: |
      Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.69 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
    output: |
      Navegador     Chrome 131.0.6778.69
      Dispositivo   Bot o cliente automatizado
      Bot o cliente Googlebot
faq:
  - q: '¿Por qué Windows 11 aparece como «10 / 11»?'
    a: 'Los navegadores envían Windows NT 10.0 tanto en Windows 10 como en 11, así que el User-Agent no permite distinguirlos. Para saberlo hay que pedir la cabecera Sec-CH-UA-Platform-Version (Client Hints).'
  - q: '¿Se puede confiar en el User-Agent?'
    a: 'No del todo: cualquier cliente puede enviar el texto que quiera, y los navegadores modernos congelan parte de la información. Úsalo para estadísticas o depuración, no para decisiones de seguridad.'
  - q: '¿Qué bots reconoce?'
    a: 'Los rastreadores de Google, Bing, DuckDuckGo, Apple, Yandex y Baidu, los de IA como GPTBot, ClaudeBot y PerplexityBot, los de redes sociales, Lighthouse, Chrome headless y clientes como curl, Wget, Postman o python-requests.'
---

El **User-Agent** es la cadena con la que cada navegador o cliente HTTP se presenta ante un servidor. Es larga y confusa, porque arrastra décadas de compatibilidad: casi todos dicen ser «Mozilla» y muchos incluyen «Safari» aunque no lo sean. Este analizador la descompone.

Pega una cadena de tus logs, de una analítica o de las DevTools, o pulsa **Usar el de mi navegador** para ver la tuya. Verás el **navegador** y su versión, el **motor** de renderizado (Blink, Gecko, WebKit o Trident), el **sistema operativo** y el **tipo de dispositivo**: escritorio, móvil, tablet, TV o consola.

También identifica **bots** y clientes automatizados: rastreadores de buscadores y de IA, vistas previas de redes sociales, herramientas de pruebas y clientes como `curl` o `python-requests`. Es útil para filtrar tráfico en los logs o entender por qué un sitio responde distinto a un cliente.

Muchos navegadores ya envían un **User-Agent reducido**, con la versión menor en `0.0.0` y el sistema congelado. La herramienta lo indica para que no saques conclusiones de más. Todo se procesa en tu navegador.
