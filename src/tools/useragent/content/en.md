---
title: 'User-Agent parser: browser, OS and bots'
description: 'Paste a User-Agent string and find out the browser, engine, operating system, device type and whether it is a bot or an automated client.'
examples:
  - title: 'Safari on iPhone'
    input: |
      Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1
    output: |
      Browser           Safari 18.1
      Engine            WebKit 605.1.15
      Operating system  iOS 18.1
      Device            Mobile
  - title: 'Google crawler'
    input: |
      Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.69 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
    output: |
      Browser        Chrome 131.0.6778.69
      Device         Bot or automated client
      Bot or client  Googlebot
faq:
  - q: 'Why does Windows 11 show as «10 / 11»?'
    a: 'Browsers send Windows NT 10.0 on both Windows 10 and 11, so the User-Agent cannot tell them apart. To know, request the Sec-CH-UA-Platform-Version header (Client Hints).'
  - q: 'Can I trust the User-Agent?'
    a: 'Not entirely: any client can send whatever text it likes, and modern browsers freeze part of the information. Use it for statistics or debugging, not for security decisions.'
  - q: 'Which bots does it recognize?'
    a: 'Google, Bing, DuckDuckGo, Apple, Yandex and Baidu crawlers, AI crawlers such as GPTBot, ClaudeBot and PerplexityBot, social network previews, Lighthouse, headless Chrome and clients like curl, Wget, Postman or python-requests.'
---

The **User-Agent** is the string every browser or HTTP client uses to introduce itself to a server. It is long and confusing because it carries decades of compatibility baggage: almost every browser claims to be «Mozilla» and many mention «Safari» without being Safari. This parser breaks it down.

Paste a string from your logs, your analytics or the dev tools, or press **Use my browser's** to see your own. You get the **browser** and its version, the rendering **engine** (Blink, Gecko, WebKit or Trident), the **operating system** and the **device type**: desktop, mobile, tablet, TV or console.

It also recognizes **bots** and automated clients: search and AI crawlers, social media link previews, testing tools and clients such as `curl` or `python-requests`. That helps when filtering traffic in logs or figuring out why a site answers a client differently.

Many browsers now send a **reduced User-Agent**, with the minor version set to `0.0.0` and a frozen OS. The tool points that out so you do not read too much into it. Everything is processed in your browser.
