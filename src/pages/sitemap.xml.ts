import type { APIRoute } from 'astro';
import { tools } from '../core/registry';
import { sitemap } from '../core/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(sitemap(site!.href, ['', ...tools.map((t) => `${t.id}/`)]), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
