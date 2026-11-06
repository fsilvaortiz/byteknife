import { defineConfig, devices } from '@playwright/test';

const PORT = 1421;

// La app de escritorio corre en WebKit (el motor de Safari que usa Tauri en macOS). Aquí se
// prueba el SPA servido por vite preview en el WebKit de Playwright; fuera de Tauri, la
// plataforma es la web y el updater no se activa.
export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: 'webkit', use: { ...devices['Desktop Safari'], locale: 'es-CL' } }],
  webServer: {
    command: 'pnpm build && pnpm preview',
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
