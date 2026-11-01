---
title: 'Prévia de Markdown online (GFM)'
description: 'Escreva Markdown e veja o resultado na hora: títulos, tabelas, listas de tarefas e código no estilo do GitHub. Copie o HTML gerado.'
examples:
  - title: 'Lista de tarefas e código'
    input: |
      ## Pendências
      - [x] Revisar o PR
      - [ ] Publicar `v2.15`
    output: |
      <h2>Pendências</h2>
      <ul>
      <li><span class="md-task">☑</span> Revisar o PR</li>
      <li><span class="md-task">☐</span> Publicar <code>v2.15</code></li>
      </ul>
  - title: 'Tabela com alinhamento'
    input: |
      | Região    | Latência |
      |-----------|---------:|
      | sa-east-1 |    84 ms |
    output: |
      Região      Latência
      sa-east-1      84 ms
faq:
  - q: 'Qual variante de Markdown é usada?'
    a: 'GitHub Flavored Markdown (GFM), com tabelas, listas de tarefas, tachado, links automáticos e blocos de código com linguagem. É o que READMEs, issues e a maioria das wikis usam.'
  - q: 'Por que o HTML que escrevi não aparece?'
    a: 'Por segurança, o HTML dentro do Markdown é mostrado como texto e links javascript: são desativados. Assim, colar um documento de origem desconhecida não executa nada no navegador.'
  - q: 'Por que as imagens não carregam?'
    a: 'Imagens externas são substituídas pelo texto alternativo: carregá-las faria uma requisição a outro servidor, e a ferramenta não envia nada para fora do navegador. Imagens data: incorporadas são exibidas.'
---

Markdown é o formato dos READMEs, da documentação, das issues e das notas de versão. Esta ferramenta permite escrevê-lo e ver o resultado **ao vivo**, sem abrir um repositório nem instalar um editor.

Escreva à esquerda e a prévia é atualizada enquanto você digita. O **GitHub Flavored Markdown** é aceito: títulos, ênfase, listas, listas de tarefas, tabelas com alinhamento, citações, links e blocos de código. No topo você vê quantas palavras o texto tem e o tempo estimado de leitura.

Mude para **HTML** para ver o código que o Markdown gera, pronto para colar num e-mail, num CMS ou num template. **Copiar HTML** copia com um clique.

A prévia é segura: o HTML cru é mostrado como texto, links `javascript:` perdem o destino e imagens externas não são baixadas. Você pode revisar o README de um projeto alheio ou um texto gerado por IA sem que nada seja executado.

Tudo acontece no navegador: o que você escreve não é salvo nem enviado para nenhum servidor.
