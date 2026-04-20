import type { ChangeEvent, FormEvent } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

import type { AppData, OverlayState } from '../../lib/app-data';
import { defaultAppData } from '../../lib/defaults';
import { promoteRecentLocation, saveLocation, updateStationConfig } from '../../lib/domain';
import { buildLocationRecordInput, buildStationConfig } from '../../lib/drafts';
import { loadAppData, saveAppData, savePhoto } from '../../lib/repository';
import { getSupportingSummary } from '../location/display';
import { createClosedOverlayState, openOverlayState } from './overlay-state';

export function useAppController() {
  const [data, setData] = useState<AppData>(defaultAppData);
  const [hydrated, setHydrated] = useState(false);
  const [overlayState, setOverlayState] = useState(createClosedOverlayState);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isActive = true;

    async function hydrate() {
      const nextData = await loadAppData();

      if (!isActive) {
        return;
      }

      setData(nextData);
      setHydrated(true);
    }

    void hydrate();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void saveAppData(data);
  }, [data, hydrated]);

  function openOverlay(overlay: OverlayState) {
    setOverlayState(openOverlayState(data, overlay));
  }

  function closeOverlay() {
    setOverlayState(createClosedOverlayState());
  }

  async function handleLocationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const locationDraft = overlayState.locationDraft;

    if (!locationDraft) {
      return;
    }

    const photoId = locationDraft.photoFile ? await savePhoto(locationDraft.photoFile) : undefined;
    const nextLocation = buildLocationRecordInput(locationDraft, data.station, photoId);

    if (!nextLocation) {
      return;
    }

    setData((previous) => saveLocation(previous, nextLocation));
    setNotice('Location updated');
    closeOverlay();
  }

  function handleStationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const stationDraft = overlayState.stationDraft;

    if (!stationDraft) {
      return;
    }

    setData((previous) => updateStationConfig(previous, buildStationConfig(stationDraft)));
    setNotice('Station settings updated');
    closeOverlay();
  }

  function handleUseRecent(id: string) {
    setData((previous) => promoteRecentLocation(previous, id));
    setNotice('Location updated from recent');
    closeOverlay();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;

    setOverlayState((previous) => ({
      ...previous,
      locationDraft: previous.locationDraft ? { ...previous.locationDraft, photoFile: file } : null,
    }));
  }

  function toggleEditorDetails() {
    setOverlayState((previous) => ({
      ...previous,
      showEditorDetails: !previous.showEditorDetails,
    }));
  }

  return {
    current: data.current,
    data,
    notice,
    overlayState,
    recentCount: data.recent.length,
    supportingSummary: getSupportingSummary(data.current, ''),
    closeOverlay,
    handleLocationSubmit,
    handlePhotoChange,
    handleStationSubmit,
    handleUseRecent,
    openOverlay,
    setOverlayState,
    toggleEditorDetails,
  };
}
