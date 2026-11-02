---
title: 'HTTP header analyzer: security, caching and CORS'
description: 'Paste the headers of an HTTP response and check HSTS, CSP, nosniff, clickjacking, cookies, CORS and caching, with an explanation of each header.'
examples:
  - title: 'An unhardened server response'
    input: |
      HTTP/1.1 200 OK
      Server: Apache/2.4.41 (Ubuntu)
      X-Powered-By: PHP/8.1
      Set-Cookie: PHPSESSID=1; path=/
    output: |
      ✗ Strict-Transport-Security is missing
      ✗ Content-Security-Policy is missing
      ! X-Content-Type-Options: nosniff is missing
      ! Server reveals the version: «Apache/2.4.41 (Ubuntu)»
      ! Cookie «PHPSESSID» lacks Secure and HttpOnly together.
  - title: 'Caching of a response'
    input: |
      HTTP/2 200
      cache-control: public, max-age=3600
    output: |
      i public cache: fresh for 3600 s.
faq:
  - q: 'How do I get the headers of a URL?'
    a: 'Use curl -sI https://your-site.dev, or curl -si to include the body, or the browser dev tools: open the Network tab, pick the request and copy the response headers.'
  - q: 'Why does the tool not fetch them itself?'
    a: "Because ByteKnife never makes network requests with your data: everything happens in your browser. Besides, a request from someone else's server would not see your internal network or your cookies."
  - q: 'Which security headers matter most?'
    a: 'Strict-Transport-Security to force HTTPS, Content-Security-Policy against XSS, X-Content-Type-Options: nosniff, frame-ancestors or X-Frame-Options against clickjacking, and Referrer-Policy.'
---

The **HTTP headers** of a response say a lot about how a site is configured: whether it forces HTTPS, defends against XSS and clickjacking, how long it is cached or which origins may read it. This analyzer interprets them and shows you what matters.

Paste the output of `curl -i`, `curl -I` or headers copied from the dev tools. The status line, blank lines and the body, which is ignored, are all recognized. You get the status code with its name and a table with each header, its value and what it is for.

The **review** flags what is missing or worth changing: missing or too short HSTS, a CSP that does not exist or is report-only, `nosniff`, framing protection, `Referrer-Policy`, servers that reveal their version, cookies without `Secure` or `HttpOnly` and dangerous CORS combinations. It also sums up the **caching** policy: `no-store`, revalidation or freshness time.

It helps when auditing a deployment, comparing environments or checking an API response before going live. Headers are analyzed in your browser and never sent to a server.
