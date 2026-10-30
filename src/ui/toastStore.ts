import { signal } from '@preact/signals';

export const toastMessage = signal('');
let timer: ReturnType<typeof setTimeout> | undefined;

export function showToast(message: string): void {
  toastMessage.value = message;
  clearTimeout(timer);
  timer = setTimeout(() => (toastMessage.value = ''), 1400);
}
