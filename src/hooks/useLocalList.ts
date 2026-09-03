import { useCallback, useEffect, useState } from "react";

export function useLocalList(key: string, max = 24) {
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  const persist = useCallback(
    (next: string[]) => {
      setItems(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  const add = useCallback(
    (value: string) => {
      if (!value) return;
      persist([value, ...items.filter((i) => i !== value)].slice(0, max));
    },
    [items, max, persist],
  );

  const toggle = useCallback(
    (value: string) => {
      persist(
        items.includes(value)
          ? items.filter((i) => i !== value)
          : [value, ...items].slice(0, max),
      );
    },
    [items, max, persist],
  );

  const remove = useCallback(
    (value: string) => persist(items.filter((i) => i !== value)),
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, ready, add, toggle, remove, clear, has: (v: string) => items.includes(v) };
}
