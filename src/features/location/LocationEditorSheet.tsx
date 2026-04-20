import { ArrowRightLeft, CircleHelp, ImagePlus, Undo2, X } from 'lucide-react';

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react';

import { ModalBackdrop } from '../../components/ModalBackdrop';
import { SegmentedControl } from '../../components/SegmentedControl';
import type { StationConfig } from '../../lib/storage';
import { titleCase } from './display';
import type { LocationFormState } from './helpers';

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <span aria-hidden="true" className="chevron">
      {expanded ? '⌄' : '›'}
    </span>
  );
}

export function LocationEditorSheet({
  formState,
  station,
  showDetails,
  setFormState,
  onClose,
  onSubmit,
  onToggleDetails,
  onPhotoChange,
}: {
  formState: LocationFormState;
  station: StationConfig;
  showDetails: boolean;
  setFormState: Dispatch<SetStateAction<LocationFormState>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleDetails: () => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <section className="editor-sheet" aria-label="Change location">
        <div className="sheet-header">
          <div className="sheet-header__main">
            <h2>Change location</h2>
            <div className="mode-switch">
              {formState.mode === 'station' ? (
                <button
                  className="text-button text-button--switch"
                  type="button"
                  onClick={() =>
                    setFormState((previous) => ({
                      ...previous,
                      mode: 'outside',
                      notes: '',
                      photoDataUrl: '',
                    }))
                  }
                >
                  <ArrowRightLeft aria-hidden="true" className="button-icon" />
                  <span>Parked outside instead</span>
                </button>
              ) : (
                <button
                  className="text-button text-button--switch"
                  type="button"
                  onClick={() =>
                    setFormState((previous) => ({
                      ...previous,
                      mode: 'station',
                      notes: '',
                      photoDataUrl: '',
                    }))
                  }
                >
                  <Undo2 aria-hidden="true" className="button-icon" />
                  <span>Back to station</span>
                </button>
              )}
            </div>
          </div>
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
          {formState.mode === 'outside' ? (
            <>
              <label className="field field--prominent">
                <span>Notes</span>
                <textarea
                  aria-label="Notes"
                  rows={3}
                  value={formState.notes}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Photo</span>
                <div className="file-input-wrap">
                  <ImagePlus aria-hidden="true" className="button-icon" />
                  <input accept="image/*" aria-label="Photo" onChange={onPhotoChange} type="file" />
                </div>
              </label>
            </>
          ) : (
            <>
              {station.enabledFields.lane ? (
                station.laneInputMode === 'quick' ? (
                  <fieldset className="segmented-field">
                    <legend>Lane</legend>
                    <div className="segmented-field__options segmented-field__options--fit">
                      {station.laneLabels.map((lane) => (
                        <button
                          key={lane}
                          aria-label={`Lane ${lane}`}
                          aria-pressed={formState.lane === lane}
                          className={
                            formState.lane === lane
                              ? 'segment segment--dense is-active'
                              : 'segment segment--dense'
                          }
                          type="button"
                          onClick={() => setFormState((previous) => ({ ...previous, lane }))}
                        >
                          {lane}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <label className="field field--prominent">
                    <span>Lane</span>
                    <input
                      aria-label="Lane"
                      type="text"
                      value={formState.lane}
                      onChange={(event) =>
                        setFormState((previous) => ({
                          ...previous,
                          lane: event.target.value,
                        }))
                      }
                    />
                  </label>
                )
              ) : null}

              {station.enabledFields.side ? (
                <SegmentedControl
                  label="Side"
                  layout="fit"
                  options={['left', 'right']}
                  value={formState.side}
                  onChange={(side) => setFormState((previous) => ({ ...previous, side }))}
                  titleCase={titleCase}
                />
              ) : null}

              {station.enabledFields.rackLevel ? (
                <SegmentedControl
                  label="Rack level"
                  layout="fit"
                  options={['top', 'bottom']}
                  value={formState.rackLevel}
                  onChange={(rackLevel) => setFormState((previous) => ({ ...previous, rackLevel }))}
                  titleCase={titleCase}
                />
              ) : null}

              {station.enabledFields.distance ? (
                <SegmentedControl
                  label="Distance"
                  labelSuffix={
                    <button aria-label="Distance help" className="info-trigger" type="button">
                      <CircleHelp aria-hidden="true" className="button-icon" />
                      <span className="info-tooltip">
                        Close = near the entrance. Medium = around the middle. Far = deeper inside.
                      </span>
                    </button>
                  }
                  layout="fit"
                  options={['close', 'medium', 'far']}
                  value={formState.distance}
                  onChange={(distance) => setFormState((previous) => ({ ...previous, distance }))}
                  titleCase={titleCase}
                />
              ) : null}
            </>
          )}

          {formState.mode === 'station' ? (
            <button
              aria-expanded={showDetails}
              className="ghost-button ghost-button--wide details-toggle"
              type="button"
              onClick={onToggleDetails}
            >
              <span>More details</span>
              <Chevron expanded={showDetails} />
            </button>
          ) : null}

          {formState.mode === 'station' && showDetails ? (
            <div className="details-panel">
              {station.enabledFields.floor ? (
                <label className="field field--secondary">
                  <span>Station floor</span>
                  <input
                    aria-label="Station floor"
                    value={formState.floor}
                    onChange={(event) =>
                      setFormState((previous) => ({
                        ...previous,
                        floor: event.target.value,
                      }))
                    }
                  />
                </label>
              ) : null}

              {station.enabledFields.rackNumber ? (
                <label className="field">
                  <span>Rack number</span>
                  <input
                    aria-label="Rack number"
                    value={formState.rackNumber}
                    onChange={(event) =>
                      setFormState((previous) => ({
                        ...previous,
                        rackNumber: event.target.value,
                      }))
                    }
                  />
                </label>
              ) : null}
              <label className="field">
                <span>Notes</span>
                <textarea
                  aria-label="Notes"
                  rows={3}
                  value={formState.notes}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Photo</span>
                <div className="file-input-wrap">
                  <ImagePlus aria-hidden="true" className="button-icon" />
                  <input accept="image/*" aria-label="Photo" onChange={onPhotoChange} type="file" />
                </div>
              </label>
            </div>
          ) : null}

          <button className="primary-button primary-button--wide" type="submit">
            Save location
          </button>
        </form>
      </section>
    </ModalBackdrop>
  );
}
