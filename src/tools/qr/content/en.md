---
title: 'QR code generator: URL, text and Wi-Fi'
description: 'Create QR codes for a URL, text or a Wi-Fi network, choose the error correction and colors, and download them as SVG or PNG with no watermarks.'
examples:
  - title: 'QR for a URL'
    input: |
      https://byteknife.dev
    output: |
      Version 2 · 25×25 modules (correction M)
      Downloads: SVG and PNG
  - title: 'QR to share the Wi-Fi'
    input: |
      SSID: Office-5G · WPA · password: tea&coffee;2026
    output: |
      WIFI:T:WPA;S:Office-5G;P:tea&coffee\;2026;;
faq:
  - q: 'Do the codes expire or have a scan limit?'
    a: 'No. The QR holds the text or URL directly, with no redirect through a third-party service, so it works forever and nobody tracks who scans it.'
  - q: 'Which error correction level should I pick?'
    a: 'M (15%) works for almost everything. Use Q or H if the code will be printed on surfaces that get dirty or if you want to place a logo on top: the code grows, but it still scans when part of it is damaged.'
  - q: 'Can I use it in print?'
    a: 'Yes. Download the SVG for print: it is vector and scales without losing sharpness. Keep the white margin around it and good contrast between color and background.'
---

This tool generates **QR codes** in your browser, with no accounts, no watermarks and no redirects: the content goes straight into the code.

In **Text or URL**, type whatever you want to encode: a link, some text, a phone number with `tel:` or an email with `mailto:`. In **Wi-Fi**, fill in the network name, security type and password, and you get the code phones recognize to join without typing the password. Special characters are escaped as the format requires.

**Error correction** decides how much of the code can be damaged and still scan: from L (7%) to H (30%). More correction means a denser code. You can change the **color** and **background**; if contrast is low, you get a warning because many readers will fail.

Download the result as **SVG**, vector and ideal for print, or as a 1024-pixel **PNG** for slides and documents. You also see the code version and its size in modules.

The code is drawn in your browser with the `qrcode` library: neither the text nor the Wi-Fi password is sent to any server.
