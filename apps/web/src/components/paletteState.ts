import { signal } from '@preact/signals';

// El botón vive en el header y el diálogo en <body>: el backdrop-filter del header
// convierte su caja en el contenedor de position: fixed y recortaría el fondo del diálogo.
export const paletteOpen = signal(false);
let returnFocus: HTMLElement | null = null;

export function openPalette(): void {
  returnFocus = document.activeElement as HTMLElement | null;
  paletteOpen.value = true;
}

export function closePalette(): void {
  paletteOpen.value = false;
  returnFocus?.focus();
}
