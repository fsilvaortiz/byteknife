---
title: 'SPF, DMARC and DKIM checker and DNS zone reader'
description: 'Check SPF, DMARC and DKIM records: the 10-lookup limit, +all, p=none, short keys. It also reads DNS zone files and dig output.'
examples:
  - title: 'SPF record'
    input: |
      v=spf1 ip4:203.0.113.0/24 include:_spf.google.com mx ~all
    output: |
      i 2 of 10 allowed DNS lookups
      i ~all (softfail): unauthorized mail is flagged but usually delivered.
  - title: 'DMARC record'
    input: |
      v=DMARC1; p=none
    output: |
      ! p=none only monitors: it does not stop spoofing.
      i No rua: you will not get aggregate reports.
faq:
  - q: 'Why does the SPF 10-lookup limit matter?'
    a: 'RFC 7208 limits to 10 the mechanisms that need DNS queries (include, a, mx, ptr, exists and redirect). Going over returns permerror and legitimate mail may fail. Each include can add more lookups inside it.'
  - q: 'Which DMARC policy should I use?'
    a: 'Start with p=none and a rua to receive reports, fix the legitimate senders that fail, then move to quarantine and finally reject, the only one that blocks spoofing.'
  - q: 'Does it query my domain in DNS?'
    a: 'No. The tool only analyzes the text you paste; it makes no network queries. Get the records with dig TXT yourdomain.com or dig TXT _dmarc.yourdomain.com.'
---

Your domain's email depends on three TXT records: **SPF** says which servers may send on your behalf, **DKIM** publishes the key messages are signed with and **DMARC** says what to do when they fail. A mistake in any of them can send your mail to spam or leave your domain open to spoofing. This analyzer checks them.

Paste a record and its type is detected. For **SPF** you see each term with its result (pass, fail, softfail or neutral), its value and whether it counts toward the **10 DNS lookup** limit. The review warns about `+all`, `?all`, mechanisms after `all`, malformed IPs, `ptr` and records without `all`.

For **DMARC** the tags (`p`, `sp`, `rua`, `pct`, `adkim`…) are explained, and `p=none` or a `pct` below 100 are flagged. For **DKIM** the key type and approximate size are identified, and you are warned if the key is revoked or in testing mode.

You can also paste a **zone file** or `dig` output: each record shows up in a table, any SPF and DMARC records inside are checked, and errors such as a CNAME alongside other records are flagged. Nothing is queried over the network.
