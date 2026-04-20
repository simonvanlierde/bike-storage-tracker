import { describe, expect, it } from 'vitest';

import {
  createLocationRecord,
  defaultState,
  loadState,
  promoteRecentLocation,
  saveLocation,
  updateStationConfig,
} from '../src/lib/storage';

describe('location storage', () => {
  it('saves a new current spot and moves the previous one into recent history', () => {
    const previous = createLocationRecord(
      {
        mode: 'station',
        lane: '5',
        side: 'right',
        rackLevel: 'bottom',
        distance: 'medium',
        stationName: 'My station',
        visibleFields: {
          side: true,
          rackLevel: true,
          distance: true,
        },
      },
      '2026-04-18T08:15:00.000Z',
    );

    const nextState = saveLocation(
      {
        ...defaultState,
        current: previous,
        recent: [],
      },
      {
        mode: 'station',
        lane: '4',
        side: 'left',
        rackLevel: 'top',
        distance: 'close',
        notes: 'Near the repair station',
      },
      '2026-04-19T07:05:00.000Z',
    );

    expect(nextState.current).toMatchObject({
      mode: 'station',
      lane: '4',
      stationName: 'My station',
      side: 'left',
      rackLevel: 'top',
      distance: 'close',
      notes: 'Near the repair station',
      visibleFields: {},
    });
    expect(nextState.current?.updatedAt).toBe('2026-04-19T07:05:00.000Z');
    expect(nextState.recent).toHaveLength(1);
    expect(nextState.recent[0]).toMatchObject({
      lane: '5',
      stationName: 'My station',
      side: 'right',
      rackLevel: 'bottom',
      distance: 'medium',
    });
  });

  it('promotes a recent location to current and keeps recent history capped', () => {
    const current = createLocationRecord(
      {
        mode: 'station',
        lane: '4',
        side: 'left',
        rackLevel: 'bottom',
        distance: 'far',
        stationName: 'My station',
        visibleFields: {
          side: true,
          rackLevel: true,
          distance: true,
        },
      },
      '2026-04-19T06:30:00.000Z',
    );

    const recent = [
      createLocationRecord(
        {
          mode: 'station',
          lane: '5',
          side: 'right',
          rackLevel: 'top',
          distance: 'close',
          stationName: 'My station',
          visibleFields: {
            side: true,
            rackLevel: true,
            distance: true,
          },
        },
        '2026-04-18T09:00:00.000Z',
      ),
      createLocationRecord(
        {
          mode: 'station',
          lane: '6',
          side: 'left',
          rackLevel: 'bottom',
          distance: 'medium',
          stationName: 'My station',
          visibleFields: {
            side: true,
            rackLevel: true,
            distance: true,
          },
        },
        '2026-04-17T09:00:00.000Z',
      ),
      createLocationRecord(
        {
          mode: 'outside',
          outsideDescription: 'At the cafe rack',
          stationName: 'My station',
        },
        '2026-04-16T09:00:00.000Z',
      ),
      createLocationRecord(
        {
          mode: 'station',
          lane: 'P1',
          side: 'left',
          rackLevel: 'top',
          distance: 'close',
          stationName: 'My station',
          visibleFields: {
            side: true,
            rackLevel: true,
            distance: true,
          },
        },
        '2026-04-15T09:00:00.000Z',
      ),
      createLocationRecord(
        {
          mode: 'station',
          lane: 'Bike shed',
          side: 'right',
          rackLevel: 'bottom',
          distance: 'medium',
          stationName: 'My station',
          visibleFields: {
            side: true,
            rackLevel: true,
            distance: true,
          },
        },
        '2026-04-14T09:00:00.000Z',
      ),
    ];

    const nextState = promoteRecentLocation(
      {
        ...defaultState,
        current,
        recent,
      },
      recent[1].id,
      '2026-04-19T07:10:00.000Z',
    );

    expect(nextState.current).toMatchObject({
      mode: 'station',
      lane: '6',
      side: 'left',
      rackLevel: 'bottom',
      distance: 'medium',
    });
    expect(nextState.current?.updatedAt).toBe('2026-04-19T07:10:00.000Z');
    expect(nextState.recent).toHaveLength(5);
    expect(nextState.recent[0]).toMatchObject({
      lane: '4',
      side: 'left',
      rackLevel: 'bottom',
      distance: 'far',
    });
  });

  it('stores station configuration separately from location entries', () => {
    const nextState = updateStationConfig(defaultState, {
      name: 'Amsterdam Zuid',
      laneInputMode: 'quick',
      laneLabels: ['4', '5', '6'],
      enabledFields: {
        lane: true,
        side: false,
        rackLevel: false,
        distance: false,
        floor: false,
        rackNumber: false,
      },
      defaultFloor: 'Lower level',
    });

    expect(nextState.station).toMatchObject({
      name: 'Amsterdam Zuid',
      laneInputMode: 'quick',
      laneLabels: ['4', '5', '6'],
    });
    expect(nextState.station.enabledFields).toMatchObject({
      lane: true,
      side: false,
      rackLevel: false,
    });
  });

  it('keeps the original station name on recent entries after station settings change', () => {
    const previous = createLocationRecord(
      {
        mode: 'station',
        lane: '5',
        side: 'right',
        rackLevel: 'bottom',
        distance: 'medium',
        stationName: 'Old station',
        visibleFields: {
          side: true,
          rackLevel: true,
          distance: true,
        },
      },
      '2026-04-18T08:15:00.000Z',
    );

    const nextState = saveLocation(
      {
        ...defaultState,
        station: {
          ...defaultState.station,
          name: 'Old station',
        },
        current: previous,
        recent: [],
      },
      {
        mode: 'station',
        lane: '4',
        side: 'left',
        rackLevel: 'top',
        distance: 'close',
      },
      '2026-04-19T07:05:00.000Z',
    );

    const renamedState = updateStationConfig(nextState, {
      ...nextState.station,
      name: 'New station',
    });

    expect(renamedState.recent[0]).toMatchObject({
      lane: '5',
      stationName: 'Old station',
    });
    expect(renamedState.current).toMatchObject({
      lane: '4',
      stationName: 'Old station',
    });
  });

  it('keeps the original enabled fields on saved entries after station settings change', () => {
    const nextState = saveLocation(
      {
        ...defaultState,
        station: {
          ...defaultState.station,
          enabledFields: {
            lane: true,
            side: true,
            rackLevel: false,
            distance: false,
            floor: false,
            rackNumber: false,
          },
        },
        recent: [],
      },
      {
        mode: 'station',
        lane: '4',
        side: 'left',
      },
      '2026-04-19T07:05:00.000Z',
    );

    const renamedState = updateStationConfig(nextState, {
      ...nextState.station,
      enabledFields: {
        lane: true,
        side: false,
        rackLevel: false,
        distance: false,
        floor: true,
        rackNumber: false,
      },
      defaultFloor: 'Upper deck',
    });

    expect(renamedState.current).toMatchObject({
      side: 'left',
      visibleFields: {
        side: true,
      },
    });
  });

  it('supports outside parking entries without station-specific fields', () => {
    const entry = createLocationRecord(
      {
        mode: 'outside',
        outsideDescription: 'Locked to the signpost near the tram stop',
        stationName: 'My station',
      },
      '2026-04-19T08:00:00.000Z',
    );

    expect(entry).toMatchObject({
      mode: 'outside',
      outsideDescription: 'Locked to the signpost near the tram stop',
    });
    if (entry.mode === 'outside') {
      expect(entry.photoDataUrl).toBeUndefined();
    }
  });

  it('resets malformed persisted state back to the default state', () => {
    window.localStorage.setItem(
      'bike-storage-tracker-state-v2',
      JSON.stringify({
        version: 2,
        current: {
          mode: 'station',
        },
      }),
    );

    expect(loadState()).toEqual(defaultState);
  });

  it('rejects the old storage shape and starts fresh', () => {
    window.localStorage.setItem(
      'bike-storage-tracker-state',
      JSON.stringify({
        station: defaultState.station,
        current: {
          mode: 'outside',
          outsideNote: 'Legacy location',
        },
        recent: [],
      }),
    );

    expect(loadState()).toEqual(defaultState);
  });
});
