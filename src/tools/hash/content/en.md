---
title: 'MD5, SHA-1, SHA-256 and SHA-512 hash generator'
description: 'Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of text or a local file, in hex or Base64. The file is never uploaded.'
examples:
  - title: 'All five hashes of a string'
    input: |
      hello
    output: |
      MD5      5d41402abc4b2a76b9719d911017c592
      SHA-1    aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
      SHA-256  2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
      SHA-384  59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f
      SHA-512  9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043
  - title: 'SHA-256 in Base64, as used by Subresource Integrity'
    input: |
      hello
    output: |
      LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=
faq:
  - q: 'Is my file uploaded to a server?'
    a: 'No. The file is read with the File API and processed in a Web Worker inside your browser. You can hash an installer or a backup without it leaving your machine.'
  - q: 'Can I use MD5 or SHA-1 for passwords or signatures?'
    a: 'No. Both have known collisions and are only good for detecting accidental corruption, not tampering. For passwords use a slow algorithm such as Argon2, scrypt or bcrypt.'
  - q: 'Why does my hash not match another tool?'
    a: 'Almost always because of a trailing newline or the encoding. Here text is hashed as UTF-8 exactly as you typed it; echo without -n adds a newline that changes the result.'
---

A hash function turns any input into a fixed-size fingerprint: the same content always produces the same result, and the smallest change produces a completely different one. This tool computes **MD5, SHA-1, SHA-256, SHA-384 and SHA-512** at once, so you can compare against a published value without choosing the algorithm first.

Type or paste text and the hashes update as you type. Text is encoded as UTF-8, as in most programming languages and in `sha256sum`. You can also pick a **local file**: it is read in a Web Worker so the page does not freeze, even with large files, and it is how you check that a download or a backup is not corrupted.

Output can be shown in **hex**, in upper or lower case, or in **Base64**, the format used by Subresource Integrity `integrity` attributes and some storage APIs.

The SHA algorithms use Web Crypto, the browser's native implementation; MD5, which Web Crypto does not include, uses our own implementation tested against the RFC 1321 vectors. Neither text nor files leave your browser.
