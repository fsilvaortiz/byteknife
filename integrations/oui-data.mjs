// Módulo virtual «virtual:oui»: la base OUI de la IEEE (paquete oui-data) reducida a una
// línea «PREFIJO<TAB>Fabricante» por registro. Solo la importa con import() la herramienta
// MAC, así que pesa únicamente cuando alguien busca un fabricante.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const ID = 'virtual:oui';
const RESOLVED = `\0${ID}`;

export function ouiText() {
  // El paquete solo exporta «.» (el JSON); require.resolve da su ruta sin cargarlo dos veces.
  const require = createRequire(import.meta.url);
  const data = JSON.parse(readFileSync(require.resolve('oui-data'), 'utf8'));
  return Object.entries(data)
    .map(([prefix, info]) => `${prefix}\t${String(info).split('\n')[0].trim()}`)
    .sort()
    .join('\n');
}

export default function ouiData() {
  return {
    name: 'byteknife:oui-data',
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load: (id) => (id === RESOLVED ? `export default ${JSON.stringify(ouiText())};` : null),
  };
}
