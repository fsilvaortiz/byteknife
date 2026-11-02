// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

const START = /^(?:HTTP\/[\d.]+ \d{3}|(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) \S+ HTTP\/[\d.]+)/;
const KNOWN =
  /^(?:content-type|content-length|cache-control|set-cookie|server|date|host|user-agent|accept|accept-encoding|authorization|location|etag|vary|strict-transport-security|content-security-policy|x-[\w-]+|access-control-[\w-]+):/i;

/** Mensaje HTTP: empieza con línea de estado o de petición, o trae varias cabeceras conocidas. */
export function looksLikeHeaders(input: string): 'message' | 'headers' | null {
  if (START.test(input)) return 'message';
  const known = input.split('\n').filter((l) => KNOWN.test(l.trim())).length;
  return known >= 2 ? 'headers' : null;
}
