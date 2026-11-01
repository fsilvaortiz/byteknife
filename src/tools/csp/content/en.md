---
title: 'Content-Security-Policy (CSP) analyzer'
description: 'Paste a CSP and find its weak spots: unsafe-inline, unsafe-eval, wildcards, object-src, base-uri, frame-ancestors and deprecated directives.'
examples:
  - title: 'A typical CSP with gaps'
    input: |
      script-src 'self' 'unsafe-inline' https:; img-src *
    output: |
      ✗ script-src allows 'unsafe-inline': the CSP does not stop XSS.
      ✗ script-src accepts «https:»: scripts can load from almost anywhere.
      ! object-src is not 'none'
      ! base-uri is missing
      ! frame-ancestors is missing
  - title: 'A strict nonce-based CSP'
    input: |
      default-src 'self'; script-src 'nonce-r4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; report-to csp
    output: |
      ✓ Uses 'strict-dynamic'
      ✓ Uses nonces: generate a fresh random one for each response.
faq:
  - q: 'Why is unsafe-inline so bad?'
    a: 'Because the most common XSS attack injects an inline <script>. If the policy allows it, the CSP stops protecting against it. Use nonces or hashes to authorize only your own scripts.'
  - q: 'What is strict-dynamic?'
    a: 'It lets a script trusted through a nonce or hash load other scripts without listing domains. Together with nonces, it is the recommended way to write a strict CSP.'
  - q: 'Can I paste the <meta> tag?'
    a: 'Yes. It accepts the bare policy, the full header with Content-Security-Policy: or Content-Security-Policy-Report-Only:, and the content attribute of a <meta http-equiv>.'
---

The **Content-Security-Policy** tells the browser where it may load scripts, styles, images or iframes from. Written well, it is the most effective defense against XSS; written poorly, it gives a false sense of security. This analyzer reads it directive by directive and points out the problems.

Paste the policy exactly as it appears in the headers or in a `<meta>` tag. You get a table with each **directive**, its sources and what it controls. Directives you do not declare inherit from `default-src`, and the review takes that into account.

The **review** flags as critical `'unsafe-inline'` without a nonce or hash, `'unsafe-eval'` and wildcards in `script-src` (`*`, `https:`, `data:`). Warnings cover `object-src` other than `'none'`, missing `base-uri` or `frame-ancestors`, `http://` sources, repeated, deprecated and misspelled directives. Good practices are recognized too: nonces and `'strict-dynamic'`.

**Copy cleaned** gives you the policy on one line, without duplicates or extra spaces. Use it before shipping a new policy or to review a third-party site. The analysis runs in your browser.
