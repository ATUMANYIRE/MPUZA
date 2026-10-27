import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Tracks how many overlays (bottom sheets, activity sheet) are currently open.
 *
 * The Island is pinned to the bottom of the viewport, which is exactly where a
 * sheet comes up — so without this it sits on top of whatever the sheet is
 * showing. Rather than fight it with z-index, the Island simply steps aside
 * while anything is open.
 */
interface OverlayValue {
  count: number;
  push: () => void;
  pop: () => void;
}

const OverlayContext = createContext<OverlayValue | null>(null);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);
  const push = useCallback(() => setCount((n) => n + 1), []);
  const pop = useCallback(() => setCount((n) => Math.max(0, n - 1)), []);
  const value = useMemo(() => ({ count, push, pop }), [count, push, pop]);
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
};

/** True while any overlay is open. Safe outside a provider (returns false). */
export const useOverlayOpen = (): boolean => (useContext(OverlayContext)?.count ?? 0) > 0;

/** Registers this component as an open overlay for as long as `open` is true. */
export const useRegisterOverlay = (open: boolean): void => {
  const ctx = useContext(OverlayContext);
  useEffect(() => {
    if (!open || !ctx) return;
    ctx.push();
    return () => ctx.pop();
    // `push`/`pop` are stable; depending on ctx itself would re-fire on count change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
};
