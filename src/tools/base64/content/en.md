---
title: 'Base64 encode and decode online'
description: 'Encode and decode Base64 with UTF-8 text, the URL-safe variant and files to data URIs. Nothing is uploaded: it all runs in your browser.'
examples:
  - title: 'Encode text (UTF-8)'
    input: |
      Hello, world!
    output: |
      SGVsbG8sIHdvcmxkIQ==
  - title: 'Decode a JWT header'
    input: |
      eyJhbGciOiJIUzI1NiJ9
    output: |
      {"alg":"HS256"}
faq:
  - q: 'Is Base64 encryption?'
    a: 'No. Base64 is only an encoding: anyone can reverse it without a key. It is meant to carry bytes over text channels, not to protect information.'
  - q: 'What is URL-safe Base64?'
    a: 'It is the RFC 4648 variant that replaces + with - and / with _, and drops the = padding. JWTs, URLs and file names use it because those characters cause trouble there.'
  - q: 'Why is the output longer than the input?'
    a: 'Base64 represents every 3 bytes with 4 characters, so the output grows by about 33 %. The tool shows the input and output byte counts.'
  - q: 'Can I convert an image to Base64?'
    a: 'Yes. With “File → data URI” you pick a local file and get a data URI ready for CSS or HTML. The file is read in the browser and never uploaded.'
---

Base64 turns bytes into text using 64 safe characters, and it is the usual way to put binary data in JSON, HTTP headers, email or a data URI. This tool encodes and decodes as you type and treats text as **UTF-8**, so accented letters and emoji are encoded exactly as a server would encode them, and decoding never shows garbled characters.

When decoding, readable text is shown as is. If the result is binary, such as an image or a compressed file, you get a hex view and the size instead of meaningless characters. The input accepts both standard Base64 and the **URL-safe** variant, with or without `=` padding, and with spaces or line breaks in between.

Turn on **URL-safe** to produce the variant used by JWTs and URLs, without `+`, `/` or `=`. With **File → data URI** you can turn an image or a font into a `data:` URI ready to paste into CSS or HTML.

Everything happens in your browser: neither text nor files are sent to a server. If you paste Base64 on the home page, ByteKnife recognizes it and opens it here.
