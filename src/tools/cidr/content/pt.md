---
title: 'Calculadora IP e CIDR: sub-redes IPv4 e IPv6'
description: 'Calcula rede, máscara, broadcast, wildcard e hosts de um bloco IPv4 ou IPv6, divide em sub-redes, converte faixas em CIDR e identifica o tipo de IP.'
examples:
  - title: 'Bloco IPv4 /22'
    input: |
      192.168.10.37/22
    output: |
      Rede                192.168.8.0/22
      Faixa               192.168.8.0 – 192.168.11.255
      Máscara             255.255.252.0 (/22)
      Wildcard            0.0.3.255
      Broadcast           192.168.11.255
      Hosts utilizáveis   192.168.8.1 – 192.168.11.254
      Hosts               1.022
      Tipo                Privada (RFC 1918)
  - title: 'Faixa para blocos CIDR'
    input: |
      10.0.0.1 - 10.0.0.9
    output: |
      10.0.0.1/32
      10.0.0.2/31
      10.0.0.4/30
      10.0.0.8/31
faq:
  - q: 'Por que uma /24 tem 254 hosts e não 256?'
    a: 'Em IPv4 o primeiro endereço identifica a rede e o último é o broadcast, então nenhum dos dois é atribuído a um equipamento. As exceções são /31, usada em enlaces ponto a ponto (RFC 3021), e /32, que é um único endereço.'
  - q: 'O que é a wildcard?'
    a: 'É a máscara invertida: uns onde a máscara tem zeros. As ACLs da Cisco e algumas regras de firewall usam a wildcard para indicar quais bits podem variar.'
  - q: 'Posso digitar a máscara em vez do prefixo?'
    a: 'Sim. Aceita 192.168.1.10/24, 192.168.1.10/255.255.255.0 e 192.168.1.10 255.255.255.0. Se a máscara tiver buracos, como 255.0.255.0, avisa que não é válida.'
  - q: 'Funciona com IPv6?'
    a: 'Sim: mostra a rede, a faixa, as formas expandida e abreviada segundo a RFC 5952, o DNS reverso em ip6.arpa e o tipo de endereço (global, ULA, link-local, documentação etc.).'
---

Esta calculadora responde às perguntas de rede do dia a dia sem abrir uma planilha: a qual rede pertence um IP, quantos hosts cabem num bloco, qual é o broadcast ou como dividir uma rede em sub-redes.

Digite um endereço com o **prefixo** (`10.20.30.40/16`), com a **máscara** (`10.20.30.40 255.255.0.0`) ou sozinho. Você vê a rede em notação CIDR, a faixa completa, a máscara, a wildcard, o broadcast, o primeiro e o último host utilizável e a quantidade de endereços. Também vê o endereço como inteiro, em hexadecimal e em binário, o nome de **DNS reverso** e a forma mapeada em IPv6.

O rótulo de **tipo** indica se o IP é público, privado (RFC 1918), CGNAT, loopback, link-local, multicast ou de documentação. Isso ajuda a entender por que um endereço não é acessível pela internet.

Em **Sub-redes** você escolhe um prefixo mais longo e recebe a lista de blocos resultantes, útil para planejar VPCs, VLANs ou regras de firewall. Se digitar uma **faixa** como `10.0.0.1 - 10.0.0.9`, a ferramenta devolve a menor lista de blocos CIDR que a cobre exatamente.

Tudo funciona igual com **IPv6**. O cálculo usa inteiros de 128 bits no navegador e não consulta nenhum servidor.
