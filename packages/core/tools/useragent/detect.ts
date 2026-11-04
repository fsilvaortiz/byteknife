// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const looksLikeUserAgent = (input: string) =>
  /^(?:user-agent:\s*)?Mozilla\/\d\.\d \(/i.test(input.trim()) ||
  /^(?:curl|Wget|python-requests|PostmanRuntime|okhttp|Go-http-client)\/[\d.]+/.test(input.trim());
