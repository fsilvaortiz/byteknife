// La app es una sola página: un link que no sea una ruta interna (#/…) sacaría a la
// ventana de la app hacia otro sitio, sin forma de volver. Pasa con los links que el
// usuario escribe en la vista previa de Markdown, por ejemplo.
export function isInternal(href: string | null): boolean {
  return href === null || href.startsWith('#');
}

export function keepNavigationInside(root: Document): void {
  root.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a');
    if (link && !isInternal(link.getAttribute('href'))) event.preventDefault();
  });
}
