import { X } from 'lucide-preact';
import type { ReactNode } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';

export function SheetDialog({
  children,
  label,
  title,
  titleIcon,
  onClose,
  closeLabel = 'Close',
}: {
  children: ReactNode;
  label: string;
  title: ReactNode;
  titleIcon?: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (typeof dialogRef.current?.showModal === 'function' && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }

    return () => {
      if (dialogRef.current?.open && typeof dialogRef.current.close === 'function') {
        dialogRef.current.close();
      }

      previousFocusRef.current?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className="sheet-dialog"
      open
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape')
        ) {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <section className="editor-sheet">
        <div className="sheet-header">
          <h2 className="sheet-title">
            {titleIcon}
            <span>{title}</span>
          </h2>
          <button
            aria-label={closeLabel}
            className="ghost-button ghost-button--icon sheet-close sheet-close--compact"
            type="button"
            onClick={onClose}
          >
            <X aria-hidden="true" className="button-icon" />
            <span className="sr-only">{closeLabel}</span>
          </button>
        </div>
        {children}
      </section>
    </dialog>
  );
}
