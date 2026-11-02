import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'markdown',
  category: 'text',
  order: 4,
  i18n: {
    es: {
      name: 'Vista previa Markdown',
      description:
        'Escribe Markdown con tablas, tareas y bloques de código y mira el resultado en vivo, o copia el HTML generado.',
      keywords: ['markdown', 'md', 'preview', 'vista previa', 'readme', 'gfm', 'html', 'editor'],
    },
    en: {
      name: 'Markdown preview',
      description:
        'Write Markdown with tables, task lists and code blocks and see the result live, or copy the generated HTML.',
      keywords: ['markdown', 'md', 'preview', 'readme', 'gfm', 'html', 'editor', 'render'],
    },
    pt: {
      name: 'Prévia de Markdown',
      description:
        'Escreva Markdown com tabelas, tarefas e blocos de código e veja o resultado ao vivo, ou copie o HTML gerado.',
      keywords: ['markdown', 'md', 'preview', 'previa', 'readme', 'gfm', 'html', 'editor'],
    },
  },
};
