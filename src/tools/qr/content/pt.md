---
title: 'Gerador de QR code: URL, texto e Wi-Fi'
description: 'Crie QR codes para uma URL, um texto ou uma rede Wi-Fi, escolha a correção de erros e as cores, e baixe em SVG ou PNG sem marca d’água.'
examples:
  - title: 'QR de uma URL'
    input: |
      https://byteknife.dev
    output: |
      Versão 2 · 25×25 módulos (correção M)
      Downloads: SVG e PNG
  - title: 'QR para compartilhar o Wi-Fi'
    input: |
      SSID: Escritorio-5G · WPA · senha: café&chá;2026
    output: |
      WIFI:T:WPA;S:Escritorio-5G;P:café&chá\;2026;;
faq:
  - q: 'Os códigos expiram ou têm limite de leituras?'
    a: 'Não. O QR contém o texto ou a URL diretamente, sem redirecionar por um serviço intermediário, então funciona para sempre e ninguém registra quem o escaneia.'
  - q: 'Qual nível de correção de erros escolher?'
    a: 'M (15%) serve para quase tudo. Use Q ou H se o código for impresso em superfícies que sujam ou se quiser colocar um logo por cima: o código cresce, mas continua sendo lido mesmo com uma parte danificada.'
  - q: 'Posso usar em material impresso?'
    a: 'Sim. Baixe o SVG para impressão: é vetorial e escala sem perder nitidez. Deixe a margem branca ao redor e mantenha bom contraste entre a cor e o fundo.'
---

Esta ferramenta gera **QR codes** no seu navegador, sem contas, sem marca d’água e sem redirecionamentos: o conteúdo vai direto dentro do código.

Em **Texto ou URL**, escreva o que quiser codificar: um link, um texto, um telefone com `tel:` ou um e-mail com `mailto:`. Em **Wi-Fi**, preencha o nome da rede, o tipo de segurança e a senha, e você recebe o código que os celulares reconhecem para conectar sem digitar a senha. Os caracteres especiais são escapados como o formato exige.

A **correção de erros** define quanto do código pode ser danificado sem deixar de ser lido: de L (7%) a H (30%). Mais correção significa um código mais denso. Você pode mudar a **cor** e o **fundo**; se o contraste for baixo, aparece um aviso porque muitos leitores vão falhar.

Baixe o resultado em **SVG**, vetorial e ideal para impressão, ou em **PNG** de 1024 pixels para apresentações e documentos. Você também vê a versão do código e o tamanho em módulos.

O código é desenhado no navegador com a biblioteca `qrcode`: nem o texto nem a senha do Wi-Fi são enviados a nenhum servidor.
