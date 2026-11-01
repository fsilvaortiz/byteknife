---
title: 'chmod calculator: Unix permissions in octal and rwx'
description: 'Convert Linux and Unix permissions between octal (755, 644) and symbolic (rwxr-xr-x), tick each permission and get the chmod command with setuid and sticky.'
examples:
  - title: 'Octal to symbolic'
    input: |
      755
    output: |
      Octal             755
      Symbolic          rwxr-xr-x
      Command           chmod 755 file
      Symbolic command  chmod u=rwx,g=rx,o=rx file
  - title: 'Reading ls -l output'
    input: |
      drwxrwsr-t
    output: |
      Octal             3775
      Symbolic          rwxrwsr-t
      Symbolic command  chmod u=rwx,g=rwxs,o=rxt file
faq:
  - q: 'What do the three digits mean?'
    a: 'Each digit is the sum of read (4), write (2) and execute (1) for the owner, the group and everyone else, in that order. 7 = 4+2+1 is everything; 5 = 4+1 is read and execute; 6 = 4+2 is read and write.'
  - q: 'Which permissions for an SSH key, a script or a web directory?'
    a: 'An SSH private key: 600. An executable script: 755, or 750 if only your group should run it. Web files: 644. Directories: 755. Avoid 777: anyone can change the contents.'
  - q: 'What are setuid, setgid and sticky?'
    a: "setuid (4) makes an executable run with its owner's permissions, like passwd. setgid (2) does the same with the group, and on a directory makes new files inherit the group. sticky (1) on a directory such as /tmp stops users from deleting each other's files."
  - q: 'Does it accept relative modes like u+x?'
    a: 'Yes. You can type u+x, go-w or a=r: they are applied on top of the current permissions, just like chmod does.'
---

File permissions on Linux, macOS and other Unix systems are written two ways: in **octal**, like `755`, and in **symbolic** form, like `rwxr-xr-x`, which is what `ls -l` shows. This calculator translates between them and lets you tick each permission with checkboxes.

Type an octal mode (`644`, `0600`, `4755`), an `ls -l` string (`-rw-r--r--`, `drwxr-xr-x`), a relative change (`u+x`, `go-w`) or a full command (`chmod 750 deploy.sh`). You get the **read, write and execute** table for the owning user, the group and others. Ticking or unticking a box updates the mode right away.

Special bits are there too: **setuid**, **setgid** and **sticky**, shown in `ls -l` as `s`, `S`, `t` or `T`. The tool warns you when a mode lets anyone write or turns on setuid, two common sources of security problems.

At the bottom you get the command ready to copy in both forms: `chmod 755 file` and `chmod u=rwx,g=rx,o=rx file`. The second one reads better in scripts and Dockerfiles.

Everything is computed in your browser.
