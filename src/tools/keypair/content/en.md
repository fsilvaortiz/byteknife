---
title: 'SSH key pair generator: Ed25519, ECDSA and RSA'
description: 'Generate Ed25519, ECDSA or RSA public and private keys in your browser and copy them as OpenSSH, PEM (PKCS#8) or JWK, with their SHA256 fingerprint.'
examples:
  - title: 'Ed25519 SSH key with a comment'
    input: |
      Algorithm Ed25519 · Comment ada@laptop · Format OpenSSH
    output: |
      ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINdamAGCsQq31Uv+08lkBzoO4XLz2qYjJa8CGmj3B1Ea ada@laptop
      (sample: every generated pair is different)
  - title: 'ECDSA P-256 public key as PEM'
    input: |
      Algorithm ECDSA P-256 · Format PEM
    output: |
      -----BEGIN PUBLIC KEY-----
      MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE…
      -----END PUBLIC KEY-----
faq:
  - q: 'Is the private key sent to a server?'
    a: 'No. The pair is generated with Web Crypto (crypto.subtle.generateKey) inside this tab and is never transmitted or stored. It is gone when you reload the page.'
  - q: 'Which algorithm should I use?'
    a: 'Ed25519 for SSH and new signatures: it is fast, secure and has short keys. ECDSA P-256 when you need JWT ES256 or hardware without Ed25519 support, and RSA 3072 or 4096 for older systems.'
  - q: 'Does the OpenSSH private key work with ssh and ssh-keygen?'
    a: 'Yes. It uses the openssh-key-v1 format without a passphrase, the same as ssh-keygen -N "". Save it with mode 600 and, to protect it, add a passphrase with ssh-keygen -p -f file.'
  - q: 'What is the SHA256 fingerprint for?'
    a: 'It identifies the public key without showing all of it. It matches what ssh-keygen -l and GitHub show in the SSH keys list, so you can check you uploaded the right one.'
---

This tool generates an asymmetric **key pair**, public and private, without installing anything and without the private key ever leaving your machine. It uses Web Crypto, the browser's cryptographic API, backed by the operating system's secure random generator.

Pick the **algorithm**: Ed25519, ECDSA on the P-256 or P-384 curves, or RSA with 2048, 3072 or 4096 bits. Then switch the output **format**. **OpenSSH** gives you the `ssh-ed25519 AAAA…` line ready for `authorized_keys` or for GitHub, and the private key in the format `ssh` and `ssh-keygen` read. **PEM** uses PKCS#8 for the private key and SPKI for the public key, which is what OpenSSL, Node.js, Java and JWT libraries expect. **JWK** returns the RFC 7517 JSON, handy for a JWKS endpoint or for importing the key with Web Crypto.

The optional **comment** is appended to the OpenSSH keys so you can recognize them later, for example `you@laptop`. The SHA256 **fingerprint** matches the one from `ssh-keygen -l`.

Typical uses: a deploy key for a repository, an SSH key for a new server, or an ES256 or EdDSA pair to sign tokens during development. For production, keep the private key in a secrets manager and never commit it to the repository.
