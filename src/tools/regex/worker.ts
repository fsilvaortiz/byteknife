import { runRegex, type RegexQuery } from './logic';

// Una expresión con backtracking catastrófico puede bloquear el hilo varios segundos:
// aquí no congela la pestaña y la interfaz termina el worker si pasa el tiempo límite.
self.onmessage = (e: MessageEvent<{ id: number; query: RegexQuery }>) => {
  self.postMessage({ id: e.data.id, result: runRegex(e.data.query) });
};
