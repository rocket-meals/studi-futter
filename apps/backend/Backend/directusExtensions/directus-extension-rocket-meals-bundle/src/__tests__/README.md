# DirectusTestServerSetup

A reusable TypeScript class for setting up and managing Directus test servers with in-memory SQLite databases.

## Overview

The `DirectusTestServerSetup` class encapsulates all the complex server setup logic previously scattered in test files, providing a clean, reusable interface for Directus testing scenarios.

## Features

- **In-memory SQLite database** - Fast, isolated test database
- **Configurable options** - Port, credentials, extensions, etc.
- **Proper cleanup** - Automated server shutdown and resource cleanup
- **Health checking** - Built-in server readiness verification
- **TypeScript support** - Full type safety and IntelliSense
- **Error handling** - Robust error handling with cleanup on failures
- **Debug logging** - Optional verbose logging for troubleshooting

## Usage

### Basic Usage

```typescript
import { DirectusTestServerSetup } from './DirectusTestServerSetup';

let testServer: DirectusTestServerSetup;

beforeAll(async () => {
  testServer = new DirectusTestServerSetup();
  await testServer.setup();
}, 60000); // 60 second timeout

afterAll(async () => {
  if (testServer) {
    await testServer.teardown();
  }
});

it('should work with Directus', async () => {
  const directusUrl = testServer.getDirectusUrl();
  // Use directusUrl to connect to the server
});
```

### Advanced Configuration

```typescript
const testServer = new DirectusTestServerSetup({
  port: 9000,
  host: 'localhost',
  adminEmail: 'admin@test.com',
  adminPassword: 'custompassword',
  enableExtensionsPath: true,
  extensionsPath: '/path/to/extensions',
  debug: true,
  maxStartupAttempts: 30,
  startupCheckDelay: 2000,
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | number | 8055 | Server port |
| `host` | string | '0.0.0.0' | Server host |
| `dbClient` | string | 'sqlite3' | Database client type |
| `dbFilename` | string | auto-generated | Database file path |
| `secret` | string | auto-generated | Directus secret key |
| `adminEmail` | string | 'test@example.com' | Admin user email |
| `adminPassword` | string | 'testpassword' | Admin user password |
| `extensionsPath` | string | auto-detected | Extensions directory path |
| `enableExtensionsPath` | boolean | false | Enable extensions loading |
| `maxStartupAttempts` | number | 60 | Max server readiness checks |
| `startupCheckDelay` | number | 1000 | Delay between readiness checks (ms) |
| `debug` | boolean | false | Enable debug logging |

## API Methods

### `setup(): Promise<void>`
Starts the Directus server with database bootstrapping. Should be called in `beforeAll`.

### `teardown(): Promise<void>`
Stops the server and cleans up resources. Should be called in `afterAll`.

### `getDirectusUrl(): string`
Returns the server URL for connecting Directus clients.

### `isReady(): Promise<boolean>`
Checks if the server is ready and responding to requests.

## Error Handling

The class includes comprehensive error handling:
- Cleanup on setup failures
- Process error handling
- Database file cleanup errors
- Network connectivity errors

## Migration from Legacy Code

Before (legacy approach):
```typescript
// Complex setup code with manual process management
let directusProcess: ReturnType<typeof spawn> | null = null;
// ... 100+ lines of setup code
```

After (with DirectusTestServerSetup):
```typescript
let testServer = new DirectusTestServerSetup();
await testServer.setup();
```

This reduces test setup complexity from ~150 lines to ~5 lines while improving maintainability and reusability.