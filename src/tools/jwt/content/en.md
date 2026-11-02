---
title: 'JWT decoder and HS256 signature verifier'
description: 'Decode a JWT and read its header, payload and exp, iat and nbf dates. Verify HS256, HS384 and HS512 signatures without the token leaving your browser.'
examples:
  - title: 'Read a token'
    input: |
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBZGEiLCJpYXQiOjE3OTMzMTg0MDAsImV4cCI6MTc5MzMyMjAwMH0._DX8uh7t6vcFdmwuAPKekQPEJ93tmXRQp9w8arzwRwo
    output: |
      Header   {"alg": "HS256", "typ": "JWT"}
      Payload  {"sub": "42", "name": "Ada", "iat": 1793318400, "exp": 1793322000}
      Issued (iat)   2026-10-30T00:00:00.000Z
      Expires (exp)  2026-10-30T01:00:00.000Z
  - title: 'Verify the signature with the HMAC secret'
    input: |
      Secret: byteknife    →  same token
      Secret: other        →  same token
    output: |
      Valid signature
      Signature mismatch
faq:
  - q: 'Is it safe to paste a production JWT here?'
    a: 'The token and the secret are processed only in this tab with Web Crypto and never sent to a server. Still, a live JWT is a credential: treat it like a password and do not share it.'
  - q: 'Is decoding a JWT the same as verifying it?'
    a: 'No. Anyone can decode the header and payload, because they are just Base64URL. Verifying means checking the signature with the key, and it is the only thing that proves the token was not tampered with.'
  - q: 'Why can I not verify RS256 or ES256?'
    a: 'Those algorithms use a public key (RSA or elliptic curve) instead of a shared secret. For now the tool verifies HS256, HS384 and HS512; for the others it shows the algorithm and decodes the content.'
---

A JSON Web Token has three dot-separated parts: the **header**, the **payload** and the **signature**, the first two being JSON encoded with Base64URL. Paste a token and you get the header and payload formatted, with the algorithm highlighted, plus a timeline of the dates that usually define its validity: `iat` (issued at), `nbf` (not before), `exp` (expires) and `auth_time`. Each date is shown in ISO 8601 and as relative time, and a badge tells you whether the token is active, not yet valid or expired.

If the token uses HMAC (`HS256`, `HS384` or `HS512`), you can type the secret and the tool verifies the signature with Web Crypto as you type. It is useful when debugging an integration: you find out whether the problem is the secret, the algorithm or a tampered payload, without writing code or installing anything.

The tool accepts tokens with a `Bearer` prefix or surrounding whitespace, just as you copy them from an `Authorization` header. If the format is wrong, it tells you which part fails.

Neither the token nor the secret leaves your browser. If you paste a JWT on the ByteKnife home page, it is recognized and opened here.
