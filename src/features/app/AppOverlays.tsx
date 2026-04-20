import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'preact/compat';
import type { AppData } from '../../lib/app-data';
import type { LocationDraft, StationSettingsDraft } from '../../lib/drafts';
import { RecentLocationPreviewSheet } from '../history/RecentLocationPreviewSheet';
import { RecentLocationsSheet } from '../history/RecentLocationsSheet';
import { LocationDetailsSheet } from '../location/LocationDetailsSheet';
import { LocationEditorSheet } from '../location/LocationEditorSheet';
import { StationSettingsSheet } from '../location/StationSettingsSheet';
import {
  createDraftStateSetter,
  getSelectedRecent,
  type OverlaySessionState,
} from './overlay-state';

export function AppOverlays({
  data,
  overlayState,
  setLocationDraft,
  setStationDraft,
  onClose,
  onLocationSubmit,
  onStationSubmit,
  onPreviewRecent,
  onUseRecent,
  onToggleEditorDetails,
  onPhotoChange,
}: {
  data: AppData;
  overlayState: OverlaySessionState;
  setLocationDraft: Dispatch<SetStateAction<LocationDraft | null>>;
  setStationDraft: Dispatch<SetStateAction<StationSettingsDraft | null>>;
  onClose: () => void;
  onLocationSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onStationSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPreviewRecent: (id: string) => void;
  onUseRecent: (id: string) => void;
  onToggleEditorDetails: () => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const selectedRecent = getSelectedRecent(overlayState.overlay, data.recent);
  const setLocationDraftState = createDraftStateSetter(setLocationDraft);
  const setStationDraftState = createDraftStateSetter(setStationDraft);

  return (
    <>
      {overlayState.overlay.kind === 'edit-location' && overlayState.locationDraft ? (
        <LocationEditorSheet
          formState={overlayState.locationDraft}
          station={data.station}
          showDetails={overlayState.showEditorDetails}
          setFormState={setLocationDraftState}
          onClose={onClose}
          onSubmit={onLocationSubmit}
          onToggleDetails={onToggleEditorDetails}
          onPhotoChange={onPhotoChange}
        />
      ) : null}

      {overlayState.overlay.kind === 'station-settings' && overlayState.stationDraft ? (
        <StationSettingsSheet
          stationForm={overlayState.stationDraft}
          setStationForm={setStationDraftState}
          onClose={onClose}
          onSubmit={onStationSubmit}
        />
      ) : null}

      {overlayState.overlay.kind === 'location-details' ? (
        <LocationDetailsSheet current={data.current} onClose={onClose} />
      ) : null}

      {overlayState.overlay.kind === 'recent-list' ? (
        <RecentLocationsSheet recent={data.recent} onClose={onClose} onPreview={onPreviewRecent} />
      ) : null}

      {selectedRecent ? (
        <RecentLocationPreviewSheet
          selectedRecent={selectedRecent}
          onClose={onClose}
          onUse={onUseRecent}
        />
      ) : null}
    </>
  );
}
