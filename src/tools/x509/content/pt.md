---
title: 'Decodificar certificado X.509 e CSR (PEM) online'
description: 'Cole um certificado ou CSR em PEM e leia sujeito, emissor, validade, SAN, usos da chave, extensões e impressões SHA-256, sem enviar para nenhum servidor.'
examples:
  - title: 'Certificado de servidor ECDSA'
    input: |
      -----BEGIN CERTIFICATE-----
      MIIC/jCCAqWgAwIBAgIGChssPU5fMAoGCCqGSM49BAMCMD0xCzAJBgNVBAYTAkNM…
      -----END CERTIFICATE-----
    output: |
      Sujeito                  C=CL, O=Ejemplo SpA, CN=api.ejemplo.dev
      Válido até               2036-10-01T00:00:00Z
      Chave pública            EC · P-256 · 256 bits
      Algoritmo de assinatura  ecdsa-with-SHA256
      SAN                      DNS:api.ejemplo.dev, DNS:*.ejemplo.dev, IP:203.0.113.10
      Uso estendido            serverAuth, clientAuth
  - title: 'CSR com dois nomes'
    input: |
      -----BEGIN CERTIFICATE REQUEST-----
      MIIBeTCCAQACAQAwQTELMAkGA1UEBhMCQlIxFTATBgNVBAoMDEV4ZW1wbG8gTHRk…
      -----END CERTIFICATE REQUEST-----
    output: |
      Sujeito        C=BR, O=Exemplo Ltda, CN=www.exemplo.com.br
      Chave pública  EC · P-384 · 384 bits
      SAN            DNS:www.exemplo.com.br, DNS:exemplo.com.br
faq:
  - q: 'É seguro colar um certificado aqui?'
    a: 'Um certificado é público por natureza: todo servidor HTTPS o envia. Mesmo assim, ele é decodificado no seu navegador e não é enviado a lugar nenhum. Nunca cole a chave privada: esta ferramenta não precisa dela.'
  - q: 'A ferramenta verifica a assinatura ou a cadeia de confiança?'
    a: 'Não. Ela lê o conteúdo do certificado; para validar a cadeia use openssl verify ou o navegador. Ela avisa, sim, se o certificado expirou, se ainda não é válido e se é autoassinado.'
  - q: 'Posso colar uma cadeia completa?'
    a: "Sim. Se o texto tiver vários blocos PEM, como um fullchain.pem do Let's Encrypt, um seletor permite revisar cada certificado."
  - q: 'Para que serve o pin SPKI?'
    a: 'É o SHA-256 da chave pública em Base64. O certificate pinning de apps móveis e opções como pinnedpubkey do curl usam esse valor, que não muda ao renovar o certificado mantendo a chave.'
---

Um certificado X.509 em PEM é um bloco Base64 impossível de ler a olho nu. Esta ferramenta o decodifica no navegador e mostra o que você normalmente procura com `openssl x509 -text`, mas organizado e no seu idioma.

Cole um **certificado** (`-----BEGIN CERTIFICATE-----`) ou uma **CSR** (`-----BEGIN CERTIFICATE REQUEST-----`). Você vê o sujeito, o emissor, o número de série, as datas de validade com os dias restantes, o tipo e o tamanho da chave pública, o algoritmo de assinatura e as impressões digitais SHA-256 e SHA-1.

Em **Extensões** aparecem os **nomes alternativos (SAN)**, que são os domínios e IPs para os quais o certificado vale; o uso da chave e o uso estendido, como `serverAuth` para HTTPS; as restrições básicas, que dizem se é uma CA; os identificadores de chave e as URLs de OCSP, CRL e do emissor. As extensões marcadas como **críticas** precisam ser entendidas por quem valida o certificado.

É útil para descobrir por que o navegador rejeita um certificado, confirmar que uma CSR inclui todos os domínios antes de enviá-la à CA, ver quando um certificado vence ou comparar impressões digitais. Se colar uma cadeia com vários certificados, pode percorrê-los um a um.

Apenas o conteúdo é lido: a assinatura e a cadeia de confiança não são verificadas.
