---
title: 'HTTP status codes and headers: reference'
description: 'Look up what each HTTP status code means (200, 301, 404, 422, 429, 503) and what every common request and response header is for.'
examples:
  - title: 'Search by code'
    input: |
      429
    output: |
      429  Too Many Requests · RFC 6585
           Rate limit exceeded; see Retry-After.
  - title: 'Search headers by topic'
    input: |
      cors
    output: |
      Access-Control-Allow-Credentials  Response  CORS: allows sending cookies or credentials.
      Access-Control-Allow-Headers      Response  CORS: headers allowed in the actual request.
      Access-Control-Allow-Methods      Response  CORS: methods allowed in the actual request.
      Access-Control-Allow-Origin       Response  CORS: origins allowed to read the response.
faq:
  - q: 'What is the difference between 401 and 403?'
    a: '401 means you are not authenticated or your credentials are invalid. 403 means the server knows who you are, but you are not allowed to access that resource.'
  - q: 'Should I redirect with 301, 302, 307 or 308?'
    a: '301 and 308 are permanent; 302 and 307 are temporary. 307 and 308 keep the method and body, so a POST stays a POST. For APIs, prefer 307 and 308.'
  - q: 'When do I return 400 and when 422?'
    a: '400 when the request is malformed, for example broken JSON. 422 when the syntax is fine but the data fails validation, such as an invalid email.'
  - q: 'Where do the texts come from?'
    a: 'Names and RFC numbers come from the IETF specifications, mainly RFC 9110. The descriptions are a practical summary.'
---

Every HTTP response carries a three-digit **status code** that sums up what happened, plus a set of **headers** with metadata: content type, caching, cookies, CORS or security. This reference gathers the registered codes and the most used headers, each with a short explanation.

Under **Status codes**, type an exact number (`404`), a prefix (`5` shows every server error) or a word (`redirect`, `limit`). Each code shows its official name, the RFC that defines it and what it is used for. Color tells the family apart: green for success, yellow for client errors and red for server errors.

Under **Headers**, search by name or topic: `cache`, `cors`, `cookie`, `security`. You see whether the header belongs in the request, the response or both, and what it controls.

It helps you pick the right code when designing an API, understand an error in the logs, or remember what `Vary` or `Retry-After` did. To analyze the real headers of a response, use the HTTP header analyzer.
