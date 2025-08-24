import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { authentication, createDirectus, readMe, readUsers, rest } from '@directus/sdk';
import { DirectusTestServerSetup } from './DirectusTestServerSetup';
import path from 'path';

// Test server setup instance
let testServerSetup: DirectusTestServerSetup;

// Server configuration
const ADMIN_EMAIL = 'test@example.com';
const ADMIN_PASSWORD = 'testpassword';
const EXTENSIONS_PATH = path.join(__dirname, '..', '..', '..');

beforeAll(async () => {
  // Initialize the test server setup with configuration
  testServerSetup = new DirectusTestServerSetup({
    adminEmail: ADMIN_EMAIL,
    adminPassword: ADMIN_PASSWORD,
    extensionsPath: EXTENSIONS_PATH,
    enableExtensionsPath: false, // Set to true if extensions are needed
    debug: false, // Set to true for debug logging
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
    let authResponse = await directus.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    const me = await directus.request(readMe());
    //const news = await directus.request(readItems('news'));

    const users = await directus.request(readUsers());

    // After bootstrapping, there should be an initial admin user
    expect(users).toHaveLength(1);

    // Server cleanup is handled in the afterAll block
  });
});
