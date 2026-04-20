import { RotateCcw, X } from 'lucide-react';

import { ModalBackdrop } from '../../components/ModalBackdrop';
import type { LocationRecord } from '../../lib/storage';
import { formatTimestamp } from '../location/display';
import { LocationDetailContent } from '../location/LocationDetailContent';

export function RecentLocationPreviewSheet({
  selectedRecent,
  onClose,
  onUse,
}: {
  selectedRecent: LocationRecord;
  onClose: () => void;
  onUse: (id: string) => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <section className="editor-sheet" aria-label="Recent location preview">
        <div className="sheet-header">
          <h2>
            {selectedRecent.mode === 'outside'
              ? 'Outside the station'
              : `Lane ${selectedRecent.lane}`}
          </h2>
          <button
            aria-label="Close"
            className="ghost-button ghost-button--icon sheet-close sheet-close--compact"
            type="button"
            onClick={onClose}
          >
            <X aria-hidden="true" className="button-icon" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="preview-stack">
          <LocationDetailContent entry={selectedRecent} photoAlt="Recent bike reference" />
          <p className="timestamp">Saved {formatTimestamp(selectedRecent.updatedAt)}</p>
          <button
            className="primary-button primary-button--wide"
            type="button"
            onClick={() => onUse(selectedRecent.id)}
          >
            <RotateCcw aria-hidden="true" className="button-icon" />
            Use this location
          </button>
        </div>
      </section>
    </ModalBackdrop>
  );
}
