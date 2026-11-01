---
title: 'Set-Cookie analyzer: SameSite, Secure and HttpOnly'
description: 'Paste Set-Cookie or Cookie headers and check expiry, domain, Secure, HttpOnly, SameSite, the __Host- and __Secure- prefixes and misconfigurations.'
examples:
  - title: 'A well-configured session cookie'
    input: |
      Set-Cookie: __Host-session=abc; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
    output: |
      Expires   tomorrow (Max-Age 86400)
      Domain    This host only
      Secure    Yes
      HttpOnly  Yes
      SameSite  Lax
      ✓ Well configured
  - title: 'A third-party cookie the browser rejects'
    input: |
      Set-Cookie: tracking=abc123; Domain=.ejemplo.dev; SameSite=None
    output: |
      ✗ SameSite=None without Secure: browsers reject it
      ! No Secure: also sent over HTTP
      i Has Domain: subdomains receive it too
faq:
  - q: 'Which SameSite value should I use?'
    a: 'Lax for most session cookies: it is sent when navigating to your site, but not on requests from other sites. Strict is even tighter. None only when the cookie must travel in third-party contexts, and always with Secure.'
  - q: 'What are the __Host- and __Secure- prefixes for?'
    a: 'They are guarantees the browser enforces: __Secure- requires Secure; __Host- also requires Path=/ and no Domain, so no subdomain can overwrite it.'
  - q: 'What if both Max-Age and Expires are set?'
    a: 'Max-Age wins. If Max-Age is 0 or negative, or Expires is in the past, the browser deletes the cookie. With neither, it is a session cookie.'
---

Cookies drive sessions, preferences and tracking, and their **attributes** decide who can read them and when they are sent. A missing attribute can expose a session to JavaScript, to unencrypted HTTP or to requests from other sites. This analyzer reads `Set-Cookie` and `Cookie` headers and shows you every detail.

Paste one or more `Set-Cookie:` lines, like those shown by `curl -i` or the browser Network tab. For each cookie you see its value, the decoded value if it is percent-encoded, when it expires (Max-Age takes priority over Expires), the domain, the path and the **Secure**, **HttpOnly**, **SameSite**, **Partitioned** and **Priority** attributes. If the value looks like a JWT, it says so.

The review flags the mistakes that make the browser **reject** the cookie, such as `SameSite=None` without `Secure` or a misused `__Host-` prefix, and the risks: session cookies without `HttpOnly`, without `Secure` or with `Domain`, which shares them with every subdomain.

If you paste a `Cookie:` header, you get the list of name and value pairs the browser sends. Everything is analyzed in your browser.
