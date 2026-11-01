---
title: 'MAC address vendor lookup and format converter'
description: 'Find the vendor of a MAC address from its OUI, convert it between formats (colons, hyphens, Cisco) and work out its EUI-64 and IPv6 link-local address.'
examples:
  - title: 'MAC of an Apple device'
    input: |
      3C:22:FB:7A:91:0E
    output: |
      Vendor (OUI)             Apple, Inc.
      Hyphenated (Windows)     3C-22-FB-7A-91-0E
      Cisco                    3c22.fb7a.910e
      EUI-64                   3e:22:fb:ff:fe:7a:91:0e
      IPv6 link-local (SLAAC)  fe80::3e22:fbff:fe7a:910e
  - title: 'Random MAC from a phone'
    input: |
      da:a1:19:5c:00:07
    output: |
      Unicast · Locally administered
      Vendor (OUI)  None: it is a locally administered address
faq:
  - q: 'Where does the vendor come from?'
    a: 'From the first 24, 28 or 36 bits of the MAC, the OUI, which the IEEE assigns to each manufacturer. The tool ships the public IEEE database and looks it up in your browser, without calling any service.'
  - q: 'Why does my MAC have no vendor?'
    a: 'If the second bit of the first byte is set, the address is locally administered: the system generated it, not the manufacturer. Phones use random MACs per Wi-Fi network, and virtual machines and containers generate them too.'
  - q: 'What is EUI-64?'
    a: 'It is the 64-bit form IPv6 uses to build the host part of an address with SLAAC: FFFE is inserted in the middle of the MAC and the universal/local bit is flipped.'
---

A **MAC address** identifies a device's network interface and shows up in ARP tables, DHCP logs, switch consoles and Wi-Fi dashboards, each in a different format. This tool normalizes it and tells you what is behind it.

Type the MAC with colons, hyphens, in Cisco format (`3c22.fb7a.910e`) or without separators. You get the **vendor** from the IEEE OUI registry and every format ready to copy, so you can search for it in any system.

The flags show whether it is **unicast** or **multicast** (the I/G bit) and whether it is **universal**, assigned by the manufacturer, or **locally administered** (the U/L bit), like the random MACs of phones or virtual machines. The **broadcast** address is recognized too.

It also works out the **EUI-64** and the **IPv6 link-local** address that SLAAC derives from the MAC, handy for linking an `fe80::` IPv6 address to the device using it.

The vendor database downloads with the page the first time you open this tool and is then kept for offline use.
