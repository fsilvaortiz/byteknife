---
title: 'Converter para camelCase, snake_case, kebab-case e mais'
description: 'Converta texto para camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, slug, Title Case e mais formatos de uma vez. Tira acentos.'
examples:
  - title: 'Um nome em todos os formatos'
    input: |
      user profile id
    output: |
      camelCase       userProfileId
      PascalCase      UserProfileId
      snake_case      user_profile_id
      CONSTANT_CASE   USER_PROFILE_ID
      kebab-case      user-profile-id
      dot.case        user.profile.id
      path/case       user/profile/id
      Title Case      User Profile Id
  - title: 'Slug sem acentos a partir de um título'
    input: |
      Configuração de envio      (Remover acentos ativado)
    output: |
      kebab-case / slug   configuracao-de-envio
      snake_case          configuracao_de_envio
      camelCase           configuracaoDeEnvio
faq:
  - q: 'Como as palavras são separadas?'
    a: 'O corte acontece em espaços, hífens, sublinhados, pontos e barras, e também nas mudanças de minúscula para maiúscula. Siglas são mantidas como uma palavra: getHTTPResponseCode vira get, HTTP, Response e Code.'
  - q: 'Para que serve remover acentos?'
    a: 'Para obter identificadores e slugs ASCII, que funcionam em qualquer linguagem, URL ou sistema de arquivos. Sem essa opção, as letras acentuadas são mantidas como estão.'
  - q: 'Qual formato uso em cada linguagem?'
    a: 'Por convenção, camelCase para variáveis em JavaScript e Java, PascalCase para classes e tipos, snake_case em Python, Ruby e colunas SQL, CONSTANT_CASE para constantes e variáveis de ambiente, e kebab-case para URLs, classes CSS e nomes de arquivo.'
---

Cada linguagem e cada ferramenta tem sua convenção de nomes: variáveis em `camelCase`, classes em `PascalCase`, colunas de banco de dados em `snake_case`, variáveis de ambiente em `CONSTANT_CASE` e URLs ou classes CSS em `kebab-case`. Esta ferramenta converte um texto para **todos os formatos de uma vez**, para você copiar o que precisa sem reescrever à mão nem errar uma letra.

A entrada pode vir em qualquer forma: uma frase com espaços, um identificador em camelCase, uma constante com sublinhados ou um caminho. A ferramenta detecta os limites das palavras, inclusive em siglas como `HTTP` ou `ID` grudadas em outras palavras, e gera camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, dot.case, path/case, Title Case, Sentence case, minúsculas e MAIÚSCULAS.

Ative **Remover acentos** para obter identificadores e **slugs** ASCII a partir de títulos em português ou espanhol: «Configuração de envio» vira `configuracao-de-envio`, pronto para uma URL. Cada resultado tem seu botão de copiar.

É útil para renomear campos entre um backend e um frontend, criar chaves de i18n ou passar nomes de colunas para propriedades de um objeto. Tudo acontece no seu navegador.
