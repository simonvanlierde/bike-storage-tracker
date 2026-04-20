import { History, X } from 'lucide-react';

import { ModalBackdrop } from '../../components/ModalBackdrop';
import type { LocationRecord } from '../../lib/storage';
import { formatTimestamp, getSummary, showFloor } from '../location/display';

export function RecentLocationsSheet({
  recent,
  onClose,
  onPreview,
}: {
  recent: LocationRecord[];
  onClose: () => void;
  onPreview: (id: string) => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <section className="editor-sheet" aria-label="Recent locations">
        <div className="sheet-header">
          <h2 className="sheet-title">
            <History aria-hidden="true" className="button-icon" />
            <span>Recent locations</span>
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

        <div className="recent-list recent-list--sheet">
          {recent.map((entry) => {
            const summary = getSummary(entry);

            return (
              <button
                aria-label={`Restore ${entry.mode === 'outside' ? 'outside location' : `lane ${entry.lane}`} from recent locations`}
                key={entry.id}
                className="recent-item"
                type="button"
                onClick={() => onPreview(entry.id)}
              >
                <div className="recent-item__body">
                  <p className="recent-title">
                    {entry.mode === 'outside'
                      ? 'Outside the station'
                      : `Lane ${entry.lane}${summary ? ` · ${summary}` : ''}`}
                  </p>
                  <p className="recent-meta">
                    {entry.mode === 'outside'
                      ? entry.outsideDescription
                      : [showFloor(entry) ? entry.floor : ''].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="recent-time">{formatTimestamp(entry.updatedAt)}</span>
              </button>
            );
          })}
        </div>
      </section>
    </ModalBackdrop>
  );
}
