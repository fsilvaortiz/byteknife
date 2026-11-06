import { defineConfig } from 'vitest/config';

// Un proyecto por paquete del workspace. La cobertura (≥ 90 %) se mide sobre la lógica pura
// de las herramientas, como pide docs/tool-contract.md.
export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/web', 'apps/desktop'],
    coverage: {
      provider: 'v8',
      include: ['packages/core/tools/*/logic.ts', 'packages/core/tools/*/detect.ts'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
