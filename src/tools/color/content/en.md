---
title: 'HEX, RGB, HSL and OKLCH color converter with WCAG contrast'
description: 'Convert colors between HEX, RGB, HSL and OKLCH, check WCAG contrast on white and black, and generate a 10-step OKLCH scale.'
examples:
  - title: 'A brand blue in every format'
    input: |
      #2a4fd6
    output: |
      HEX     #2a4fd6
      RGB     rgb(42 79 214)
      HSL     hsl(227 68% 50%)
      OKLCH   oklch(49.2% 0.211 266.4)
      On white  6.59 : 1  AA
      On black  3.19 : 1  AA large text
  - title: 'A CSS named color'
    input: |
      tomato
    output: |
      HEX     #ff6347
      OKLCH   oklch(69.6% 0.196 32.3)
      On white  2.95 : 1  Fails
      On black  7.13 : 1  AAA
faq:
  - q: 'What do AA and AAA mean?'
    a: 'They are WCAG 2 levels. AA requires a contrast of at least 4.5:1 for normal text and 3:1 for large text; AAA requires 7:1 and 4.5:1. The tool computes the ratio against white and against black.'
  - q: 'Why OKLCH?'
    a: 'OKLCH is a perceptual color space: changing lightness L changes how light the color looks evenly across hues. That is why OKLCH scales look more consistent than HSL ones, and CSS already supports it with oklch().'
  - q: 'Which inputs are accepted?'
    a: 'Any valid CSS color: 3, 4, 6 or 8-digit HEX, rgb(), hsl(), oklch(), names such as tomato or rebeccapurple, and values with transparency.'
---

This tool takes any CSS color and shows it in the formats you use every day: **HEX**, **RGB**, **HSL** and **OKLCH**, plus a Tailwind arbitrary value (`bg-[#2a4fd6]`) and a CSS variable ready to paste. You can type the color, paste it from your editor or pick it with the system color picker.

Next to the swatch you get the **WCAG contrast** of the color on white and on black, with the exact ratio and the level it reaches: AAA, AA, AA for large text only, or fail. It is the quick way to know whether a brand color works for text, for a button or only as a decorative background.

The **OKLCH scale** generates 10 shades of the same color, from very light to very dark, keeping the hue and adjusting chroma so every step stays inside sRGB. Because OKLCH is perceptually uniform, the steps look even, unlike scales made by varying lightness in HSL. Click any step to copy its HEX.

Color parsing uses your browser's CSS engine and conversions are computed locally, with nothing sent to a server. If you paste a color on the ByteKnife home page, it is detected and opened here.
