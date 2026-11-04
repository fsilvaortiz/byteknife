---
title: 'Analisar SPF, DMARC e DKIM e arquivos de zona DNS'
description: 'Revise registros SPF, DMARC e DKIM: limite de 10 consultas, +all, p=none, chaves curtas. Também lê arquivos de zona e a saída do dig.'
examples:
  - title: 'Registro SPF'
    input: |
      v=spf1 ip4:203.0.113.0/24 include:_spf.google.com mx ~all
    output: |
      i 2 de 10 consultas DNS permitidas
      i ~all (softfail): os não autorizados são marcados, mas costumam ser entregues.
  - title: 'Registro DMARC'
    input: |
      v=DMARC1; p=none
    output: |
      ! p=none só monitora: não protege contra falsificação.
      i Sem rua: você não receberá relatórios agregados.
faq:
  - q: 'Por que o limite de 10 consultas do SPF importa?'
    a: 'A RFC 7208 limita a 10 os mecanismos que exigem consultas DNS (include, a, mx, ptr, exists e redirect). Se passar disso, o SPF retorna permerror e e-mails legítimos podem falhar. Cada include pode somar mais consultas dentro dele.'
  - q: 'Qual política DMARC usar?'
    a: 'Comece com p=none e um rua para receber relatórios, corrija os remetentes legítimos que falham e depois suba para quarantine e por fim reject, a única que bloqueia a falsificação.'
  - q: 'A ferramenta consulta meu domínio no DNS?'
    a: 'Não. Ela só analisa o texto que você cola; não faz consultas de rede. Obtenha os registros com dig TXT seudominio.com ou dig TXT _dmarc.seudominio.com.'
---

O e-mail do seu domínio depende de três registros TXT: o **SPF** diz quais servidores podem enviar em seu nome, o **DKIM** publica a chave com que as mensagens são assinadas e o **DMARC** diz o que fazer quando eles falham. Um erro em qualquer um pode mandar seus e-mails para o spam ou deixar o domínio aberto à falsificação. Este analisador os revisa.

Cole um registro e o tipo é detectado. No **SPF** você vê cada termo com o resultado (pass, fail, softfail ou neutral), o valor e se conta para o limite de **10 consultas DNS**. A revisão avisa sobre `+all`, `?all`, mecanismos depois de `all`, IPs malformados, `ptr` e registros sem `all`.

No **DMARC** as tags (`p`, `sp`, `rua`, `pct`, `adkim`…) são explicadas, e `p=none` ou `pct` menor que 100 são marcados. No **DKIM** o tipo de chave e o tamanho aproximado são identificados, e você é avisado se a chave estiver revogada ou em modo de teste.

Você também pode colar um **arquivo de zona** ou a saída do `dig`: cada registro aparece numa tabela, os SPF e DMARC contidos são revisados e erros como um CNAME junto com outros registros são apontados. Nada é consultado na rede.
