---
title: 'Convert to camelCase, snake_case, kebab-case and more'
description: 'Convert text to camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, slug, Title Case and more at once. Optionally strip accents.'
examples:
  - title: 'One name in every format'
    input: |
      user profile id
    output: |
      camelCase       userProfileId
      PascalCase      UserProfileId
      snake_case      user_profile_id
      CONSTANT_CASE   USER_PROFILE_ID
      kebab-case      user-profile-id
      dot.case        user.profile.id
      path/case       user/profile/id
      Title Case      User Profile Id
  - title: 'Split an identifier with an acronym'
    input: |
      getHTTPResponseCode
    output: |
      snake_case      get_http_response_code
      CONSTANT_CASE   GET_HTTP_RESPONSE_CODE
      kebab-case      get-http-response-code
faq:
  - q: 'How does it split words?'
    a: 'It splits on spaces, hyphens, underscores, dots and slashes, and on lowercase-to-uppercase changes. Acronyms are kept as one word: getHTTPResponseCode becomes get, HTTP, Response and Code.'
  - q: 'What is stripping accents for?'
    a: 'To get ASCII identifiers and slugs that work in any language, URL or file system. Without that option, accented letters are kept as they are.'
  - q: 'Which format should I use in each language?'
    a: 'By convention, camelCase for variables in JavaScript and Java, PascalCase for classes and types, snake_case in Python, Ruby and SQL columns, CONSTANT_CASE for constants and environment variables, and kebab-case for URLs, CSS classes and file names.'
---

Every language and tool has its own naming convention: variables in `camelCase`, classes in `PascalCase`, database columns in `snake_case`, environment variables in `CONSTANT_CASE`, and URLs or CSS classes in `kebab-case`. This tool converts a piece of text to **every format at once**, so you can copy the one you need without retyping it or getting a letter wrong.

The input can come in any shape: a sentence with spaces, a camelCase identifier, a constant with underscores or a path. The tool finds the word boundaries, even in acronyms such as `HTTP` or `ID` glued to other words, and produces camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, dot.case, path/case, Title Case, Sentence case, lowercase and UPPERCASE.

Turn on **Remove accents** to get ASCII identifiers and **slugs** from titles with accented letters: “Configuración de envío” becomes `configuracion-de-envio`, ready for a URL. Each result has its own copy button.

It is handy when renaming fields between a backend and a frontend, creating i18n keys or mapping column names to object properties. Everything happens in your browser.
