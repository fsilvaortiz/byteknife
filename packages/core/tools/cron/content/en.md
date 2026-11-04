---
title: 'Cron expression explainer and next run times'
description: 'Translate a 5-field cron expression into plain English, catch errors field by field and compute the next run times in your time zone.'
examples:
  - title: 'A weekday job'
    input: |
      0 9 * * 1-5
    output: |
      At 09:00, Monday through Friday.
      Next: Mon Nov 2 09:00 · Tue Nov 3 09:00 · Wed Nov 4 09:00
  - title: 'An expression that never runs'
    input: |
      0 0 31 2 *
    output: |
      At 00:00, on day 31 of the month, in February.
      This expression never runs (e.g. February 31).
faq:
  - q: 'Which cron format does it accept?'
    a: 'The standard 5-field format: minute, hour, day of month, month and day of week, as in crontab, Kubernetes CronJob or GitHub Actions. It supports *, lists (1,15), ranges (1-5), steps (*/10) and names such as MON or JAN.'
  - q: 'What if I set both day of month and day of week?'
    a: 'As in classic cron, the job runs when either one matches. 0 0 1 * 1 runs on the 1st of every month and also every Monday. The description spells this out.'
  - q: 'Which time zone are the next runs computed in?'
    a: "In your browser's time zone, shown in the list heading. Keep in mind that many servers and services such as GitHub Actions run cron in UTC."
---

A cron expression defines when a scheduled task runs using five fields: **minute, hour, day of month, month and day of week**. It is compact but easy to misread: `0 9 * * 1-5` and `9 0 * * 1-5` look alike and run at very different times. This tool turns the expression into a clear sentence as you type, so you can confirm it does what you expect before it reaches production.

Below the explanation you get a breakdown of every field and the **next run times** computed in your time zone, which is the best proof that the expression is right. If the expression can never fire, like February 31, the tool warns you instead of letting you wait for a job that never comes.

When something is wrong, the error says which field fails and why: a value out of range, an invalid step or an inverted range. Wildcards, lists, ranges, steps and English month and day names (`JAN`, `MON`) are accepted, as well as `7` for Sunday.

The example shortcuts cover the most common cases, such as every 5 minutes, weekdays or the first day of the month. Everything is computed in your browser. If you paste a cron expression on the ByteKnife home page, it is recognized and opened here.
