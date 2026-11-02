---
title: 'Online Markdown preview (GFM)'
description: 'Write Markdown and see it rendered instantly: headings, tables, task lists and code, GitHub style. Copy the generated HTML.'
examples:
  - title: 'Task list and code'
    input: |
      ## To do
      - [x] Review the PR
      - [ ] Deploy `v2.15`
    output: |
      <h2>To do</h2>
      <ul>
      <li><span class="md-task">☑</span> Review the PR</li>
      <li><span class="md-task">☐</span> Deploy <code>v2.15</code></li>
      </ul>
  - title: 'Aligned table'
    input: |
      | Region    | Latency |
      |-----------|--------:|
      | sa-east-1 |   84 ms |
    output: |
      Region      Latency
      sa-east-1     84 ms
faq:
  - q: 'Which Markdown flavor does it use?'
    a: 'GitHub Flavored Markdown (GFM), with tables, task lists, strikethrough, autolinks and fenced code blocks with a language. It is what READMEs, issues and most wikis use.'
  - q: 'Why is the HTML I wrote not rendered?'
    a: 'For safety, HTML inside the Markdown is shown as text and javascript: links are disabled. Pasting a document from an unknown source runs nothing in your browser.'
  - q: 'Why are images not loaded?'
    a: 'External images are replaced with their alt text: loading them would make a request to another server, and the tool never sends anything outside your browser. Embedded data: images are shown.'
---

Markdown is the format of READMEs, documentation, issues and release notes. This tool lets you write it and see the result **live**, without opening a repository or installing an editor.

Type on the left and the preview updates as you go. **GitHub Flavored Markdown** is supported: headings, emphasis, lists, task lists, aligned tables, quotes, links and code blocks. At the top you see the word count and the estimated reading time.

Switch to **HTML** to see the code the Markdown produces, ready to paste into an email, a CMS or a template. **Copy HTML** copies it in one click.

The preview is safe: raw HTML is shown as text, `javascript:` links lose their target and external images are not downloaded. You can review someone else's README or AI-generated text without anything running.

Everything happens in your browser: what you write is never stored, logged or sent to a server, so drafts with internal details stay private.
