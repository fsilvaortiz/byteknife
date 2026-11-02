---
title: 'JSON formatter and validator online'
description: 'Format, minify and validate JSON in your browser. Sort keys and see the exact line and column of any error. Nothing is sent to a server.'
examples:
  - title: 'Pretty-print minified JSON'
    input: |
      {"name":"ByteKnife","tools":16,"offline":true,"langs":["es","en","pt"]}
    output: |
      {
        "name": "ByteKnife",
        "tools": 16,
        "offline": true,
        "langs": [
          "es",
          "en",
          "pt"
        ]
      }
  - title: 'Sort keys to compare two responses'
    input: |
      {"version":2,"name":"api","deps":{"zod":"4.1.0","astro":"7.4.4"}}
    output: |
      {
        "deps": {
          "astro": "7.4.4",
          "zod": "4.1.0"
        },
        "name": "api",
        "version": 2
      }
faq:
  - q: 'Is my JSON sent to a server?'
    a: "No. Parsing uses the browser's own JSON.parse and everything happens in this tab. You can go offline and the tool keeps working."
  - q: 'Why is my JSON invalid if it works in JavaScript?'
    a: 'JSON is stricter than a JavaScript object literal: keys need double quotes, and single quotes, comments and trailing commas are not allowed. The error shows the line and column where the problem is.'
  - q: 'Does sorting keys change the meaning of the JSON?'
    a: 'No. Key order has no meaning in a JSON object; sorting alphabetically helps you compare two documents or keep diffs stable. Array order is always preserved.'
  - q: 'How big is my JSON?'
    a: 'Below the output you will see the size in bytes, the number of nodes and the maximum depth, which help you spot responses that grew more than expected.'
---

Paste JSON and it is formatted as you type, with no submit button. If the document is valid, you get it indented with 2 or 4 spaces or tabs, with colors for keys, strings, numbers and booleans. If it has an error, the tool tells you what it found and on which line and column, so you can jump straight to the problem instead of hunting for a stray comma.

Besides formatting, you can **minify** the document to strip whitespace and line breaks before putting it in an environment variable or a request body, or **sort keys** recursively. Sorting is handy when you compare two API responses or want a config file to always keep the same order in version control.

Everything runs in your browser with `JSON.parse` and `JSON.stringify`. No data leaves the tab, so you can paste responses containing tokens, customer data or internal configuration without exposing them. If you paste JSON on the ByteKnife home page, it is detected automatically and opened here with your content.

To turn an array of objects into a spreadsheet, use the JSON ⇄ CSV tool.
