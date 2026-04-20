import { describe, expect, it } from 'vitest';

import { openOverlayState } from '../src/features/app/overlay-state';
import { defaultAppData } from '../src/lib/defaults';
import { createLocationDraft, createStationSettingsDraft } from '../src/lib/drafts';

describe('overlay state', () => {
  it('creates the right draft state for each overlay and clears unrelated drafts', () => {
    const editLocation = openOverlayState(defaultAppData, { kind: 'edit-location' });

    expect(editLocation.overlay).toEqual({ kind: 'edit-location' });
    expect(editLocation.locationDraft).toEqual(
      createLocationDraft(defaultAppData.current, defaultAppData.station),
    );
    expect(editLocation.stationDraft).toBeNull();
    expect(editLocation.showEditorDetails).toBe(false);

    const stationSettings = openOverlayState(defaultAppData, { kind: 'station-settings' });

    expect(stationSettings.overlay).toEqual({ kind: 'station-settings' });
    expect(stationSettings.stationDraft).toEqual(
      createStationSettingsDraft(defaultAppData.station),
    );
    expect(stationSettings.locationDraft).toBeNull();
    expect(stationSettings.showEditorDetails).toBe(false);

    const recentList = openOverlayState(defaultAppData, { kind: 'recent-list' });

    expect(recentList.overlay).toEqual({ kind: 'recent-list' });
    expect(recentList.locationDraft).toBeNull();
    expect(recentList.stationDraft).toBeNull();
    expect(recentList.showEditorDetails).toBe(false);
  });
});
