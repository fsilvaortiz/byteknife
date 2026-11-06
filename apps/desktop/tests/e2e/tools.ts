import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLS = fileURLToPath(new URL('../../../../packages/core/tools', import.meta.url));

/** Ids de las herramientas con UI (packages/core/tools/<id>/Tool.tsx), en orden alfabético. */
export const TOOL_IDS = readdirSync(TOOLS).filter((id) => existsSync(join(TOOLS, id, 'Tool.tsx')));
