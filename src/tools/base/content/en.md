---
title: 'Binary, octal, decimal and hex converter'
description: 'Convert numbers between binary, octal, decimal and hexadecimal with no size limit thanks to BigInt. Shows bits, bytes and the Unicode character.'
examples:
  - title: 'A byte in every base'
    input: |
      255
    output: |
      Decimal        255
      Hexadecimal    FF
      Binary         1111 1111
      Octal          377
      8 bits · 1 byte · U+00FF ÿ
  - title: 'A 64-bit integer without losing precision'
    input: |
      18446744073709551615
    output: |
      Hexadecimal    FFFF FFFF FFFF FFFF
      Octal          1777777777777777777777
      64 bits · 8 bytes
faq:
  - q: 'Is there a size limit?'
    a: 'Not in practice. Conversion uses BigInt, so 64-bit, 128-bit or larger integers convert without the rounding that Number suffers above 2^53.'
  - q: 'How is the input base detected?'
    a: 'In auto mode the prefix decides: 0x is hex, 0b binary and 0o octal; without a prefix it is read as decimal. You can also set the base manually, for example to read ff without the 0x.'
  - q: 'Are negative numbers supported?'
    a: "Yes. The sign is kept in every representation; the tool does not apply two's complement."
---

Converting a number from one base to another is an everyday task when reading a memory dump, checking permissions, debugging a binary protocol or decoding a color or error code. Type a number and the tool shows it at once in **decimal, hexadecimal, binary and octal**, with digits grouped for easy reading: hex and binary in groups of four, and decimal with a thousands separator.

The input base is detected from the prefix, as in most programming languages: `0x` for hex, `0b` for binary and `0o` for octal. If you prefer, set the base manually. Each representation is copied with its prefix, ready to paste into code.

Numbers are handled with `BigInt`, so there is no practical size limit and no loss of precision: a maximum `uint64` or a 256-bit hash converts exactly, which `Number` cannot do above 2^53. You also see how many **bits and bytes** the value takes and, when it is a valid code point, the **Unicode character** it stands for, which helps identify an emoji or an invisible character from its code.

Everything is computed in your browser as you type.
