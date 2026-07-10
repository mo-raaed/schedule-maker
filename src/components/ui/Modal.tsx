import { type ReactNode, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Max width class, e.g. "max-w-md" */
  maxWidth?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Remember the focused element while we are closed. Capturing it once the
  // panel is open is too late: a child's autoFocus lands during commit, before
  // effects run, so activeElement is already inside the dialog by then.
  useEffect(() => {
    if (open) return;
    const track = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      // A child's autoFocus fires focusin synchronously during commit, before
      // this listener is torn down. Recording it would make us "restore" focus
      // to a node that is about to unmount, dropping focus to <body>.
      if (!target || target.closest('[role="dialog"]')) return;
      restoreRef.current = target;
    };
    document.addEventListener("focusin", track);
    return () => document.removeEventListener("focusin", track);
  }, [open]);

  // Close on Escape, and keep Tab inside the panel while it is open.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll, and hand focus back to the trigger on close.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      const target = restoreRef.current;
      // The trigger may have unmounted with its menu; skip a detached node.
      if (target?.isConnected) target.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop — owns the dismiss click, so it must sit behind the panel. */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-foreground/25 dark:bg-black/50 backdrop-blur-[2px] animate-fade-in"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative w-full ${maxWidth} bg-surface border border-border rounded-t-lg sm:rounded-lg shadow-card-lg
          overflow-hidden animate-slide-up sm:animate-scale-in`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-7 pt-6 pb-2">
            <h2 id={titleId} className="text-lg font-semibold font-display text-foreground">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 rounded-full hover:bg-surface-2 transition-all duration-200 text-muted-foreground cursor-pointer active:scale-[0.98]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-7 pb-7 pt-2 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
