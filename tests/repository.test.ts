import { beforeEach, describe, expect, it } from 'vitest';

import { defaultAppData } from '../src/lib/defaults';
import {
  APP_DATA_STORAGE_KEY,
  clearPhotoStore,
  loadAppData,
  saveAppData,
  savePhoto,
} from '../src/lib/repository';

describe('app data repository', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearPhotoStore();
  });

  it('hydrates the default app data when nothing has been stored yet', async () => {
    await expect(loadAppData()).resolves.toEqual(defaultAppData);
  });

  it('stores photo blobs outside localStorage and can read them back by photo id', async () => {
    const photoId = await savePhoto(new File(['bike-photo'], 'bike.png', { type: 'image/png' }));

    const nextData = {
      ...defaultAppData,
      current:
        defaultAppData.current && defaultAppData.current.mode === 'station'
          ? {
              ...defaultAppData.current,
              photoId,
            }
          : defaultAppData.current,
    };

    await saveAppData(nextData);

    const persisted = window.localStorage.getItem(APP_DATA_STORAGE_KEY);

    expect(persisted).toContain(photoId);
    expect(persisted).not.toContain('bike-photo');
    expect(JSON.parse(persisted ?? '{}')).toMatchObject({
      current: {
        photoId,
      },
    });

    const hydrated = await loadAppData();

    expect(hydrated.current).toMatchObject({
      photoId,
    });
  });

  it('starts fresh when legacy versioned state is found', async () => {
    window.localStorage.setItem(
      APP_DATA_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        state: {
          ...defaultAppData,
          current: {
            ...defaultAppData.current,
            photoDataUrl: 'data:image/png;base64,bGVnYWN5LXBob3Rv',
          },
        },
      }),
    );

    await expect(loadAppData()).resolves.toEqual(defaultAppData);
  });
});
