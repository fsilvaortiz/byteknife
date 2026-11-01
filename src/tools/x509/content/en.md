---
title: 'X.509 certificate and CSR decoder (PEM)'
description: 'Paste a PEM certificate or CSR and read its subject, issuer, validity, SAN, key usage, extensions and SHA-256 fingerprints without sending it anywhere.'
examples:
  - title: 'ECDSA server certificate'
    input: |
      -----BEGIN CERTIFICATE-----
      MIIC/jCCAqWgAwIBAgIGChssPU5fMAoGCCqGSM49BAMCMD0xCzAJBgNVBAYTAkNM…
      -----END CERTIFICATE-----
    output: |
      Subject              C=CL, O=Ejemplo SpA, CN=api.ejemplo.dev
      Valid until          2036-10-01T00:00:00Z
      Public key           EC · P-256 · 256 bits
      Signature algorithm  ecdsa-with-SHA256
      SAN                  DNS:api.ejemplo.dev, DNS:*.ejemplo.dev, IP:203.0.113.10
      Extended key usage   serverAuth, clientAuth
  - title: 'CSR with two names'
    input: |
      -----BEGIN CERTIFICATE REQUEST-----
      MIIBeTCCAQACAQAwQTELMAkGA1UEBhMCQlIxFTATBgNVBAoMDEV4ZW1wbG8gTHRk…
      -----END CERTIFICATE REQUEST-----
    output: |
      Subject     C=BR, O=Exemplo Ltda, CN=www.exemplo.com.br
      Public key  EC · P-384 · 384 bits
      SAN         DNS:www.exemplo.com.br, DNS:exemplo.com.br
faq:
  - q: 'Is it safe to paste a certificate here?'
    a: 'A certificate is public by design: every HTTPS server sends it. Even so, it is decoded in your browser and never sent anywhere. Never paste the private key: this tool does not need it.'
  - q: 'Does it verify the signature or the trust chain?'
    a: 'No. It reads the certificate contents; to validate the chain use openssl verify or your browser. It does tell you whether the certificate has expired, is not yet valid or is self-signed.'
  - q: 'Can I paste a full chain?'
    a: "Yes. If the text has several PEM blocks, like a Let's Encrypt fullchain.pem, a selector lets you go through each certificate."
  - q: 'What is the SPKI pin for?'
    a: "It is the SHA-256 of the public key in Base64. Mobile certificate pinning and options like curl's pinnedpubkey use it, and it stays the same across renewals that keep the key."
---

A PEM X.509 certificate is a Base64 block you cannot read at a glance. This tool decodes it in the browser and shows what you usually dig out with `openssl x509 -text`, but organized and in plain language.

Paste a **certificate** (`-----BEGIN CERTIFICATE-----`) or a **CSR** (`-----BEGIN CERTIFICATE REQUEST-----`). You get the subject, the issuer, the serial number, the validity dates with the days left, the public key type and size, the signature algorithm and the SHA-256 and SHA-1 fingerprints.

Under **Extensions** you find the **subject alternative names (SAN)**, the domains and IPs the certificate is valid for; key usage and extended key usage, such as `serverAuth` for HTTPS; basic constraints, which tell whether it is a CA; key identifiers; and the OCSP, CRL and issuer URLs. Extensions marked **critical** must be understood by whoever validates the certificate.

It helps when you need to see why a browser rejects a certificate, confirm a CSR lists every domain before sending it to the CA, check when a certificate expires or compare fingerprints. If you paste a chain with several certificates, you can step through them one by one.

Only the contents are read: neither the signature nor the trust chain is verified.
