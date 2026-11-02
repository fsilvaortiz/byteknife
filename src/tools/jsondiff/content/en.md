---
title: 'Compare JSON: online structural diff'
description: 'Compare two JSON documents by structure and see which keys were added, removed or changed, with their path. Key order is ignored, and array order can be too.'
examples:
  - title: 'Two versions of a config'
    input: |
      {"version": "2.14.0", "limits": {"rps": 1200}, "flags": {"beta": true}}
      {"version": "2.15.0", "limits": {"rps": 1500, "timeoutMs": 2500}, "flags": {}}
    output: |
      $.version           "2.14.0"  →  "2.15.0"
      $.limits.rps        1200      →  1500
      + $.limits.timeoutMs          2500
      − $.flags.beta      true
  - title: 'Arrays regardless of order'
    input: |
      ["admin", "dev", "ops"]
      ["ops", "admin", "qa"]
    output: |
      − $[1]  "dev"
      + $[2]  "qa"
faq:
  - q: 'How is this different from a text diff?'
    a: 'A text diff compares lines, so everything changes if the JSON was formatted differently or keys come in another order. This diff compares values: two equivalent JSON documents show no differences even if they look different.'
  - q: 'How do I read the paths?'
    a: 'They use JSONPath notation: $ is the root, .key goes into an object and [0] into an array. Keys with spaces or symbols are written in brackets, like $["odd key"].'
  - q: 'What does "Ignore array order" do?'
    a: 'It compares each array as a set: if the same elements appear in a different order, there are no changes. Only missing or extra elements are reported. Useful for permission lists, tags or IDs.'
  - q: 'Can I compare API responses with real data?'
    a: 'Yes. The comparison runs in your browser and neither JSON document is sent to a server.'
---

When an API responds differently between two versions, or a config file changed between environments, comparing JSON by eye is slow and error-prone. This tool runs a **structural diff**: it parses both JSON documents and compares their values, not their lines.

The result is a table with the **path** of every difference and its **before** and **after** values. New keys show up as added, missing ones as removed, and different values as changed, even when the type changed, say from number to string. Object key order never counts, and neither do whitespace or indentation.

Arrays are compared **by position**: if you insert an element at the start, every element after it counts as changed. When order does not matter, as in a list of roles or tags, turn on **Ignore array order** and you will only see missing or extra elements.

It helps when reviewing API contracts, comparing test fixtures, auditing config or feature-flag changes, and figuring out what changed in a webhook payload. If either JSON has an error, you get its line and column.
