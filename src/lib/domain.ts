import type {
  AppData,
  EnabledFields,
  LocationRecord,
  LocationRecordInput,
  StationConfig,
  VisibleFields,
} from './app-data';
import { RECENT_LIMIT } from './app-data';
import { defaultStationConfig } from './defaults';

type StationLocationRecordSeed = Omit<
  Extract<LocationRecord, { mode: 'station' }>,
  'id' | 'updatedAt'
>;
type OutsideLocationRecordSeed = Omit<
  Extract<LocationRecord, { mode: 'outside' }>,
  'id' | 'updatedAt'
>;
type LocationRecordSeed = StationLocationRecordSeed | OutsideLocationRecordSeed;

export function createLocationRecord(
  record: LocationRecordSeed,
  updatedAt: string = new Date().toISOString(),
): LocationRecord {
  return {
    id: createId(),
    updatedAt,
    ...record,
  };
}

export function saveLocation(
  data: AppData,
  input: LocationRecordInput,
  timestamp: string = new Date().toISOString(),
): AppData {
  const nextCurrent = buildRecord(data.station, input, timestamp);

  if (!data.current) {
    return {
      ...data,
      current: nextCurrent,
      recent: data.recent.slice(0, RECENT_LIMIT),
    };
  }

  return {
    ...data,
    current: nextCurrent,
    recent: capRecent([data.current, ...data.recent]),
  };
}

export function promoteRecentLocation(
  data: AppData,
  locationId: string,
  timestamp: string = new Date().toISOString(),
): AppData {
  const selected = data.recent.find((entry) => entry.id === locationId);

  if (!selected) {
    return data;
  }

  const remaining = data.recent.filter((entry) => entry.id !== locationId);

  return {
    ...data,
    current: {
      ...selected,
      updatedAt: timestamp,
    },
    recent: capRecent(data.current ? [data.current, ...remaining] : remaining),
  };
}

export function updateStationConfig(data: AppData, station: StationConfig): AppData {
  return {
    ...data,
    station: normalizeStationConfig(station, defaultStationConfig),
  };
}

export function buildVisibleFields(enabledFields: EnabledFields): VisibleFields {
  const visibleFields: VisibleFields = {};

  if (enabledFields.side) {
    visibleFields.side = true;
  }

  if (enabledFields.rackLevel) {
    visibleFields.rackLevel = true;
  }

  if (enabledFields.distance) {
    visibleFields.distance = true;
  }

  if (enabledFields.floor) {
    visibleFields.floor = true;
  }

  if (enabledFields.rackNumber) {
    visibleFields.rackNumber = true;
  }

  return visibleFields;
}

export function normalizeStationConfig(
  value: Partial<StationConfig> | undefined,
  fallback: StationConfig,
): StationConfig {
  const labels = Array.isArray(value?.laneLabels)
    ? value.laneLabels
        .map((label) => String(label).trim())
        .filter(Boolean)
        .slice(0, 5)
    : fallback.laneLabels;

  return {
    name: value?.name?.trim() || fallback.name,
    laneInputMode: value?.laneInputMode === 'number' ? 'number' : 'quick',
    laneLabels: labels.length > 0 ? labels : fallback.laneLabels,
    enabledFields: {
      lane: value?.enabledFields?.lane ?? fallback.enabledFields.lane,
      side: value?.enabledFields?.side ?? fallback.enabledFields.side,
      rackLevel: value?.enabledFields?.rackLevel ?? fallback.enabledFields.rackLevel,
      distance: value?.enabledFields?.distance ?? fallback.enabledFields.distance,
      floor: value?.enabledFields?.floor ?? fallback.enabledFields.floor,
      rackNumber: value?.enabledFields?.rackNumber ?? fallback.enabledFields.rackNumber,
    },
    defaultFloor: value?.defaultFloor?.trim() || fallback.defaultFloor,
  };
}

function buildRecord(
  station: StationConfig,
  input: LocationRecordInput,
  timestamp: string,
): LocationRecord {
  if (input.mode === 'outside') {
    return createLocationRecord(
      {
        mode: 'outside',
        stationName: station.name,
        outsideDescription: input.outsideDescription.trim(),
        photoId: input.photoId,
      },
      timestamp,
    );
  }

  return createLocationRecord(
    {
      mode: 'station',
      stationName: station.name,
      lane: input.lane.trim(),
      side: input.side,
      rackLevel: input.rackLevel,
      distance: input.distance,
      floor: input.floor,
      rackNumber: input.rackNumber,
      notes: input.notes,
      photoId: input.photoId,
      visibleFields: buildVisibleFields(station.enabledFields),
    },
    timestamp,
  );
}

function capRecent(entries: LocationRecord[]): LocationRecord[] {
  return entries.slice(0, RECENT_LIMIT);
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `location-${Math.random().toString(36).slice(2, 10)}`;
}
