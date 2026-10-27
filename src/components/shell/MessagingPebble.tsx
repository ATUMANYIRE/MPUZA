import { MessageCircle, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { PebbleButton } from '../ui/PebbleButton';
import { useOverlayOpen } from '../../lib/overlay';
import { cx } from '../../lib/cx';

/**
 * The floating Messaging toggle from the real page, as a pebble.
 *
 * It sits above the Island, and like the Island it steps aside while a sheet
 * is open rather than stacking on top of one.
 */
export const MessagingPebble = () => {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const hidden = useOverlayOpen();

  return (
    <motion.div
      aria-hidden={hidden || undefined}
      initial={false}
      animate={hidden ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
      className={cx(
        'fixed bottom-28 right-gutter z-sticky flex flex-col items-end gap-2',
        hidden && 'pointer-events-none',
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="w-64 rounded-md border border-rule bg-surface p-3 shadow-card"
          >
            <p className="text-bar-title font-bold text-text">Messaging</p>
            <p className="mt-1 text-bar-sub text-text-muted">
              No shortlist chats yet. You will see conversations here after you are shortlisted.
            </p>
            <p className="mt-2 text-bar-sub text-text-placeholder">Demo data.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <PebbleButton
        label={open ? 'Close messaging' : 'Open messaging'}
        size="lg"
        tone="surface"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X size={20} aria-hidden="true" />
        ) : (
          <MessageCircle size={20} aria-hidden="true" />
        )}
      </PebbleButton>
    </motion.div>
  );
};
