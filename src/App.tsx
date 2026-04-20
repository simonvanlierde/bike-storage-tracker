import { AppOverlays } from './features/app/AppOverlays';
import { useAppController } from './features/app/useAppController';
import { CurrentSpotCard } from './features/location/CurrentSpotCard';
import { UtilityActions } from './features/location/UtilityActions';

export default function App() {
  const app = useAppController();

  return (
    <main className="app-shell">
      <CurrentSpotCard
        current={app.current}
        notice={app.notice}
        supportingSummary={app.supportingSummary}
        onEdit={() => app.openOverlay({ kind: 'edit-location' })}
        onOpenDetails={() => app.openOverlay({ kind: 'location-details' })}
      />

      <UtilityActions
        recentCount={app.recentCount}
        onOpenRecent={() => app.openOverlay({ kind: 'recent-list' })}
        onOpenStationSettings={() => app.openOverlay({ kind: 'station-settings' })}
      />

      <AppOverlays
        data={app.data}
        overlayState={app.overlayState}
        setLocationDraft={(updater) =>
          app.setOverlayState((previous) => ({
            ...previous,
            locationDraft:
              typeof updater === 'function' ? updater(previous.locationDraft) : updater,
          }))
        }
        setStationDraft={(updater) =>
          app.setOverlayState((previous) => ({
            ...previous,
            stationDraft: typeof updater === 'function' ? updater(previous.stationDraft) : updater,
          }))
        }
        onClose={app.closeOverlay}
        onLocationSubmit={app.handleLocationSubmit}
        onStationSubmit={app.handleStationSubmit}
        onPreviewRecent={(id) => app.openOverlay({ kind: 'recent-preview', id })}
        onUseRecent={app.handleUseRecent}
        onToggleEditorDetails={app.toggleEditorDetails}
        onPhotoChange={app.handlePhotoChange}
      />
    </main>
  );
}
