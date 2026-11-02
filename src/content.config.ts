import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Contenido SEO de cada herramienta: src/tools/<id>/content/<idioma>.md. El cuerpo es la
// explicación (150–300 palabras, lo revisa content.test.ts); el frontmatter, lo demás.
const tools = defineCollection({
  loader: glob({
    pattern: '*/content/*.md',
    base: './src/tools',
    generateId: ({ entry }) => entry.replace('/content/', '/').replace(/\.md$/, ''),
  }),
  schema: z.object({
    /** <title> de la página, sin « · ByteKnife». */
    title: z.string().max(60),
    /** meta description: lo que se lee en el resultado de búsqueda. */
    description: z.string().min(70).max(160),
    examples: z
      .array(z.object({ title: z.string(), input: z.string(), output: z.string() }))
      .length(2),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3),
  }),
});

export const collections = { tools };
