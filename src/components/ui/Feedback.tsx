import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cx } from '../../lib/cx';

/**
 * Measured from company-loading.png: the whole page drops to ~.4–.5 opacity
 * (antd's .ant-spin-blur { opacity:.5 }) and a white card with a blue antd
 * spinner and the word "Loading…" sits centred over it.
 */
export const LoadingOverlay = ({ open, label = 'Loading…' }: { open: boolean; label?: string }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-overlay flex items-center justify-center bg-veil"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        role="status"
        aria-live="polite"
      >
        <div className="flex min-w-32 flex-col items-center gap-3 rounded-xl bg-surface px-8 py-6 shadow-modal">
          <SpinnerDots />
          <span className="text-meta font-medium text-text-body">{label}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** antd's four-dot spinner, which is what the real Loading modal shows. */
const SpinnerDots = () => (
  <span aria-hidden="true" className="relative block h-8 w-8 motion-safe:animate-spin">
    {[
      'left-0 top-0',
      'right-0 top-0',
      'right-0 bottom-0',
      'left-0 bottom-0',
    ].map((pos, i) => (
      <span
        key={pos}
        className={cx('absolute h-3 w-3 rounded-full bg-primary', pos)}
        style={{ opacity: 1 - i * 0.22 }}
      />
    ))}
  </span>
);

export const Toast = ({ open, message }: { open: boolean; message: string }) => {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          className={cx(
            // Clears the 56px sticky header so it never covers the nav controls.
            'fixed inset-x-0 top-[4.25rem] z-toast mx-auto w-fit max-w-[92vw] rounded-full',
            'bg-text px-4 py-2.5 text-meta font-medium text-text-on-primary shadow-modal',
          )}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
          transition={reduce ? { duration: 0.1 } : { type: 'spring', stiffness: 420, damping: 32 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
