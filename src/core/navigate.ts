import type { Locale } from '../i18n';
import { toolPath } from './paths';
import { setPendingInput } from './store';

export function openTool(locale: Locale, id: string, input?: string): void {
  if (input) setPendingInput(id, input);
  window.location.assign(toolPath(locale, id));
}
