---
title: 'Secure random password generator'
description: 'Generate random passwords with crypto.getRandomValues, choose length and character sets, avoid ambiguous characters and see entropy in bits.'
examples:
  - title: '16 characters with upper, lower, digits and symbols'
    input: |
      Length 16 · A–Z · a–z · 0–9 · Symbols
    output: |
      N]sFEgPHc%v9EGFE        (sample: every click makes new ones)
      Strong · 103 bits of entropy
  - title: '24 characters without symbols or ambiguous characters'
    input: |
      Length 24 · A–Z · a–z · 0–9 · Avoid ambiguous (Il1O0)
    output: |
      RfRFGAG6aE7zcv7YqqLDbpGF   (sample)
      Excellent · 140 bits of entropy
faq:
  - q: 'Are passwords generated on a server?'
    a: "No. They are generated in your browser with crypto.getRandomValues, the system's cryptographic generator, and are never transmitted or stored."
  - q: 'What does entropy in bits mean?'
    a: 'It measures how many guesses, on average, an attacker who knows the method but not the password would need: each bit doubles the effort. It is computed as length × log2 of the number of possible characters.'
  - q: 'How many bits do I need?'
    a: 'As a rule of thumb, 80 bits already resists online brute force, and 100 or more is a good target for master passwords, service accounts or API secrets.'
  - q: 'Why avoid ambiguous characters?'
    a: 'I, l, 1, O and 0 are easy to mix up when reading or dictating a password. Removing them lowers entropy per character a little, which you offset with a longer password.'
---

A secure password is, above all, long and truly random. This tool generates several at once with `crypto.getRandomValues`, the browser's cryptographic generator, and picks every character uniformly, without the bias of the classic `Math.random() % n`.

You can set the **length** and the character sets: uppercase, lowercase, digits and symbols. Each password includes at least one character from every set you turn on, so it satisfies policies that require, say, a number and a symbol. **Avoid ambiguous** removes `I`, `l`, `1`, `O` and `0`, which helps when the password will be read aloud or typed by hand.

Next to the output you see the estimated **entropy** in bits and a strength label. Entropy depends on the length and the size of the alphabet, not on whether the password “looks” hard: adding four characters usually helps more than adding symbols.

Use these passwords for new accounts, API secrets, database credentials or environment variables, and keep them in a password manager. Nothing generated here leaves your browser or is stored in it.
