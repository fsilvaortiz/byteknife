---
title: 'Convert YAML to JSON and JSON to YAML'
description: 'Convert YAML to JSON and back in your browser: anchors and aliases, multiple documents, your choice of indentation and errors with line and column.'
examples:
  - title: 'YAML config to JSON'
    input: |
      service: payments-api
      replicas: 3
      ports:
        - 8080
        - 9090
    output: |
      {
        "service": "payments-api",
        "replicas": 3,
        "ports": [
          8080,
          9090
        ]
      }
  - title: 'JSON to YAML'
    input: |
      {"env": {"LOG_LEVEL": "info", "FEATURE_PIX": true}}
    output: |
      env:
        LOG_LEVEL: info
        FEATURE_PIX: true
faq:
  - q: 'What happens to anchors and aliases?'
    a: 'They are resolved: an alias *img copies the value of the &img anchor, and merge keys <<: *base blend in the referenced map. The resulting JSON has no references.'
  - q: 'What if the YAML has several documents?'
    a: 'If the text has several documents separated by ---, like a Kubernetes manifest with several resources, the result is a JSON array with one element per document.'
  - q: 'Are comments lost?'
    a: 'Yes. JSON has no comments, so they are dropped going from YAML to JSON and cannot come back when converting to YAML again.'
  - q: 'Is my config sent to a server?'
    a: 'No. The conversion uses the yaml library inside your browser; neither the YAML nor the JSON leaves the tab.'
---

YAML is the format of Kubernetes, Docker Compose, GitHub Actions, OpenAPI and plenty of configuration files; JSON is what APIs, `jq` and most languages expect. This tool converts between the two as you type.

In **YAML → JSON**, **anchors** (`&name`), **aliases** (`*name`) and merge keys (`<<:`) are resolved, types are kept (numbers, booleans, `null`) and, if the text has several documents separated by `---`, you get an array with one entry per document. In **JSON → YAML**, the output uses block style and does not wrap long lines, so you can paste it straight into a config file.

If something is wrong, you see the message with its **line and column**: an unclosed list, bad indentation or a duplicate key. It is the quickest way to find out why `kubectl apply` or a CI workflow rejects a file.

When you switch direction, the output becomes the new input, so you can go back and forth. Pick 2 or 4 spaces of indentation to match your project.

Keep in mind that YAML comments do not exist in JSON and are lost in the conversion. Everything happens in your browser.
