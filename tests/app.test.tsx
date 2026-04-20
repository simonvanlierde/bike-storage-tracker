import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '../src/App';

describe('bike storage tracker app', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows a simplified home screen with one main card and compact secondary actions', () => {
    render(<App />);

    const currentSpotCard = screen.getByRole('region', {
      name: /current spot/i,
    });
    const quickActions = screen.getByRole('region', { name: /quick actions/i });

    expect(currentSpotCard).toBeInTheDocument();
    expect(quickActions).toBeInTheDocument();
    expect(screen.getByText(/current spot/i)).toBeInTheDocument();
    expect(screen.getByText(/^lane 4$/i)).toBeInTheDocument();
    expect(screen.getByText(/my station/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change location/i })).toBeInTheDocument();
    expect(
      within(currentSpotCard).getByRole('button', { name: /view details/i }),
    ).toBeInTheDocument();
    expect(
      within(quickActions).getByRole('button', { name: /recent locations/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^1$/i)).toBeInTheDocument();
    expect(
      within(quickActions).getByRole('button', { name: /station settings/i }),
    ).toBeInTheDocument();
    expect(
      within(quickActions).queryByRole('button', { name: /view details/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /restore lane 5 from recent locations/i,
      }),
    ).not.toBeInTheDocument();
  });

  it('opens station settings from the quiet secondary action and lets the user change lane labels and enabled fields', async () => {
    const user = userEvent.setup();

    render(<App />);
    const quickActions = screen.getByRole('region', { name: /quick actions/i });

    await user.click(within(quickActions).getByRole('button', { name: /station settings/i }));

    expect(screen.getByLabelText(/station name/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/lane label 1/i));
    await user.type(screen.getByLabelText(/lane label 1/i), '4');
    await user.clear(screen.getByLabelText(/lane label 2/i));
    await user.type(screen.getByLabelText(/lane label 2/i), '5');
    await user.clear(screen.getByLabelText(/lane label 3/i));
    await user.type(screen.getByLabelText(/lane label 3/i), '6');
    await user.click(screen.getByRole('checkbox', { name: /side/i }));
    await user.click(screen.getByRole('button', { name: /save station settings/i }));

    await user.click(screen.getByRole('button', { name: /change location/i }));

    expect(screen.getByRole('button', { name: /^lane 4$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^lane 5$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^lane 6$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /side left/i })).toBeInTheDocument();
  });

  it('hides disabled station fields from the normal location edit flow', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /change location/i }));

    expect(screen.queryByRole('button', { name: /side left/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rack level top/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /distance close/i })).not.toBeInTheDocument();
  });

  it('supports outside mode with notes and a photo field using a station-first alternate action', async () => {
    const user = userEvent.setup();
    const originalFileReader = window.FileReader;

    class MockFileReader {
      public result: string | ArrayBuffer | null = null;
      public onload: null | (() => void) = null;
      public onerror: null | (() => void) = null;

      readAsDataURL() {
        this.result = 'data:image/png;base64,outside-photo';
        this.onload?.();
      }
    }

    window.FileReader = MockFileReader as unknown as typeof FileReader;

    render(<App />);

    await user.click(screen.getByRole('button', { name: /change location/i }));
    expect(screen.queryByText(/location type/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /parked outside instead/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /parked outside instead/i }));

    expect(screen.queryByRole('button', { name: /^lane 4$/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/outside location note/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/photo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to station/i })).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText(/photo/i),
      new File(['outside'], 'outside.png', { type: 'image/png' }),
    );
    await user.type(screen.getByLabelText(/notes/i), 'At the fence near the station exit');
    await user.click(screen.getByRole('button', { name: /save location/i }));

    expect(screen.getByText(/outside the station/i)).toBeInTheDocument();
    expect(screen.getByText(/at the fence near the station exit/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /view details/i }));
    expect(screen.getByAltText(/saved bike reference/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close details/i }));

    await user.click(screen.getByRole('button', { name: /change location/i }));
    await user.click(screen.getByRole('button', { name: /^lane 4$/i }));
    await user.click(screen.getByRole('button', { name: /save location/i }));
    await user.click(screen.getByRole('button', { name: /view details/i }));
    expect(screen.queryByAltText(/saved bike reference/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close details/i }));

    window.FileReader = originalFileReader;
  });

  it('shows current-location details from the compact secondary action for both station and outside entries', async () => {
    const user = userEvent.setup();

    render(<App />);
    const currentSpotCard = screen.getByRole('region', { name: /current spot/i });

    await user.click(within(currentSpotCard).getByRole('button', { name: /view details/i }));
    expect(
      screen.getByText(/starter spot - update this to your real location/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close details/i }));
    await user.click(screen.getByRole('button', { name: /change location/i }));
    await user.click(screen.getByRole('button', { name: /parked outside instead/i }));
    await user.type(screen.getByLabelText(/notes/i), 'Behind the bus stop');
    await user.click(screen.getByRole('button', { name: /save location/i }));

    await user.click(within(currentSpotCard).getByRole('button', { name: /view details/i }));
    const detailsSheet = screen.getByRole('region', {
      name: /location details/i,
    });
    expect(within(detailsSheet).getByText(/behind the bus stop/i)).toBeInTheDocument();
  });

  it('opens recent locations from the compact secondary action instead of showing them inline', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /recent locations/i }));

    expect(screen.getByRole('heading', { name: /recent locations/i })).toBeInTheDocument();
    expect(screen.getByText(/lane 5 · left · top · close/i, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /restore lane 5 from recent locations/i,
      }),
    ).toBeInTheDocument();
  });

  it('uses a compact close button in the change location header', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /change location/i }));

    expect(screen.getByRole('button', { name: /cancel/i })).toHaveClass('sheet-close--compact');
  });

  it('opens a recent location preview instead of replacing the current spot immediately', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /recent locations/i }));
    await user.click(
      screen.getByRole('button', {
        name: /restore lane 5 from recent locations/i,
      }),
    );

    expect(screen.getByRole('heading', { name: /lane 5/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use this location/i })).toBeInTheDocument();
    expect(screen.getByText(/lane 4/i)).toBeInTheDocument();
  });

  it('keeps recent entry field visibility based on the station settings used when it was saved', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /station settings/i }));
    await user.click(screen.getByRole('checkbox', { name: /side/i }));
    await user.click(screen.getByRole('button', { name: /save station settings/i }));

    await user.click(screen.getByRole('button', { name: /change location/i }));
    await user.click(screen.getByRole('button', { name: /^lane 5$/i }));
    await user.click(screen.getByRole('button', { name: /side left/i }));
    await user.click(screen.getByRole('button', { name: /save location/i }));

    await user.click(screen.getByRole('button', { name: /station settings/i }));
    await user.click(screen.getByRole('checkbox', { name: /side/i }));
    await user.click(screen.getByRole('checkbox', { name: /floor/i }));
    await user.type(screen.getByLabelText(/default floor/i), 'Upper deck');
    await user.click(screen.getByRole('button', { name: /save station settings/i }));

    await user.click(screen.getByRole('button', { name: /recent locations/i }));
    expect(screen.getByText(/lane 4 · right/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /restore lane 4 from recent locations/i,
      }),
    );

    const previewSheet = screen.getByRole('region', { name: /recent location preview/i });
    expect(within(previewSheet).getByText(/^side$/i)).toBeInTheDocument();
    expect(within(previewSheet).getAllByText(/^right$/i).length).toBeGreaterThan(0);
    expect(within(previewSheet).queryByText(/upper deck/i)).not.toBeInTheDocument();
  });

  it('clicking outside a modal closes the editor, recent sheet, detail sheet, and recent preview', async () => {
    const user = userEvent.setup();

    render(<App />);
    const currentSpotCard = screen.getByRole('region', { name: /current spot/i });

    await user.click(screen.getByRole('button', { name: /change location/i }));
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(screen.queryByRole('heading', { name: /change location/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /recent locations/i }));
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(screen.queryByRole('heading', { name: /recent locations/i })).not.toBeInTheDocument();

    await user.click(within(currentSpotCard).getByRole('button', { name: /view details/i }));
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(screen.queryByRole('heading', { name: /location details/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /recent locations/i }));
    await user.click(
      screen.getByRole('button', {
        name: /restore lane 5 from recent locations/i,
      }),
    );
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(screen.queryByRole('heading', { name: /lane 5/i })).not.toBeInTheDocument();
  });

  it('promotes a recent location only after the user confirms it', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /change location/i }));
    await user.click(screen.getByRole('button', { name: /^lane 5$/i }));
    await user.click(screen.getByRole('button', { name: /save location/i }));

    await user.click(screen.getByRole('button', { name: /recent locations/i }));
    await user.click(
      screen.getByRole('button', {
        name: /restore lane 4 from recent locations/i,
      }),
    );
    await user.click(screen.getByRole('button', { name: /use this location/i }));

    expect(screen.getByText(/lane 4/i)).toBeInTheDocument();
  }, 30000);

  it('stores station settings outside the location editor flow', async () => {
    const user = userEvent.setup();

    render(<App />);
    const quickActions = screen.getByRole('region', { name: /quick actions/i });

    await user.click(within(quickActions).getByRole('button', { name: /station settings/i }));
    const settingsSheet = screen.getByRole('region', {
      name: /station settings/i,
    });

    expect(within(settingsSheet).getByLabelText(/station name/i)).toBeInTheDocument();
    expect(within(settingsSheet).getByLabelText(/lane label 1/i)).toBeInTheDocument();
    expect(within(settingsSheet).getByRole('checkbox', { name: /distance/i })).toBeInTheDocument();

    await user.click(
      within(settingsSheet).getByRole('button', {
        name: /save station settings/i,
      }),
    );

    await user.click(screen.getByRole('button', { name: /change location/i }));
    expect(screen.queryByLabelText(/lane label 1/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /distance/i })).not.toBeInTheDocument();
  });
});
