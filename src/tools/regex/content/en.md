---
title: 'JavaScript regex tester online'
description: 'Test JavaScript regular expressions with live highlighting, named groups and replacement. It runs in a Worker with a time limit.'
examples:
  - title: 'Capture dates and reorder them with a replacement'
    input: |
      Pattern:     (\d{4})-(\d{2})-(\d{2})   flags: g
      Text:        deploy 2026-10-29, rollback 2026-10-30
      Replacement: $3/$2/$1
    output: |
      2 matches
      #1  2026-10-29   $1=2026  $2=10  $3=29
      #2  2026-10-30   $1=2026  $2=10  $3=30
      deploy 29/10/2026, rollback 30/10/2026
  - title: 'Named groups'
    input: |
      Pattern:  (?<user>[\w.]+)@(?<domain>[\w.-]+)   flags: gi
      Text:     ana@example.com, luis.p@byteknife.dev
    output: |
      #1  ana@example.com        user=ana     domain=example.com
      #2  luis.p@byteknife.dev   user=luis.p  domain=byteknife.dev
faq:
  - q: 'Which regex engine does it use?'
    a: "Your browser's JavaScript engine (ECMAScript RegExp). It behaves the same in Node.js, Deno and frontend code; other engines such as PCRE, Python or Java differ in lookbehind, flags and Unicode classes."
  - q: 'What if my regex hangs?'
    a: 'It is evaluated in a Web Worker with a 1-second limit. If it runs longer, the Worker is stopped and you see a possible catastrophic backtracking warning, without the tab freezing.'
  - q: 'How do I use groups in the replacement?'
    a: 'With $1, $2… for numbered groups, $<name> for named groups and $& for the whole match, just like String.prototype.replace.'
---

Regular expressions are the fastest way to search, validate or transform text, and also the easiest to get wrong. This tool lets you test a pattern against real text and see right away what matches: every match is **highlighted** in the text, and below it you get the list with each position and the value of every **capture group**, including named groups (`(?<name>…)`).

You can toggle the most common flags with one click: `g` (global), `i` (ignore case), `m` (multiline), `s` (dot matches newlines) and `u` (Unicode). If you type a **replacement** string, you see the result of `replace` with references such as `$1` or `$<name>`, ready to copy.

The pattern runs on JavaScript's `RegExp` engine, so whatever works here works the same in your Node.js or browser code. To keep an expression with **catastrophic backtracking**, such as `(a+)+$`, from freezing the page, evaluation runs in a Web Worker with a one-second limit; if it takes longer, the tool stops it and warns you.

If the pattern has a syntax error, the message replaces the results. Neither the pattern nor the text leaves your browser.
