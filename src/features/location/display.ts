import type { EnabledFields, LocationRecord } from '../../lib/storage';

export function titleCase(value?: string) {
  if (!value) {
    return '-';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function shouldShowEntryField(entry: LocationRecord, field: keyof EnabledFields) {
  if (entry.mode !== 'station') {
    return false;
  }

  switch (field) {
    case 'lane':
      return Boolean(entry.lane?.trim());
    case 'side':
      return entry.visibleFields.side === true && Boolean(entry.side);
    case 'rackLevel':
      return entry.visibleFields.rackLevel === true && Boolean(entry.rackLevel);
    case 'distance':
      return entry.visibleFields.distance === true && Boolean(entry.distance);
    case 'floor':
      return entry.visibleFields.floor === true && Boolean(entry.floor?.trim());
    case 'rackNumber':
      return entry.visibleFields.rackNumber === true && Boolean(entry.rackNumber?.trim());
  }
}

export function showFloor(entry: LocationRecord) {
  if (entry.mode !== 'station' || !entry.floor?.trim()) {
    return false;
  }

  return shouldShowEntryField(entry, 'floor');
}

export function formatTimestamp(value?: string) {
  if (!value) {
    return 'not saved yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getSummary(entry: LocationRecord | null): string {
  if (!entry) {
    return '';
  }

  if (entry.mode === 'outside') {
    return entry.outsideDescription;
  }

  const parts = [
    shouldShowEntryField(entry, 'side') && entry.side ? titleCase(entry.side) : '',
    shouldShowEntryField(entry, 'rackLevel') && entry.rackLevel ? titleCase(entry.rackLevel) : '',
    shouldShowEntryField(entry, 'distance') && entry.distance ? titleCase(entry.distance) : '',
  ].filter(Boolean);

  return parts.join(' · ');
}

export function getSupportingSummary(entry: LocationRecord | null, summary: string): string {
  if (!entry) {
    return '';
  }

  if (entry.mode === 'outside') {
    return entry.outsideDescription;
  }

  const parts = [entry.stationName, summary, showFloor(entry) ? `Floor ${entry.floor}` : ''].filter(
    Boolean,
  );
  return parts.join(' · ');
}
