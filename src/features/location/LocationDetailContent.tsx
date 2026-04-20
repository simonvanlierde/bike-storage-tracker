import { DetailRow } from '../../components/DetailRow';
import type { LocationRecord } from '../../lib/storage';
import { getSummary, shouldShowEntryField, showFloor, titleCase } from './display';

export function LocationDetailContent({
  entry,
  photoAlt,
}: {
  entry: LocationRecord;
  photoAlt: string;
}) {
  return (
    <div className="preview-stack">
      {entry.mode === 'outside' ? (
        <p className="spot-summary">{entry.outsideDescription}</p>
      ) : (
        <>
          <p className="spot-summary">{getSummary(entry)}</p>
          {showFloor(entry) ? <p className="spot-floor">Station floor {entry.floor}</p> : null}
        </>
      )}

      <DetailRow label="Station" value={entry.stationName} />
      {entry.mode === 'station' ? (
        <>
          <DetailRow label="Lane" value={entry.lane} />
          <DetailRow
            label="Side"
            value={
              shouldShowEntryField(entry, 'side') && entry.side ? titleCase(entry.side) : undefined
            }
          />
          <DetailRow
            label="Rack level"
            value={
              shouldShowEntryField(entry, 'rackLevel') && entry.rackLevel
                ? titleCase(entry.rackLevel)
                : undefined
            }
          />
          <DetailRow
            label="Distance"
            value={
              shouldShowEntryField(entry, 'distance') && entry.distance
                ? titleCase(entry.distance)
                : undefined
            }
          />
          <DetailRow label="Station floor" value={showFloor(entry) ? entry.floor : undefined} />
          <DetailRow
            label="Rack number"
            value={shouldShowEntryField(entry, 'rackNumber') ? entry.rackNumber : undefined}
          />
        </>
      ) : null}

      {entry.mode === 'station' && entry.notes ? (
        <p className="detail-note">{entry.notes}</p>
      ) : null}

      {entry.photoDataUrl ? (
        <figure className="photo-preview">
          <img src={entry.photoDataUrl} alt={photoAlt} />
        </figure>
      ) : null}
    </div>
  );
}
