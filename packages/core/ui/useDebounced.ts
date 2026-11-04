import { useEffect, useState } from 'preact/hooks';

/** Devuelve el valor tras `ms` sin cambios: procesa en vivo sin recalcular en cada tecla. */
export function useDebounced<T>(value: T, ms = 120): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
