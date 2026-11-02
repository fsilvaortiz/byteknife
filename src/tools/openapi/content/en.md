---
title: 'Online OpenAPI and Swagger validator'
description: 'Validate an OpenAPI 3.0, 3.1, 3.2 or Swagger 2.0 spec in your browser: official schema, broken $refs, path parameters and duplicate operationIds.'
examples:
  - title: 'Undeclared parameter and a typo'
    input: |
      openapi: 3.1.0
      info: { title: Orders API, version: 2.14.0 }
      paths:
        /orders/{orderId}:
          get:
            responses:
              '200':
                descripton: The order
    output: |
      5  Error  The path uses {orderId}, but no in: path parameter declares it
                paths › /orders/{orderId} › get
      7  Error  Missing required property “description”
                paths › /orders/{orderId} › get › responses › 200
      7  Error  Property not allowed here: “descripton”
                paths › /orders/{orderId} › get › responses › 200
  - title: 'Broken reference'
    input: |
      openapi: 3.0.3
      info: { title: Payments, version: '1' }
      paths:
        /payments:
          post:
            requestBody:
              $ref: '#/components/requestBodies/Payment'
            responses:
              '201': { description: Created }
    output: |
      6  Error  The reference #/components/requestBodies/Payment does not exist in the document
                paths › /payments › post › requestBody
faq:
  - q: 'Which OpenAPI versions are supported?'
    a: 'OpenAPI 3.0, 3.1 and 3.2, plus Swagger 2.0. The version comes from the document’s openapi or swagger field, and the structure is validated against the official OpenAPI Initiative JSON Schema for that version.'
  - q: 'What does it check beyond the official schema?'
    a: 'Things the schema cannot express: local $refs that do not exist, path parameters like {id} that are missing or extra, duplicate parameters, duplicate operationIds, equivalent paths such as /users/{id} and /users/{name}, undefined security schemes and unused schemas.'
  - q: 'Does it follow $refs to other files or URLs?'
    a: 'No. External references are flagged as warnings and never downloaded: the tool makes no network request with your spec.'
  - q: 'Is my spec sent to a server?'
    a: 'No. YAML or JSON parsing and validation happen in your browser, so you can paste internal specs without publishing them.'
---

**OpenAPI** (formerly Swagger) describes an HTTP API: its paths, operations, parameters, bodies, responses and security. Docs, clients, servers and contract tests are generated from that file, so a mistake in the spec ends up as broken code or documentation that lies. This validator tells you whether your spec is valid and, if not, where and why.

Paste the spec as **YAML or JSON**. The version is detected automatically: OpenAPI 3.0, 3.1, 3.2 or Swagger 2.0. Validation runs as you type, and each problem shows its **line**, its **location** in the document (for example, `paths › /orders › post › responses › 201`) and a plain-language detail.

There are two kinds of checks. The **structural** check uses the official OpenAPI Initiative JSON Schema and finds missing required properties, misspelled names and disallowed values; for the schema’s alternatives it shows only the one that applies, not a wall of repeated errors. The **extra checks** cover what the schema cannot see: broken `$ref`s, undeclared path parameters, duplicate `operationId`s, equivalent paths and undefined security schemes. Unused schemas show up as warnings.

Below you get a summary with the API title and version and the list of operations, handy for reviewing at a glance what the API exposes.

Nothing leaves your browser.
