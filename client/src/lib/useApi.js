import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs `fetcher(key)` whenever `key` changes. Results are cached per key so
 * switching back (e.g. language or dashboard tab) is instant, and previous
 * data stays on screen while the next key loads.
 */
export function useApi(fetcher, key) {
  const cache = useRef(new Map());
  const [state, setState] = useState(() => ({ data: null, error: null, loading: key != null }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (key == null) return;
    if (cache.current.has(key)) {
      setState({ data: cache.current.get(key), error: null, loading: false });
      return;
    }
    let alive = true;
    setState((s) => ({ ...s, error: null, loading: true }));
    fetcher(key)
      .then((data) => {
        cache.current.set(key, data);
        if (alive) setState({ data, error: null, loading: false });
      })
      .catch((error) => alive && setState((s) => ({ ...s, error, loading: false })));
    return () => {
      alive = false;
    };
    // fetcher is a stable module-level function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
