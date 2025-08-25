import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { authentication, createDirectus, readMe, readUsers, rest } from '@directus/sdk';
import { DirectusTestServerSetup } from '../helpers/DirectusTestServerSetup';
import path from 'path';

// Test server setup instance
let testServerSetup: DirectusTestServerSetup;



beforeAll(async () => {
  // Initialize the test server setup with configuration
  testServerSetup = new DirectusTestServerSetup({
    enableExtensions: false,
  });

  // Start the Directus server
  await testServerSetup.setup();
}, 60000); // 60 seconds timeout

afterAll(async () => {
  // Stop the Directus server and clean up resources
  if (testServerSetup) {
    await testServerSetup.teardown();
  }
});

describe('in-memory database with ItemService', () => {
  it('creates and reads a user', async () => {
    // Get the Directus server URL from our test server setup
    const directusUrl = testServerSetup.getDirectusUrl();
    
    // Create Directus client instance
    let directus = createDirectus(directusUrl).with(rest()).with(authentication());

    // Login as Admin using the configured credentials
    let authResponse = await directus.login(DirectusTestServerSetup.ADMIN_EMAIL, DirectusTestServerSetup.ADMIN_PASSWORD);

    const me = await directus.request(readMe());
    //const news = await directus.request(readItems('news'));

    const users = await directus.request(readUsers());

    // After bootstrapping, there should be an initial admin user
    expect(users).toHaveLength(1);

    // Server cleanup is handled in the afterAll block
  });
});
