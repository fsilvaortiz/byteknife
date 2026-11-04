---
title: 'UUID v4 and v7 generator and inspector'
description: "Generate UUID v4 and v7 in bulk with the browser's crypto and inspect any UUID: version, variant and the timestamp inside a v7."
examples:
  - title: 'Inspect a UUID v7 and read its date'
    input: |
      01a18a1b-3000-710e-b358-7da2c7ec1136
    output: |
      Version        7
      Variant        RFC 9562
      Embedded date  2026-10-30T00:00:00.000Z
  - title: 'Normalize an uppercase UUID without hyphens'
    input: |
      F47AC10B58CC4372A5670E02B2C3D479
    output: |
      Version     4
      Variant     RFC 9562
      Canonical   f47ac10b-58cc-4372-a567-0e02b2c3d479
faq:
  - q: 'Should I use UUID v4 or v7?'
    a: 'v4 is fully random and works for almost everything. v7 starts with the creation time in milliseconds, so the UUIDs sort by time; that improves database index performance when they are used as primary keys.'
  - q: 'Are the UUIDs generated here secure?'
    a: "They are generated with crypto.getRandomValues, the browser's cryptographic generator. v4 has 122 random bits; v7 follows the timestamp with a 12-bit counter that starts at a random value and 62 random bits. UUIDs in the same v7 batch are strictly increasing."
  - q: 'Does a UUID v7 reveal when it was created?'
    a: 'Yes. The first 48 bits are the Unix timestamp in milliseconds, and the inspector shows it as a date. If that must not be public, use v4.'
---

A UUID is a 128-bit identifier you can generate anywhere without coordinating with a server, with a negligible chance of collision. This tool generates **UUID v4**, fully random, and **UUID v7**, the RFC 9562 format that puts the creation time first and therefore sorts by time. You can generate up to 500 at once, drop the hyphens or switch to uppercase, and copy them all with one click.

The **inspector** accepts any UUID, with or without hyphens, in upper or lower case, and tells you its version, variant and canonical form. For v1, v6 and v7 it also extracts the embedded date. It recognizes the special Nil (`00000000-…`) and Max (`ffffffff-…`) values as well.

v7 is a good choice for primary keys in PostgreSQL, MySQL and other databases with B-tree indexes: because new values arrive in order, inserts do not fragment the index the way v4 does. v4 remains the default when the identifier must not reveal when it was created.

Randomness comes from `crypto.getRandomValues` and nothing leaves your browser. If you paste a UUID on the ByteKnife home page, it opens here in the inspector.
