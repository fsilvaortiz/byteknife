---
title: 'Unix timestamp converter with time zones'
description: 'Convert Unix timestamps in seconds, milliseconds, µs or ns to ISO 8601 and to the local time in several time zones, and dates back to Unix.'
examples:
  - title: 'Unix seconds to a date'
    input: |
      1793318400
    output: |
      Unix (s)       1793318400
      Unix (ms)      1793318400000
      ISO 8601 UTC   2026-10-30T00:00:00.000Z
      RFC 7231       Fri, 30 Oct 2026 00:00:00 GMT
      ISO week       2026-W44
      New York       Oct 29, 2026, 8:00 PM (GMT-4)
      Madrid         Oct 30, 2026, 1:00 AM (GMT+1)
  - title: 'ISO 8601 date to Unix'
    input: |
      2026-10-29T12:00:00Z
    output: |
      Unix (s)       1793275200
      Unix (ms)      1793275200000
      RFC 7231       Thu, 29 Oct 2026 12:00:00 GMT
faq:
  - q: 'How does it know whether the number is in seconds or milliseconds?'
    a: 'By the number of digits: up to 11 is read as seconds, up to 14 as milliseconds, up to 17 as microseconds and more as nanoseconds. The chosen unit is shown next to the input.'
  - q: 'What if the date has no time zone?'
    a: 'A date such as 2026-10-29 12:00 without Z or an offset is read as your local time, and the tool tells you so. Add Z for UTC or an offset such as -03:00 to avoid ambiguity.'
  - q: 'Do the time zones account for daylight saving time?'
    a: "Yes. Zones are computed with the IANA database that ships with your browser through Intl, so each city's offset is the one that applies on that exact date."
---

A Unix timestamp counts the time elapsed since January 1, 1970 at midnight UTC. It is how most systems store dates, but it is not readable at a glance. Paste a timestamp and this tool shows the date in **ISO 8601 UTC**, in the RFC 7231 HTTP format, in your local time, as relative time (“3 hours ago”), with its ISO week and day of the year.

The input detects the unit from the number of digits: **seconds** (as in `date +%s` or JWTs), **milliseconds** (like `Date.now()` in JavaScript or Java), **microseconds** (Python, PostgreSQL) and **nanoseconds** (Go, Prometheus). It also works the other way around: paste an ISO 8601 date or text like `2026-10-29 12:00` and you get the timestamp in seconds and milliseconds. Type `now` for the current time.

The **time zones** table shows the same instant in cities across the Americas, Europe and Asia with their offset from UTC, including the daylight saving time in effect on that date. It is what you need to read a production log, coordinate a deploy across teams or check when a token expires.

Everything is computed in your browser with `Date` and `Intl`. If you paste a timestamp on the home page, ByteKnife recognizes it and opens it here.
