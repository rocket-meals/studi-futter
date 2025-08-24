import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { DirectusTestServerSetup, DirectusTestServerOptions } from './DirectusTestServerSetup';

describe('DirectusTestServerSetup', () => {
  let serverSetup: DirectusTestServerSetup;

  afterEach(async () => {
    // Cleanup after each test
    if (serverSetup) {
      await serverSetup.teardown();
    }
  });

  it('should create instance with default options', () => {
    serverSetup = new DirectusTestServerSetup();
    
    expect(serverSetup).toBeInstanceOf(DirectusTestServerSetup);
    expect(serverSetup.getDirectusUrl()).toBe('http://127.0.0.1:8055');
  });

  it('should create instance with custom options', () => {
    const options: DirectusTestServerOptions = {
      port: 9000,
      host: 'localhost',
      adminEmail: 'admin@test.com',
      adminPassword: 'custompassword',
      debug: true,
    };

    serverSetup = new DirectusTestServerSetup(options);
    
    expect(serverSetup.getDirectusUrl()).toBe('http://localhost:9000');
  });

  it('should return false for isReady when server is not started', async () => {
    serverSetup = new DirectusTestServerSetup();
    
    const isReady = await serverSetup.isReady();
    expect(isReady).toBe(false);
  });

  // Note: Full integration tests with server setup and teardown would require
  // a proper test environment with Directus dependencies installed
});