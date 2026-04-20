export type Side = 'left' | 'right';
export type RackLevel = 'top' | 'bottom';
export type Distance = 'close' | 'medium' | 'far';
export type LaneInputMode = 'quick' | 'number';

export type EnabledFields = {
  lane: boolean;
  side: boolean;
  rackLevel: boolean;
  distance: boolean;
  floor: boolean;
  rackNumber: boolean;
};

export type StationConfig = {
  name: string;
  laneInputMode: LaneInputMode;
  laneLabels: string[];
  enabledFields: EnabledFields;
  defaultFloor: string;
};

export type VisibleFields = Partial<Record<keyof Omit<EnabledFields, 'lane'>, true>>;

type RecordBase = {
  id: string;
  updatedAt: string;
  stationName: string;
  notes?: string;
  photoDataUrl?: string;
};

export type StationLocationRecord = RecordBase & {
  mode: 'station';
  lane: string;
  visibleFields: VisibleFields;
  side?: Side;
  rackLevel?: RackLevel;
  distance?: Distance;
  floor?: string;
  rackNumber?: string;
};

export type OutsideLocationRecord = RecordBase & {
  mode: 'outside';
  outsideDescription: string;
};

export type LocationRecord = StationLocationRecord | OutsideLocationRecord;

type StationLocationRecordSeed = Omit<StationLocationRecord, 'id' | 'updatedAt'>;
type OutsideLocationRecordSeed = Omit<OutsideLocationRecord, 'id' | 'updatedAt'>;
type LocationRecordSeed = StationLocationRecordSeed | OutsideLocationRecordSeed;

export type StationLocationRecordInput = {
  mode: 'station';
  lane: string;
  side?: Side;
  rackLevel?: RackLevel;
  distance?: Distance;
  floor?: string;
  rackNumber?: string;
  notes?: string;
  photoDataUrl?: string;
};

export type OutsideLocationRecordInput = {
  mode: 'outside';
  outsideDescription: string;
  photoDataUrl?: string;
};

export type LocationRecordInput = StationLocationRecordInput | OutsideLocationRecordInput;

export type AppState = {
  station: StationConfig;
  current: LocationRecord | null;
  recent: LocationRecord[];
};

type PersistedState = {
  version: 2;
  state: AppState;
};

export const RECENT_LIMIT = 5;
const STORAGE_KEY = 'bike-storage-tracker-state-v2';

export const defaultStationConfig: StationConfig = {
  name: 'My station',
  laneInputMode: 'quick',
  laneLabels: ['4', '5', '6'],
  enabledFields: {
    lane: true,
    side: false,
    rackLevel: false,
    distance: false,
    floor: false,
    rackNumber: false,
  },
  defaultFloor: 'Main station level',
};

const starterCurrent = createLocationRecord(
  {
    mode: 'station',
    stationName: defaultStationConfig.name,
    lane: '4',
    side: 'right',
    rackLevel: 'bottom',
    distance: 'medium',
    floor: 'Main station level',
    notes: 'Starter spot - update this to your real location.',
    visibleFields: {
      side: true,
      rackLevel: true,
      distance: true,
    },
  },
  '2026-04-19T08:00:00.000Z',
);

export const defaultState: AppState = {
  station: defaultStationConfig,
  current: starterCurrent,
  recent: [
    createLocationRecord(
      {
        mode: 'station',
        stationName: defaultStationConfig.name,
        lane: '5',
        side: 'left',
        rackLevel: 'top',
        distance: 'close',
        floor: 'Main station level',
        visibleFields: {
          side: true,
          rackLevel: true,
          distance: true,
        },
      },
      '2026-04-18T18:20:00.000Z',
    ),
  ],
};

export function createLocationRecord(
  record: LocationRecordSeed,
  updatedAt: string = new Date().toISOString(),
): LocationRecord {
  return record.mode === 'outside'
    ? {
        id: createId(),
        updatedAt,
        ...record,
      }
    : {
        id: createId(),
        updatedAt,
        ...record,
      };
}

export function saveLocation(
  state: AppState,
  input: LocationRecordInput,
  timestamp: string = new Date().toISOString(),
): AppState {
  const nextCurrent = buildRecord(state.station, input, timestamp);

  if (!state.current) {
    return {
      ...state,
      current: nextCurrent,
      recent: state.recent.slice(0, RECENT_LIMIT),
    };
  }

  return {
    ...state,
    current: nextCurrent,
    recent: capRecent([state.current, ...state.recent]),
  };
}

export function promoteRecentLocation(
  state: AppState,
  locationId: string,
  timestamp: string = new Date().toISOString(),
): AppState {
  const selected = state.recent.find((entry) => entry.id === locationId);

  if (!selected) {
    return state;
  }

  const remaining = state.recent.filter((entry) => entry.id !== locationId);
  const nextCurrent: LocationRecord = {
    ...selected,
    updatedAt: timestamp,
  };

  return {
    ...state,
    current: nextCurrent,
    recent: capRecent(state.current ? [state.current, ...remaining] : remaining),
  };
}

