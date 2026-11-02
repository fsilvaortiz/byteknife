---
title: 'URL encode and decode (percent-encoding)'
description: 'Encode and decode URLs and components with UTF-8 percent-encoding, and break a URL down into protocol, host, port, path and query parameters.'
examples:
  - title: 'Encode a value for a query parameter'
    input: |
      price=10€ & free shipping
    output: |
      price%3D10%E2%82%AC%20%26%20free%20shipping
  - title: 'Break down a URL with parameters'
    input: |
      https://api.example.com:8443/v1/search?q=caf%C3%A9%20con%20leche&page=2#results
    output: |
      Protocol   https:
      Host       api.example.com
      Port       8443
      Path       /v1/search
      Fragment   #results
      Origin     https://api.example.com:8443
      q          café con leche
      page       2
faq:
  - q: 'What is the difference between encoding a component and a full URL?'
    a: 'Encoding a component (like encodeURIComponent) also escapes / ? & = and #, because the value goes inside a parameter. Encoding a full URL (like encodeURI) leaves those separators alone so the URL keeps working.'
  - q: 'Why do I see %20 or +?'
    a: 'Both stand for a space. %20 is standard percent-encoding; + only means a space inside application/x-www-form-urlencoded form data. This tool produces %20, which works anywhere in a URL.'
  - q: 'What does the malformed % sequence error mean?'
    a: 'Every % must be followed by two hex digits that form valid UTF-8. A lone %, as in 100%, has to be written as %25.'
---

URLs only allow a limited set of characters. Spaces, accented letters, emoji and symbols with special meaning, such as `&`, `=`, `?` or `#`, are written with **percent-encoding**: each UTF-8 byte becomes `%` followed by two hex digits. This tool does that conversion in both directions as you type.

Choose **Encode component** when the text goes inside a query parameter or a path segment. Separators are escaped too, so an `&` in the value does not split the query in two. Use **Encode full URL** when you have a whole URL with spaces or accents and want it to stay navigable without touching its separators. **Decode** reverses both forms and warns you when it finds a `%` that does not make a valid sequence.

If you paste an absolute URL, you also get its breakdown: protocol, host, port, path, fragment, origin and the list of query parameters, already decoded. It is the quick way to read a long tracking link, check an OAuth callback or see what your API actually receives.

Everything is processed in the browser with the standard `URL` and `encodeURIComponent` APIs; nothing is sent to a server.
