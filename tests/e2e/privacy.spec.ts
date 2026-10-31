import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TOOL_IDS } from './tools';

// Promesa del sitio: ningún dato del usuario sale del navegador. Se escribe un centinela en
// cada campo de cada herramienta y se revisa toda la red del contexto, incluida la del
// service worker. Además, ninguna página puede violar la CSP.

const CANARY = 'bkcanary7f3a';

function watchNetwork(context: BrowserContext, origin: string) {
  const leaks: string[] = [];
  context.on('request', (req) => {
    const body = req.postData() ?? '';
    if (!req.url().startsWith(origin)) leaks.push(`otro origen: ${req.url()}`);
    if (req.url().includes(CANARY) || body.includes(CANARY)) leaks.push(`centinela: ${req.url()}`);
  });
  return leaks;
}

async function watchCsp(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { cspViolations: string[] };
    w.cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      w.cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`),
    );
  });
  return () =>
    page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations);
}

/** Escribe el centinela en todos los campos de texto editables visibles. */
async function fillEverything(page: Page) {
  const fields = page.locator(
    'textarea:visible:not([readonly]):not([disabled]), input:visible:not([readonly]):not([disabled]):is([type="text"], [type="search"], [type="url"], :not([type]))',
  );
  for (let i = 0, n = await fields.count(); i < n; i++) {
    await fields.nth(i).fill(`${CANARY} {"k":"${CANARY}"} 0x${CANARY.length}`);
  }
}

test('ningún dato pegado sale del navegador ni la CSP bloquea nada', async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(120_000);
  const leaks = watchNetwork(context, new URL(baseURL!).origin);
  const violations = await watchCsp(page);

  await page.goto('/es/');
  await page.getByLabel('Pega cualquier cosa').fill(`{"secreto": "${CANARY}"}`);
  await page.waitForLoadState('networkidle');
  expect(await violations()).toEqual([]);

  for (const id of TOOL_IDS) {
    await page.goto(`/es/${id}/`);
    await page.waitForLoadState('networkidle');
    await fillEverything(page);
    await page.waitForLoadState('networkidle');
    expect(await violations(), `CSP en /es/${id}/`).toEqual([]);
  }

  expect(leaks).toEqual([]);
});

test('cada página declara la CSP', async ({ page }) => {
  for (const path of ['/', '/es/', '/en/json/', '/pt/regex/']) {
    const res = await page.request.get(path);
    const csp = (await res.text()).match(/http-equiv="content-security-policy" content="([^"]+)"/);
    expect(csp?.[1], path).toContain("connect-src 'self'");
    expect(csp?.[1], path).toContain("default-src 'self'");
  }
});
