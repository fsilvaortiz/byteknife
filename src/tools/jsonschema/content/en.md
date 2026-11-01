---
title: 'Online JSON Schema validator'
description: 'Paste a JSON Schema and a JSON document and validate it in your browser: drafts 4, 7, 2019-09 and 2020-12, with each error, its path and the failing rule.'
examples:
  - title: 'Document with several errors'
    input: |
      Schema: integer id ≥ 1, email with format, plan in [free, pro, team], no extra properties
      Document: {"id": 0, "email": "ana.ejemplo.dev", "plan": "enterprise", "activo": true}
    output: |
      /id      minimum               0 is less than 1.
      /email   format                String does not match format "email".
      /plan    enum                  Instance does not match any of ["free","pro","team"].
      (root)   additionalProperties  Property "activo" does not match additional properties schema.
  - title: 'Valid document'
    input: |
      {"id": 42, "email": "ana@ejemplo.dev", "plan": "pro"}
    output: |
      The document matches the schema
faq:
  - q: 'Which JSON Schema versions are supported?'
    a: 'Draft 4, draft 7, 2019-09 and 2020-12. The version comes from $schema; if the schema does not declare it, 2020-12 is used. You can also pick it by hand.'
  - q: 'Does it validate formats like email, date-time or uuid?'
    a: 'Yes, the common formats are checked: email, date, date-time, time, uri, uuid, ipv4, ipv6, hostname and regex, among others.'
  - q: 'Is my data sent to a server?'
    a: "No. Validation uses the @cfworker/json-schema library inside your browser. It was chosen because it interprets the schema without generating code, which works with the site's strict CSP."
---

**JSON Schema** describes the shape a JSON document must have: which fields are required, what type each one is, which values are allowed and which format they follow. OpenAPI, API validation, config files and many editors use it. This validator tells you whether a document matches a schema and, if not, why.

Paste the **schema** on the left and the **document** on the right. Validation runs as you type. If either one is not valid JSON, you get the line and column of the error.

Each problem shows its **path** in the document, like `/items/0/email`, the failing **rule** (`required`, `type`, `enum`, `minimum`, `format`, `additionalProperties`…) and the detail. All errors are listed, not just the first, and messages that only summarize others are left out so the list stays clear.

The **draft** is detected from `$schema` and you can override it: 4, 7, 2019-09 or 2020-12. It is handy for testing a schema before publishing it, debugging why an API rejects a payload or reviewing a service configuration.

Nothing leaves your browser.
