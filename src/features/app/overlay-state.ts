import type { Dispatch, SetStateAction } from 'preact/compat';

import type { AppData, OverlayState } from '../../lib/app-data';
import {
  createLocationDraft,
  createStationSettingsDraft,
  type LocationDraft,
  type StationSettingsDraft,
} from '../../lib/drafts';

export type OverlaySessionState = {
  overlay: OverlayState;
  locationDraft: LocationDraft | null;
  stationDraft: StationSettingsDraft | null;
  showEditorDetails: boolean;
};

export function createClosedOverlayState(): OverlaySessionState {
  return {
    overlay: { kind: 'closed' },
    locationDraft: null,
    stationDraft: null,
    showEditorDetails: false,
  };
}

export function openOverlayState(data: AppData, overlay: OverlayState): OverlaySessionState {
  if (overlay.kind === 'edit-location') {
    return {
      overlay,
      locationDraft: createLocationDraft(data.current, data.station),
      stationDraft: null,
      showEditorDetails: false,
    };
  }

  if (overlay.kind === 'station-settings') {
    return {
      overlay,
      locationDraft: null,
      stationDraft: createStationSettingsDraft(data.station),
      showEditorDetails: false,
    };
  }

  return {
    overlay,
    locationDraft: null,
    stationDraft: null,
    showEditorDetails: false,
  };
}

export function getSelectedRecent(
  overlay: OverlayState,
  recent: AppData['recent'],
): AppData['recent'][number] | null {
  if (overlay.kind !== 'recent-preview') {
    return null;
  }

  return recent.find((entry) => entry.id === overlay.id) ?? null;
}

export function createDraftStateSetter<T>(
  setState: Dispatch<SetStateAction<T | null>>,
): Dispatch<SetStateAction<T>> {
  return (updater) => {
    setState((previous) => {
      if (previous === null) {
        return previous;
      }

      if (typeof updater === 'function') {
        return (updater as (previous: T) => T)(previous);
      }

      return updater;
    });
  };
}
