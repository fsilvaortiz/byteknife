---
title: 'Calculadora chmod: permissões Unix em octal e rwx'
description: 'Converte permissões Linux e Unix entre octal (755, 644) e simbólico (rwxr-xr-x), marca cada permissão e gera o comando chmod com setuid e sticky.'
examples:
  - title: 'De octal para simbólico'
    input: |
      755
    output: |
      Octal              755
      Simbólico          rwxr-xr-x
      Comando            chmod 755 arquivo
      Comando simbólico  chmod u=rwx,g=rx,o=rx arquivo
  - title: 'Lendo a saída do ls -l'
    input: |
      drwxrwsr-t
    output: |
      Octal              3775
      Simbólico          rwxrwsr-t
      Comando simbólico  chmod u=rwx,g=rwxs,o=rxt arquivo
faq:
  - q: 'O que significam os três dígitos?'
    a: 'Cada dígito é a soma de ler (4), escrever (2) e executar (1) para o dono, o grupo e os demais, nessa ordem. 7 = 4+2+1 é tudo; 5 = 4+1 é ler e executar; 6 = 4+2 é ler e escrever.'
  - q: 'Quais permissões usar numa chave SSH, num script ou num diretório web?'
    a: 'Chave privada SSH: 600. Script executável: 755, ou 750 se só o seu grupo deve usá-lo. Arquivos web: 644. Diretórios: 755. Evite 777: qualquer um pode alterar o conteúdo.'
  - q: 'O que são setuid, setgid e sticky?'
    a: 'setuid (4) faz um executável rodar com as permissões do dono, como o passwd. setgid (2) faz o mesmo com o grupo e, num diretório, faz os arquivos novos herdarem o grupo. sticky (1) num diretório como /tmp impede que alguém apague arquivos de outros.'
  - q: 'Aceita modos relativos como u+x?'
    a: 'Sim. Você pode digitar u+x, go-w ou a=r: eles são aplicados sobre as permissões atuais, como o chmod faria.'
---

As permissões de arquivos no Linux, macOS e outros Unix são escritas de duas formas: em **octal**, como `755`, e em **simbólico**, como `rwxr-xr-x`, que é o que o `ls -l` mostra. Esta calculadora traduz entre as duas e deixa você marcar cada permissão com caixas de seleção.

Digite um modo em octal (`644`, `0600`, `4755`), uma string do `ls -l` (`-rw-r--r--`, `drwxr-xr-x`), uma mudança relativa (`u+x`, `go-w`) ou um comando completo (`chmod 750 deploy.sh`). Você vê a tabela de **leitura, escrita e execução** para o usuário dono, o grupo e os demais. Ao marcar ou desmarcar uma caixa, o modo é atualizado na hora.

Os bits especiais também estão lá: **setuid**, **setgid** e **sticky**, que no `ls -l` aparecem como `s`, `S`, `t` ou `T`. A ferramenta avisa quando um modo deixa qualquer um escrever ou ativa o setuid, duas causas frequentes de problemas de segurança.

No final você tem o comando pronto para copiar nas duas formas: `chmod 755 arquivo` e `chmod u=rwx,g=rx,o=rx arquivo`. A segunda é mais legível em scripts e Dockerfiles.

Tudo é calculado no seu navegador.
