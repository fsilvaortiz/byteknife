---
title: 'Descobrir o fabricante de um MAC e converter formatos'
description: 'Identifique o fabricante de um endereço MAC pelo OUI, converta entre formatos (dois-pontos, hífens, Cisco) e calcule o EUI-64 e o IPv6 link-local.'
examples:
  - title: 'MAC de um aparelho Apple'
    input: |
      3C:22:FB:7A:91:0E
    output: |
      Fabricante (OUI)         Apple, Inc.
      Com hífens (Windows)     3C-22-FB-7A-91-0E
      Cisco                    3c22.fb7a.910e
      EUI-64                   3e:22:fb:ff:fe:7a:91:0e
      IPv6 link-local (SLAAC)  fe80::3e22:fbff:fe7a:910e
  - title: 'MAC aleatório de um celular'
    input: |
      da:a1:19:5c:00:07
    output: |
      Unicast · Administrado localmente
      Fabricante (OUI)  Nenhum: é um endereço administrado localmente
faq:
  - q: 'De onde vem o fabricante?'
    a: 'Dos primeiros 24, 28 ou 36 bits do MAC, o OUI, que o IEEE atribui a cada fabricante. A ferramenta inclui a base pública do IEEE e faz a busca no navegador, sem consultar nenhum serviço.'
  - q: 'Por que meu MAC não tem fabricante?'
    a: 'Se o segundo bit do primeiro byte estiver ligado, o endereço é administrado localmente: foi o sistema que o gerou, não o fabricante. Celulares usam MACs aleatórios por rede Wi-Fi, e máquinas virtuais e contêineres também os geram.'
  - q: 'O que é EUI-64?'
    a: 'É a forma de 64 bits que o IPv6 usa para montar a parte de host de um endereço com SLAAC: insere-se FFFE no meio do MAC e inverte-se o bit universal/local.'
---

Um **endereço MAC** identifica a interface de rede de um equipamento e aparece em tabelas ARP, logs de DHCP, consoles de switches e painéis de Wi-Fi, cada um num formato diferente. Esta ferramenta o normaliza e diz o que há por trás.

Digite o MAC com dois-pontos, com hífens, no formato da Cisco (`3c22.fb7a.910e`) ou sem separadores. Você vê o **fabricante** segundo o OUI do IEEE e todos os formatos prontos para copiar, para buscá-lo em qualquer sistema.

Os indicadores mostram se é **unicast** ou **multicast** (o bit I/G) e se é **universal**, atribuído pelo fabricante, ou **administrado localmente** (o bit U/L), como os MACs aleatórios dos celulares ou das máquinas virtuais. O endereço de **broadcast** também é reconhecido.

Além disso, ela calcula o **EUI-64** e o endereço **IPv6 link-local** que o SLAAC gera a partir do MAC, úteis para relacionar um IPv6 `fe80::` ao equipamento que o usa.

A base de fabricantes é baixada junto com a página na primeira vez que você abre esta ferramenta e depois fica guardada para uso offline.
