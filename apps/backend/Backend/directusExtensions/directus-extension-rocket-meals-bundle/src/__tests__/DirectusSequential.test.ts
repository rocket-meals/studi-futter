import { describe, it, expect } from '@jest/globals';
import { createDirectus, rest, authentication, readUsers, readMe } from '@directus/sdk';
import { DirectusTestServerSetup } from '../helpers/DirectusTestServerSetup';

// Single test running all Directus test scenarios sequentially

describe('Directus server sequential tests', () => {
  it('sets up server and performs user operations', async () => {
    const freshServer = new DirectusTestServerSetup({ enableExtensions: false });

    // isReady should return false for a fresh server that hasn't started
    const notReady = await freshServer.isReady();
    expect(notReady).toBe(false);

    await freshServer.setup();
    const serverSetup = freshServer; // after setup, server should be ready

    try {
      // isReady should return true when server is started
      const ready = await serverSetup.isReady();
      expect(ready).toBe(true);

      // Use Directus SDK to login and read users
      const directusUrl = serverSetup.getDirectusUrl();
      const directus = createDirectus(directusUrl).with(rest()).with(authentication());
      await directus.login(
        DirectusTestServerSetup.ADMIN_EMAIL,
        DirectusTestServerSetup.ADMIN_PASSWORD
      );
      await directus.request(readMe());
      const users = await directus.request(readUsers());
      expect(users).toHaveLength(1);
    } finally {
      await serverSetup.teardown();
    }
  }, 60000);
});
