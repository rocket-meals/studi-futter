import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { authentication, createDirectus, readUsers, rest } from '@directus/sdk';
import { DirectusTestServerSetup } from './DirectusTestServerSetup';

describe('Example: Using DirectusTestServerSetup in different tests', () => {
  let testServer: DirectusTestServerSetup;

  beforeAll(async () => {
    // Create a test server with custom configuration
    testServer = new DirectusTestServerSetup({
      port: 8056, // Use different port to avoid conflicts
      adminEmail: 'example@test.com',
      adminPassword: 'examplepassword',
      debug: false, // Set to true for debugging
    });

    await testServer.setup();
  }, 60000);

  afterAll(async () => {
    if (testServer) {
      await testServer.teardown();
    }
  });

  it('should be able to connect to the server', async () => {
    // Verify server is ready
    expect(await testServer.isReady()).toBe(true);
    
    // Get server URL
    const serverUrl = testServer.getDirectusUrl();
    expect(serverUrl).toBe('http://127.0.0.1:8056');
  });

  it('should allow admin login and user operations', async () => {
    const directusUrl = testServer.getDirectusUrl();
    const directus = createDirectus(directusUrl).with(rest()).with(authentication());

    // Login with configured admin credentials
    const options = testServer.getOptions();
    await directus.login(options.adminEmail, options.adminPassword);

    // Perform operations
    const users = await directus.request(readUsers());
    expect(users).toHaveLength(1); // Should have the admin user
  });

  it('should provide consistent server configuration', async () => {
    const options = testServer.getOptions();
    
    expect(options.port).toBe(8056);
    expect(options.adminEmail).toBe('example@test.com');
    expect(options.adminPassword).toBe('examplepassword');
    expect(options.dbClient).toBe('sqlite3');
    expect(options.maxStartupAttempts).toBe(60);
    expect(options.startupCheckDelay).toBe(1000);
  });
});