import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Ids de las herramientas con UI (src/tools/<id>/Tool.tsx), en orden alfabético. */
export const TOOL_IDS = readdirSync(join('src', 'tools')).filter((id) =>
  existsSync(join('src', 'tools', id, 'Tool.tsx')),
);
