---
title: 'Convert JSON to CSV and CSV to JSON'
description: 'Convert JSON arrays of objects to CSV and back, with comma, semicolon or tab delimiters. Detects numbers and booleans. All in your browser.'
examples:
  - title: 'JSON to CSV with a value that contains a comma'
    input: |
      [{"id":1,"name":"Ana","city":"Santiago"},{"id":2,"name":"Luis","city":"Lima, Perú"}]
    output: |
      id,name,city
      1,Ana,Santiago
      2,Luis,"Lima, Perú"
  - title: 'Semicolon CSV to JSON with detected types'
    input: |
      id;name;active
      1;Ana;true
      2;"Luis ""Lucho""";false
    output: |
      [
        { "id": 1, "name": "Ana", "active": true },
        { "id": 2, "name": "Luis \"Lucho\"", "active": false }
      ]
faq:
  - q: 'What happens to nested objects?'
    a: 'Each top-level key becomes a column. If a value is an object or an array, it is written as JSON inside the cell, quoted, so no information is lost.'
  - q: 'Why does Excel show everything in a single column?'
    a: 'In regions that use a decimal comma, Excel expects a semicolon as the delimiter. Choose “Semicolon ;” before copying the output and Excel will split it into columns.'
  - q: 'How are quotes escaped in CSV?'
    a: 'Following RFC 4180: a cell that contains the delimiter, a line break or quotes is wrapped in double quotes, and each inner quote is doubled. The tool does this when writing and understands it when reading.'
---

This tool converts in both directions between a JSON array of objects and CSV. Going from JSON to CSV, the first row holds the column names, taken from every key that appears in the objects, even when they do not all share the same keys. Cells that contain the delimiter, quotes or line breaks are wrapped in quotes as RFC 4180 requires, so Excel, Google Sheets or any CSV reader can open them without breaking rows.

Going from CSV to JSON, each row becomes an object whose keys are the headers. If you turn on **Detect numbers and booleans**, values such as `42`, `3.5`, `true` or `false` are converted to their type instead of staying as strings, which saves a step when the JSON goes straight into an API call or a test fixture. If the file has an unclosed quote, you will see the line where it starts.

You can pick comma, semicolon or tab as the delimiter. Semicolon is the usual choice for spreadsheets set up in Spanish, Portuguese and other locales where the comma is the decimal separator.

The conversion happens entirely in your browser, so you can paste exports with customer or production data and they never leave the tab.
