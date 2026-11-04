import { defineProject } from 'vitest/config';
import ouiData from './vite/oui-data.mjs';

export default defineProject({
  plugins: [ouiData()],
  test: { name: 'core', include: ['**/*.test.ts'], exclude: ['node_modules/**'] },
});
