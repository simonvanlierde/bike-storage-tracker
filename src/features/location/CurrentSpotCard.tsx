import { CircleEllipsis, MapPinned } from 'lucide-react';

import type { LocationRecord } from '../../lib/storage';
import { formatTimestamp } from './display';

export function CurrentSpotCard({
  current,
  notice,
  supportingSummary,
  onEdit,
  onOpenDetails,
}: {
  current: LocationRecord | null;
  notice: string;
  supportingSummary: string;
  onEdit: () => void;
  onOpenDetails: () => void;
}) {
  return (
    <section className="current-card" aria-label="Current spot">
      <div className="current-card__topline">
        <p className="section-kicker">Current spot</p>
        <button
          aria-label="View details"
          className="ghost-button ghost-button--icon"
          type="button"
          onClick={onOpenDetails}
        >
          <CircleEllipsis aria-hidden="true" className="button-icon" />
          <span className="sr-only">View details</span>
        </button>
      </div>
      {notice ? <p className="notice">{notice}</p> : null}
      <div className="current-card__header">
        <div className="current-card__body">
          <h1 className="headline">
            {current?.mode === 'outside' ? 'Outside the station' : `Lane ${current?.lane ?? '-'}`}
          </h1>
          <p className="spot-summary">{supportingSummary}</p>
          <p className="timestamp">Updated {formatTimestamp(current?.updatedAt)}</p>
        </div>
        <div className="action-stack">
          <button className="primary-button primary-button--hero" type="button" onClick={onEdit}>
            <MapPinned aria-hidden="true" className="button-icon" />
            Change location
          </button>
        </div>
      </div>
    </section>
  );
}
