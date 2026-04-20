import { CircleEllipsis, X } from 'lucide-react';

import { ModalBackdrop } from '../../components/ModalBackdrop';
import type { LocationRecord } from '../../lib/storage';
import { LocationDetailContent } from './LocationDetailContent';

export function LocationDetailsSheet({
  current,
  onClose,
}: {
  current: LocationRecord | null;
  onClose: () => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <section className="editor-sheet" aria-label="Location details">
        <div className="sheet-header">
          <h2 className="sheet-title">
            <CircleEllipsis aria-hidden="true" className="button-icon" />
            <span>Location details</span>
          </h2>
          <button
            aria-label="Close details"
            className="ghost-button ghost-button--icon sheet-close sheet-close--compact"
            type="button"
            onClick={onClose}
          >
            <X aria-hidden="true" className="button-icon" />
            <span className="sr-only">Close details</span>
          </button>
        </div>
        {current ? <LocationDetailContent entry={current} photoAlt="Saved bike reference" /> : null}
      </section>
    </ModalBackdrop>
  );
}
