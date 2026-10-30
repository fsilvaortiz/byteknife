---
title: 'Escape HTML, JSON strings and Unicode'
description: 'Escape and unescape HTML entities, JSON string literals and Unicode \u sequences. Handy for pasting text into code, templates or logs.'
examples:
  - title: 'Escape HTML before showing it on a page'
    input: |
      <a href="/search?q=1&lang=en">Tom's</a>
    output: |
      &lt;a href=&quot;/search?q=1&amp;lang=en&quot;&gt;Tom&#39;s&lt;/a&gt;
  - title: 'Turn text into Unicode \u sequences'
    input: |
      café ☕ 🚀
    output: |
      café ☕ 🚀
faq:
  - q: 'Which characters does HTML mode escape?'
    a: 'The five that can break markup or open an injection: & < > " and the single quote. When unescaping, it also understands numeric entities such as &#233; or &#xE9; and the most common named entities.'
  - q: 'Why does an emoji become two \u sequences?'
    a: 'JavaScript and JSON represent characters outside the Basic Multilingual Plane as a UTF-16 surrogate pair. 🚀 is U+1F680 and is written 🚀; when unescaping, the pair becomes a single character again.'
  - q: 'When should I use JSON string mode?'
    a: 'When you need to put text with line breaks, tabs, quotes or backslashes inside a JSON or JavaScript string. The output is the content between the quotes, ready to paste.'
---

Escaping means replacing characters that have a special meaning in a format with a sequence that represents them unambiguously. This tool does that, and undoes it, for the three cases that come up most often:

- **HTML:** turns `&`, `<`, `>`, double quotes and single quotes into entities. That is what you need to show code or user text inside a page without the browser treating it as markup. When unescaping, it understands named and numeric entities.
- **JSON string:** produces the content of a valid JSON string, with `\n`, `\t`, `\"` and `\\`. Use it to embed a piece of text, an error message or a SQL block in a JSON file or a test.
- **Unicode `\u`:** turns everything that is not ASCII into `\uXXXX` sequences, including the surrogate pairs of emoji. It is useful for properties files, code that must be pure ASCII, or to see which invisible characters a copied text carries.

Pick the format and the direction, escape or unescape, and the output updates as you type. If a sequence is invalid, for example a code point above `10FFFF`, you see the error instead of a half-finished result. Everything happens in your browser.
