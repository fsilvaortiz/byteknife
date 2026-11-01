---
title: 'IP and CIDR calculator: IPv4 and IPv6 subnets'
description: 'Work out network, netmask, broadcast, wildcard and hosts for an IPv4 or IPv6 block, split it into subnets, turn ranges into CIDR and identify the IP type.'
examples:
  - title: 'IPv4 /22 block'
    input: |
      192.168.10.37/22
    output: |
      Network        192.168.8.0/22
      Range          192.168.8.0 – 192.168.11.255
      Netmask        255.255.252.0 (/22)
      Wildcard       0.0.3.255
      Broadcast      192.168.11.255
      Usable hosts   192.168.8.1 – 192.168.11.254
      Hosts          1,022
      Type           Private (RFC 1918)
  - title: 'Range to CIDR blocks'
    input: |
      10.0.0.1 - 10.0.0.9
    output: |
      10.0.0.1/32
      10.0.0.2/31
      10.0.0.4/30
      10.0.0.8/31
faq:
  - q: 'Why does a /24 have 254 hosts instead of 256?'
    a: 'In IPv4 the first address identifies the network and the last one is the broadcast, so neither is assigned to a device. The exceptions are /31, used on point-to-point links (RFC 3021), and /32, which is a single address.'
  - q: 'What is the wildcard?'
    a: 'It is the inverted netmask: ones where the mask has zeros. Cisco ACLs and some firewall rules use it to say which bits may vary.'
  - q: 'Can I type the netmask instead of the prefix?'
    a: 'Yes. It accepts 192.168.1.10/24, 192.168.1.10/255.255.255.0 and 192.168.1.10 255.255.255.0. If the mask has gaps, like 255.0.255.0, it tells you it is invalid.'
  - q: 'Does it work with IPv6?'
    a: 'Yes: it shows the network, the range, the expanded and RFC 5952 short forms, reverse DNS under ip6.arpa and the address type (global, ULA, link-local, documentation and so on).'
---

This calculator answers everyday networking questions without a spreadsheet: which network an IP belongs to, how many hosts fit in a block, what the broadcast is, or how to split a network into subnets.

Type an address with its **prefix** (`10.20.30.40/16`), with its **netmask** (`10.20.30.40 255.255.0.0`) or on its own. You get the network in CIDR notation, the full range, the netmask, the wildcard, the broadcast, the first and last usable host and the number of addresses. You also see the address as an integer, in hexadecimal and in binary, its **reverse DNS** name and its IPv4-mapped IPv6 form.

The **type** label tells you whether the IP is public, private (RFC 1918), CGNAT, loopback, link-local, multicast or reserved for documentation. It helps explain why an address is not reachable from the internet.

Under **Subnets**, pick a longer prefix and get the resulting blocks, which is handy when planning VPCs, VLANs or firewall rules. If you type a **range** such as `10.0.0.1 - 10.0.0.9`, the tool returns the smallest list of CIDR blocks that covers it exactly.

Everything works the same with **IPv6**. The math uses 128-bit integers in your browser and never calls a server.
