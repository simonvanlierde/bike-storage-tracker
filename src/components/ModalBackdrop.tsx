import type { ReactNode } from 'react';

export function ModalBackdrop({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: this backdrop wraps modal content and cannot be replaced with a button element.
    <div
      className="sheet-backdrop"
      data-testid="modal-backdrop"
      role="button"
      tabIndex={0}
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
      {children}
    </div>
  );
}
