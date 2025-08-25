import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {DirectusTestServerSetup} from "../helpers/DirectusTestServerSetup";


describe('DirectusTestServerSetup', () => {
  let serverSetup: DirectusTestServerSetup;

  beforeAll(async () => {
    // Create a test server with custom configuration
    serverSetup = new DirectusTestServerSetup({
      enableExtensions: false,
    });

    await serverSetup.setup();
  }, 60000);

  afterAll(async () => {
    // Stop the Directus server and clean up resources
    if (serverSetup) {
      await serverSetup.teardown();
    }
  });

  it('should create instance with default options', () => {
    expect(serverSetup).toBeInstanceOf(DirectusTestServerSetup);
    expect(serverSetup.getDirectusUrl()).toBe('http://127.0.0.1:8055');
  });

  it('should return false for isReady when server is not started', async () => {
    serverSetup = new DirectusTestServerSetup();
    
    const isReady = await serverSetup.isReady();
    expect(isReady).toBe(false);
  });

});