export function updateStationConfig(state: AppState, station: StationConfig): AppState {
  return {
    ...state,
    station: normalizeStationConfig(station),
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedState;

    if (parsed.version !== 2 || !parsed.state) {
      return defaultState;
    }

    const station = normalizeStationConfig(parsed.state.station);
    const current = parsed.state.current ? normalizeLocationRecord(parsed.state.current) : null;
    const recent = Array.isArray(parsed.state.recent)
      ? parsed.state.recent
          .map((entry) => normalizeLocationRecord(entry))
          .filter((entry): entry is LocationRecord => entry !== null)
          .slice(0, RECENT_LIMIT)
      : null;

    if (!recent) {
      return defaultState;
    }

    return {
      station,
      current,
      recent,
    };
  } catch {
    return defaultState;
  }
}

export function persistState(state: AppState): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: PersistedState = {
    version: 2,
    state,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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
        photoDataUrl: input.photoDataUrl,
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
      photoDataUrl: input.photoDataUrl,
      visibleFields: buildVisibleFields(station.enabledFields),
    },
    timestamp,
  );
}

function buildVisibleFields(enabledFields: EnabledFields): VisibleFields {
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

function normalizeStationConfig(value?: Partial<StationConfig>): StationConfig {
  const labels = Array.isArray(value?.laneLabels)
    ? value.laneLabels
        .map((label) => String(label).trim())
        .filter(Boolean)
        .slice(0, 5)
    : defaultStationConfig.laneLabels;

  return {
    name: value?.name?.trim() || defaultStationConfig.name,
    laneInputMode: value?.laneInputMode === 'number' ? 'number' : 'quick',
    laneLabels: labels.length > 0 ? labels : defaultStationConfig.laneLabels,
    enabledFields: {
      lane: value?.enabledFields?.lane ?? defaultStationConfig.enabledFields.lane,
      side: value?.enabledFields?.side ?? defaultStationConfig.enabledFields.side,
      rackLevel: value?.enabledFields?.rackLevel ?? defaultStationConfig.enabledFields.rackLevel,
      distance: value?.enabledFields?.distance ?? defaultStationConfig.enabledFields.distance,
      floor: value?.enabledFields?.floor ?? defaultStationConfig.enabledFields.floor,
      rackNumber: value?.enabledFields?.rackNumber ?? defaultStationConfig.enabledFields.rackNumber,
    },
    defaultFloor: value?.defaultFloor?.trim() || defaultStationConfig.defaultFloor,
  };
}

function normalizeLocationRecord(value: unknown): LocationRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const entry = value as Partial<LocationRecord>;
  const id = typeof entry.id === 'string' ? entry.id : null;
  const updatedAt = typeof entry.updatedAt === 'string' ? entry.updatedAt : null;
  const stationName = typeof entry.stationName === 'string' ? entry.stationName.trim() : '';

  if (!id || !updatedAt || !stationName) {
    return null;
  }

  if (entry.mode === 'outside') {
    const outsideDescription =
      typeof entry.outsideDescription === 'string' ? entry.outsideDescription.trim() : '';

    if (!outsideDescription) {
      return null;
    }

    return {
      id,
      updatedAt,
      mode: 'outside',
      stationName,
      outsideDescription,
      photoDataUrl: normalizeOptionalString(entry.photoDataUrl),
    };
  }

  if (entry.mode !== 'station') {
    return null;
  }

  const lane = typeof entry.lane === 'string' ? entry.lane.trim() : '';

  if (!lane) {
    return null;
  }

  return {
    id,
    updatedAt,
    mode: 'station',
    stationName,
    lane,
    side: normalizeEnum(entry.side, ['left', 'right']),
    rackLevel: normalizeEnum(entry.rackLevel, ['top', 'bottom']),
    distance: normalizeEnum(entry.distance, ['close', 'medium', 'far']),
    floor: normalizeOptionalString(entry.floor),
    rackNumber: normalizeOptionalString(entry.rackNumber),
    notes: normalizeOptionalString(entry.notes),
    photoDataUrl: normalizeOptionalString(entry.photoDataUrl),
    visibleFields: normalizeVisibleFields(entry.visibleFields),
  };
}

function normalizeVisibleFields(value: unknown): VisibleFields {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const candidate = value as Partial<Record<keyof VisibleFields, unknown>>;
  const visibleFields: VisibleFields = {};

  if (candidate.side === true) {
    visibleFields.side = true;
  }

  if (candidate.rackLevel === true) {
    visibleFields.rackLevel = true;
  }

  if (candidate.distance === true) {
    visibleFields.distance = true;
  }

  if (candidate.floor === true) {
    visibleFields.floor = true;
  }

  if (candidate.rackNumber === true) {
    visibleFields.rackNumber = true;
  }

  return visibleFields;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeEnum<T extends string>(value: unknown, options: readonly T[]): T | undefined {
  return typeof value === 'string' && options.includes(value as T) ? (value as T) : undefined;
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
