import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';

import { RecentLocationPreviewSheet } from './features/history/RecentLocationPreviewSheet';
import { RecentLocationsSheet } from './features/history/RecentLocationsSheet';
import { CurrentSpotCard } from './features/location/CurrentSpotCard';
import { getSummary, getSupportingSummary } from './features/location/display';
import {
  buildLocationRecordInput,
  buildStationConfig,
  initialLocationForm,
  initialStationForm,
  type LocationFormState,
  toDataUrl,
} from './features/location/helpers';
import { LocationDetailsSheet } from './features/location/LocationDetailsSheet';
import { LocationEditorSheet } from './features/location/LocationEditorSheet';
import { StationSettingsSheet } from './features/location/StationSettingsSheet';
import { UtilityActions } from './features/location/UtilityActions';
import {
  type AppState,
  type LocationRecord,
  loadState,
  persistState,
  promoteRecentLocation,
  saveLocation,
  updateStationConfig,
} from './lib/storage';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadState());
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingStation, setIsEditingStation] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRecentListOpen, setIsRecentListOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRecent, setSelectedRecent] = useState<LocationRecord | null>(null);
  const [notice, setNotice] = useState('');
  const [formState, setFormState] = useState<LocationFormState>(() =>
    initialLocationForm(loadState().current, loadState().station),
  );
  const [stationForm, setStationForm] = useState(() => initialStationForm(loadState().station));

  useEffect(() => {
    persistState(appState);
  }, [appState]);

  const current = appState.current;
  const station = appState.station;

  function openEditor() {
    setFormState(initialLocationForm(current?.mode === 'outside' ? null : current, station));
    setShowDetails(false);
    setIsEditing(true);
  }

  function closeEditor() {
    setIsEditing(false);
    setShowDetails(false);
    setNotice('');
  }

  function openStationSettings() {
    setStationForm(initialStationForm(station));
    setIsEditingStation(true);
  }

  function closeStationSettings() {
    setIsEditingStation(false);
  }

  function handleLocationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextLocation = buildLocationRecordInput(formState, station);
    if (!nextLocation) {
      return;
    }

    setAppState((previous) => saveLocation(previous, nextLocation));
    setNotice('Location updated');
    setIsEditing(false);
  }

  function handleStationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextStation = buildStationConfig(stationForm);
    setAppState((previous) => updateStationConfig(previous, nextStation));
    setNotice('Station settings updated');
    setIsEditingStation(false);
  }

  function openRecentPreview(id: string) {
    setIsRecentListOpen(false);
    setSelectedRecent(appState.recent.find((entry) => entry.id === id) ?? null);
  }

  function useRecentAsCurrent(id: string) {
    setAppState((previous) => promoteRecentLocation(previous, id));
    setSelectedRecent(null);
    setNotice('Location updated from recent');
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await toDataUrl(file);
    setFormState((previous) => ({
      ...previous,
      photoDataUrl: dataUrl,
    }));
  }

  const summary = getSummary(current);
  const supportingSummary = getSupportingSummary(current, summary);

  return (
    <main className="app-shell">
      <CurrentSpotCard
        current={current}
        notice={notice}
        supportingSummary={supportingSummary}
        onEdit={openEditor}
        onOpenDetails={() => setIsDetailsOpen(true)}
      />

      <UtilityActions
        recentCount={appState.recent.length}
        onOpenRecent={() => setIsRecentListOpen(true)}
        onOpenStationSettings={openStationSettings}
      />

      {isEditing ? (
        <LocationEditorSheet
          formState={formState}
          station={station}
          showDetails={showDetails}
          setFormState={setFormState}
          onClose={closeEditor}
          onSubmit={handleLocationSubmit}
          onToggleDetails={() => setShowDetails((previous) => !previous)}
          onPhotoChange={handlePhotoChange}
        />
      ) : null}

      {isEditingStation ? (
        <StationSettingsSheet
          stationForm={stationForm}
          setStationForm={setStationForm}
          onClose={closeStationSettings}
          onSubmit={handleStationSubmit}
        />
      ) : null}

      {isDetailsOpen ? (
        <LocationDetailsSheet current={current} onClose={() => setIsDetailsOpen(false)} />
      ) : null}

      {isRecentListOpen ? (
        <RecentLocationsSheet
          recent={appState.recent}
          onClose={() => setIsRecentListOpen(false)}
          onPreview={openRecentPreview}
        />
      ) : null}

      {selectedRecent ? (
        <RecentLocationPreviewSheet
          selectedRecent={selectedRecent}
          onClose={() => setSelectedRecent(null)}
          onUse={useRecentAsCurrent}
        />
      ) : null}
    </main>
  );
}
