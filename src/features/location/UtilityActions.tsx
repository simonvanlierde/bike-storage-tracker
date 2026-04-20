import { History, Settings2 } from 'lucide-react';

export function UtilityActions({
  recentCount,
  onOpenRecent,
  onOpenStationSettings,
}: {
  recentCount: number;
  onOpenRecent: () => void;
  onOpenStationSettings: () => void;
}) {
  return (
    <section className="secondary-card utility-panel" aria-label="Quick actions">
      <div className="utility-panel__header">
        <h2 className="section-title">Quick actions</h2>
      </div>

      <div className="utility-actions">
        <button className="utility-button" type="button" onClick={onOpenRecent}>
          <span className="utility-button__row">
            <span className="utility-button__title">
              <History aria-hidden="true" className="button-icon" />
              <span>Recent locations</span>
            </span>
            <span className="utility-count">{recentCount}</span>
          </span>
        </button>
        <button className="utility-button" type="button" onClick={onOpenStationSettings}>
          <span className="utility-button__title">
            <Settings2 aria-hidden="true" className="button-icon" />
            <span>Station settings</span>
          </span>
        </button>
      </div>
    </section>
  );
}
