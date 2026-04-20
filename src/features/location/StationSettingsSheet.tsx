import { X } from 'lucide-react';

import type { Dispatch, FormEvent, SetStateAction } from 'react';

import { ModalBackdrop } from '../../components/ModalBackdrop';
import { ToggleField } from '../../components/ToggleField';
import type { StationFormState } from './helpers';

export function StationSettingsSheet({
  stationForm,
  setStationForm,
  onClose,
  onSubmit,
}: {
  stationForm: StationFormState;
  setStationForm: Dispatch<SetStateAction<StationFormState>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <section className="editor-sheet" aria-label="Station settings">
        <div className="sheet-header">
          <h2>Station settings</h2>
          <button
            aria-label="Cancel"
            className="ghost-button ghost-button--icon sheet-close sheet-close--compact"
            type="button"
            onClick={onClose}
          >
            <X aria-hidden="true" className="button-icon" />
            <span className="sr-only">Cancel</span>
          </button>
        </div>

        <form className="editor-form" onSubmit={onSubmit}>
          <label className="field field--prominent">
            <span>Station name</span>
            <input
              aria-label="Station name"
              value={stationForm.name}
              onChange={(event) =>
                setStationForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </label>

          <fieldset className="segmented-field">
            <legend>Lane input</legend>
            <div className="segmented-field__options segmented-field__options--two">
              <button
                aria-pressed={stationForm.laneInputMode === 'quick'}
                className={stationForm.laneInputMode === 'quick' ? 'segment is-active' : 'segment'}
                type="button"
                onClick={() =>
                  setStationForm((previous) => ({
                    ...previous,
                    laneInputMode: 'quick',
                  }))
                }
              >
                Quick lanes
              </button>
              <button
                aria-pressed={stationForm.laneInputMode === 'number'}
                className={stationForm.laneInputMode === 'number' ? 'segment is-active' : 'segment'}
                type="button"
                onClick={() =>
                  setStationForm((previous) => ({
                    ...previous,
                    laneInputMode: 'number',
                  }))
                }
              >
                Number input
              </button>
            </div>
          </fieldset>

          <div className="settings-grid">
            {stationForm.laneLabels.map((label, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lane slots are fixed-position settings fields.
              <label className="field" key={`lane-label-${index + 1}`}>
                <span>Lane label {index + 1}</span>
                <input
                  aria-label={`Lane label ${index + 1}`}
                  value={label}
                  onChange={(event) => {
                    const laneLabels = [...stationForm.laneLabels];
                    laneLabels[index] = event.target.value;
                    setStationForm((previous) => ({ ...previous, laneLabels }));
                  }}
                />
              </label>
            ))}
          </div>

          <label className="field field--secondary">
            <span>Default floor</span>
            <input
              aria-label="Default floor"
              value={stationForm.defaultFloor}
              onChange={(event) =>
                setStationForm((previous) => ({
                  ...previous,
                  defaultFloor: event.target.value,
                }))
              }
            />
          </label>

          <fieldset className="settings-fieldset">
            <legend>Enabled fields</legend>
            <ToggleField
              label="Side"
              checked={stationForm.enabledFields.side}
              onChange={(checked) =>
                setStationForm((previous) => ({
                  ...previous,
                  enabledFields: { ...previous.enabledFields, side: checked },
                }))
              }
            />
            <ToggleField
              label="Rack level"
              checked={stationForm.enabledFields.rackLevel}
              onChange={(checked) =>
                setStationForm((previous) => ({
                  ...previous,
                  enabledFields: {
                    ...previous.enabledFields,
                    rackLevel: checked,
                  },
                }))
              }
            />
            <ToggleField
              label="Distance"
              checked={stationForm.enabledFields.distance}
              onChange={(checked) =>
                setStationForm((previous) => ({
                  ...previous,
                  enabledFields: {
                    ...previous.enabledFields,
                    distance: checked,
                  },
                }))
              }
            />
            <ToggleField
              label="Floor"
              checked={stationForm.enabledFields.floor}
              onChange={(checked) =>
                setStationForm((previous) => ({
                  ...previous,
                  enabledFields: { ...previous.enabledFields, floor: checked },
                }))
              }
            />
            <ToggleField
              label="Rack number"
              checked={stationForm.enabledFields.rackNumber}
              onChange={(checked) =>
                setStationForm((previous) => ({
                  ...previous,
                  enabledFields: {
                    ...previous.enabledFields,
                    rackNumber: checked,
                  },
                }))
              }
            />
          </fieldset>

          <button className="primary-button primary-button--wide" type="submit">
            Save station settings
          </button>
        </form>
      </section>
    </ModalBackdrop>
  );
}
