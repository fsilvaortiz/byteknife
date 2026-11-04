---
title: 'Text diff online: compare two texts line by line'
description: 'Compare two versions of a text line by line with a unified view, line numbers and a change count. Optionally ignore trailing whitespace.'
examples:
  - title: 'Changes in a config file'
    input: |
      Original:              Modified:
      host: localhost        host: localhost
      port: 8080             port: 9090
      debug: true            debug: false
                             log: info
    output: |2
        1 1   host: localhost
          2 + port: 9090
          3 + debug: false
          4 + log: info
        2   - port: 8080
        3   - debug: true
      +3 −2
  - title: 'Ignore trailing whitespace'
    input: |
      Original:  "a = 1  " / "b = 2"
      Modified:  "a = 1" / "b = 2"
    output: |
      No differences
faq:
  - q: 'Which algorithm does it use?'
    a: 'It computes the longest common subsequence of lines, the same idea behind diff and git diff. Equal lines are kept and the rest show up as added or removed.'
  - q: 'Is there a size limit?'
    a: 'You can compare files with thousands of lines. If the two texts differ in too many lines to compute without freezing the tab, the tool tells you instead of hanging.'
  - q: 'Can I compare files with Windows line endings?'
    a: 'Yes. CRLF and CR are normalized to LF before comparing, so a file edited on Windows and another on Linux do not show up as completely different.'
---

When you have two versions of a text, such as a config file before and after a change, two API responses or two versions of a SQL query, spotting the differences by eye is slow and error-prone. Paste the **original** on the left and the **modified** text on the right, and the tool shows a **unified view** with added lines in green, removed lines in red and the line numbers on each side.

At the top you see the count of added and removed lines. **Only changes** hides lines that did not change so you can focus on what matters, and **Ignore trailing whitespace** keeps an editor that trims spaces from filling the result with false changes. Windows line endings (CRLF) are normalized automatically.

The swap button flips original and modified, handy when you pasted them the wrong way around. The comparison uses the longest common subsequence algorithm, the same foundation as `diff` and `git diff`, and updates as you type.

Since everything runs in your browser, you can compare files with credentials, internal logs or customer data without uploading them anywhere.
