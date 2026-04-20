import type {
  Distance,
  EnabledFields,
  LaneInputMode,
  LocationRecord,
  LocationRecordInput,
  RackLevel,
  Side,
  StationConfig,
} from '../../lib/storage';
import { defaultStationConfig } from '../../lib/storage';

export type LocationFormState = {
  mode: 'station' | 'outside';
  lane: string;
  side: Side;
  rackLevel: RackLevel;
  distance: Distance;
  floor: string;
  rackNumber: string;
  notes: string;
  photoDataUrl: string;
};

export type StationFormState = {
  name: string;
  laneInputMode: LaneInputMode;
  laneLabels: string[];
  enabledFields: EnabledFields;
  defaultFloor: string;
};

export function initialStationForm(station: StationConfig): StationFormState {
  return {
    name: station.name,
    laneInputMode: station.laneInputMode,
    laneLabels: [...station.laneLabels],
    enabledFields: { ...station.enabledFields },
    defaultFloor: station.defaultFloor,
  };
}

export function initialLocationForm(
  current: LocationRecord | null,
  station: StationConfig,
): LocationFormState {
  if (!current) {
    return {
      mode: 'station',
      lane: station.laneLabels[0] ?? '',
      side: 'right',
      rackLevel: 'bottom',
      distance: 'medium',
      floor: station.defaultFloor,
      rackNumber: '',
      notes: '',
      photoDataUrl: '',
    };
  }

  return {
    mode: 'station',
    lane:
      current.mode === 'station'
        ? (current.lane ?? station.laneLabels[0] ?? '')
        : (station.laneLabels[0] ?? ''),
    side: current.mode === 'station' ? (current.side ?? 'right') : 'right',
    rackLevel: current.mode === 'station' ? (current.rackLevel ?? 'bottom') : 'bottom',
    distance: current.mode === 'station' ? (current.distance ?? 'medium') : 'medium',
    floor:
      current.mode === 'station' ? (current.floor ?? station.defaultFloor) : station.defaultFloor,
    rackNumber: current.mode === 'station' ? (current.rackNumber ?? '') : '',
    notes: '',
    photoDataUrl: '',
  };
}

export function buildLocationRecordInput(
  formState: LocationFormState,
  station: StationConfig,
): LocationRecordInput | null {
  if (formState.mode === 'outside') {
    const outsideDescription = formState.notes.trim();

    if (!outsideDescription) {
      return null;
    }

    return {
      mode: 'outside',
      outsideDescription,
      photoDataUrl: emptyToUndefined(formState.photoDataUrl),
    };
  }

  const lane = station.enabledFields.lane ? formState.lane.trim() : undefined;
  if (station.enabledFields.lane && !lane) {
    return null;
  }

  if (!lane) {
    return null;
  }

  return {
    mode: 'station',
    lane,
    side: station.enabledFields.side ? formState.side : undefined,
    rackLevel: station.enabledFields.rackLevel ? formState.rackLevel : undefined,
    distance: station.enabledFields.distance ? formState.distance : undefined,
    floor: station.enabledFields.floor ? formState.floor.trim() || station.defaultFloor : undefined,
    rackNumber: station.enabledFields.rackNumber
      ? emptyToUndefined(formState.rackNumber)
      : undefined,
    notes: emptyToUndefined(formState.notes),
    photoDataUrl: emptyToUndefined(formState.photoDataUrl),
  };
}

export function buildStationConfig(formState: StationFormState): StationConfig {
  const laneLabels = formState.laneLabels
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 5);

  return {
    name: formState.name.trim() || defaultStationConfig.name,
    laneInputMode: formState.laneInputMode,
    laneLabels: laneLabels.length > 0 ? laneLabels : defaultStationConfig.laneLabels,
    enabledFields: {
      lane: true,
      side: formState.enabledFields.side,
      rackLevel: formState.enabledFields.rackLevel,
      distance: formState.enabledFields.distance,
      floor: formState.enabledFields.floor,
      rackNumber: formState.enabledFields.rackNumber,
    },
    defaultFloor: formState.defaultFloor.trim() || defaultStationConfig.defaultFloor,
  };
}

export function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
