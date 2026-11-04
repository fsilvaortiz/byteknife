---
title: 'Gerar par de chaves SSH, Ed25519, ECDSA e RSA'
description: 'Gere chaves pública e privada Ed25519, ECDSA ou RSA no navegador e copie em formato OpenSSH, PEM (PKCS#8) ou JWK, com a impressão digital SHA256.'
examples:
  - title: 'Chave SSH Ed25519 com comentário'
    input: |
      Algoritmo Ed25519 · Comentário ada@notebook · Formato OpenSSH
    output: |
      ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINdamAGCsQq31Uv+08lkBzoO4XLz2qYjJa8CGmj3B1Ea ada@notebook
      (exemplo: cada par gerado é diferente)
  - title: 'Chave pública ECDSA P-256 em PEM'
    input: |
      Algoritmo ECDSA P-256 · Formato PEM
    output: |
      -----BEGIN PUBLIC KEY-----
      MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE…
      -----END PUBLIC KEY-----
faq:
  - q: 'A chave privada é enviada para algum servidor?'
    a: 'Não. O par é gerado com Web Crypto (crypto.subtle.generateKey) dentro desta aba e não é transmitido nem armazenado. Ao recarregar a página ele desaparece.'
  - q: 'Qual algoritmo devo usar?'
    a: 'Ed25519 para SSH e assinaturas novas: é rápido, seguro e tem chaves curtas. ECDSA P-256 se você precisa de JWT ES256 ou de hardware sem suporte a Ed25519, e RSA 3072 ou 4096 para sistemas antigos.'
  - q: 'A chave privada OpenSSH funciona com ssh e ssh-keygen?'
    a: 'Sim. Ela usa o formato openssh-key-v1 sem frase secreta, o mesmo de ssh-keygen -N "". Salve com permissões 600 e, para protegê-la, adicione uma frase com ssh-keygen -p -f arquivo.'
  - q: 'Para que serve a impressão digital SHA256?'
    a: 'Ela identifica a chave pública sem mostrá-la inteira. É a mesma exibida por ssh-keygen -l e pelo GitHub na lista de chaves SSH, então você confere se enviou a chave certa.'
---

Esta ferramenta gera um **par de chaves** assimétricas, pública e privada, sem instalar nada e sem que a privada saia do seu computador. Ela usa Web Crypto, a API criptográfica do navegador, com o gerador aleatório seguro do sistema operacional.

Escolha o **algoritmo**: Ed25519, ECDSA com as curvas P-256 ou P-384, ou RSA de 2048, 3072 ou 4096 bits. Depois troque o **formato** de saída. **OpenSSH** entrega a linha `ssh-ed25519 AAAA…` pronta para o `authorized_keys` ou para colar no GitHub, e a chave privada no formato que `ssh` e `ssh-keygen` leem. **PEM** usa PKCS#8 para a privada e SPKI para a pública, o que OpenSSL, Node.js, Java e as bibliotecas de JWT esperam. **JWK** entrega o JSON da RFC 7517, útil para um endpoint JWKS ou para importar a chave com Web Crypto.

O **comentário** opcional é adicionado ao final das chaves OpenSSH para reconhecê-las depois, por exemplo `voce@notebook`. A **impressão digital** SHA256 coincide com a de `ssh-keygen -l`.

Usos típicos: criar uma chave de deploy para um repositório, uma chave SSH para um servidor novo, ou um par ES256 ou EdDSA para assinar tokens em desenvolvimento. Em produção, guarde a privada num gerenciador de segredos e nunca a envie ao repositório.
