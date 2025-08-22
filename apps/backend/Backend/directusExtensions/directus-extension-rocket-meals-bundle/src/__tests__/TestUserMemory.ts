import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { authentication, createDirectus, readMe, readUsers, rest } from '@directus/sdk';
import { exec, spawn } from 'child_process';
import { FetchHelper } from '../helpers/FetchHelper';
import * as os from 'node:os';
import path from 'path';
import fse from 'fs-extra';

// Hier wird die Directus-Instanz gestartet
// Zum Halten des Child-Prozesses des Directus-Servers
let directusProcess: ReturnType<typeof spawn> | null = null;

const serverStartMaxAttempts = 60; // Versuche bis zu 120 Mal, um den Server zu starten
const serverStartCheckDelay = 1000; // 1 Sekunde
const serverStartTimeout = serverStartMaxAttempts * serverStartCheckDelay;

const directusUrl = 'http://0.0.0.0:8055';
const dbFile = path.join(os.tmpdir(), `directus-memory-test-${process.pid}.sqlite`);
const DB_CLIENT = 'sqlite3';
const DB_FILENAME = dbFile;
const SECRET = 'Ihr-langer-zufälliger-geheimer-Schlüssel-für-Tests';
const ADMIN_EMAIL = 'test@example.com';
const ADMIN_PASSWORD = 'testpassword';
const EXTENSIONS_PATH = path.join(__dirname, '..', '..', '..');

const addExtensionPath = false;

beforeAll(async () => {
  // 1. Umgebungsvariablen für Directus setzen
  // Diese werden von Directus verwendet, um die Datenbankverbindung und Admin-Anmeldeinformationen zu konfigurieren.

  const env = {
    ...process.env, // ← entscheidend!
    DB_CLIENT: DB_CLIENT,
    DB_FILENAME: DB_FILENAME,
    SECRET: SECRET,
    ADMIN_EMAIL: ADMIN_EMAIL,
    ADMIN_PASSWORD: ADMIN_PASSWORD,
    ...(addExtensionPath ? { EXTENSIONS_PATH: EXTENSIONS_PATH } : {}),
  };

  // 2. Directus-Server in einem Child-Prozess starten
  // 'spawn' ist besser für langlebige Prozesse wie einen Server.[4, 5, 6]
  //console.log('Directus-Server wird gestartet...');
  // 2. Directus-Datenbankschema initialisieren (bootstrap)
  // Dies erstellt die notwendigen Tabellen in der In-Memory-Datenbank.
  //console.log('Directus-Datenbank wird gebootstrappt...');
  // --- bootstrap ---
  await new Promise((resolve, reject) => {
    exec(
      'npx directus bootstrap',
      {
        env, // <-- hier das gemergte env
      },
      (error: any, stdout: any, stderr: any) => {
        //if (stdout) console.log(stdout);
        //if (stderr) console.error(stderr);

        if (error) return reject(error);
        resolve(undefined);
      }
    );
  });

  // 3. Directus-Server in einem Child-Prozess starten
  // 'spawn' ist besser für langlebige Prozesse wie einen Server.[4, 5, 6]
  directusProcess = spawn('npx', ['directus', 'start'], {
    env: env,
    //stdio: 'inherit', // Leitet die Ausgabe des Child-Prozesses an die Konsole des Elternprozesses weiter
    stdio: ['ignore', 'pipe', 'pipe'], // Leitet stdout und stderr an den Elternprozess weiter
    detached: true, // Ermöglicht es dem Child-Prozess, unabhängig vom Elternprozess zu laufen
  });

  // Logs vom Directus-Server auf die Jest-Konsole umleiten
  if (directusProcess.stdout) {
    directusProcess.stdout.on('data', data => {
      console.log(`[Directus stdout]: ${data}`);
    });
  }

  let isKnownError = (data: string) => {
    if (data.includes('Update available')) {
      return true;
    }
    return false;
  };

  if (directusProcess.stderr) {
    directusProcess.stderr.on('data', data => {
      if (!isKnownError(data.toString())) {
        console.error(`[Directus stderr]: ${data}`);
      }
    });
  }

  // Stellt sicher, dass der Elternprozess nicht auf das Beenden des Child-Prozesses wartet
  directusProcess.unref();

  // Optionale Fehlerbehandlung für den Child-Prozess
  directusProcess.on('error', err => {
    console.error('Fehler im Directus-Serverprozess:', err);
  });

  directusProcess.on('close', code => {
    //console.log(`Directus-Serverprozess wurde mit Code ${code} beendet.`);
  });

  // 4. Warten, bis der Directus-Server bereit ist
  // Der Server läuft standardmäßig auf Port 8055.[1, 7]

  let serverReady = false;
  let attempts = 0;

  while (!serverReady && attempts < serverStartMaxAttempts) {
    try {
      //console.log(`Versuche, eine Verbindung zum Directus-Server herzustellen (${attempts + 1}/${serverStartMaxAttempts})...`);
      const response = await FetchHelper.fetch(`${directusUrl}/server/ping`); // Überprüft die Serverbereitschaft über den Ping-Endpunkt [8]
      if (response.ok) {
        serverReady = true;
        //console.log('Directus-Server ist bereit!');
      }
    } catch (error) {
      //console.log('Directus-Server noch nicht erreichbar, versuche es erneut...');
    }
    if (!serverReady) {
      await new Promise(resolve => setTimeout(resolve, serverStartCheckDelay));
      attempts++;
    }
  }

  if (!serverReady) {
    throw new Error('Directus-Server konnte nicht rechtzeitig gestartet werden.');
  }

  // 5. Directus SDK-Client initialisieren, um mit dem laufenden Server zu interagieren
}, serverStartTimeout); // Timeout von 120 Sekunden, um dem Server genügend Zeit zum Starten zu geben

afterAll(async () => {
  //console.log('Test abgeschlossen, Directus-Server wird gestoppt und In-Memory-Datenbank gelöscht...');
  // Stoppt den Directus-Serverprozess
  if (directusProcess) {
    //console.log('Directus-Server wird gestoppt...');
    // Sendet SIGTERM an die Prozessgruppe, um sicherzustellen, dass alle Child-Prozesse beendet werden [10]
    if (directusProcess.pid) {
      process.kill(-directusProcess.pid);
      //console.log('Directus-Server gestoppt.');
    } else {
      //console.log('Kein Directus-Serverprozess gefunden zum Stoppen.');
    }
  } else {
    //console.log('Kein Directus-Serverprozess gefunden.');
  }

  try {
    // Löscht die In-Memory-Datenbankdatei
    if (fse.existsSync(dbFile)) {
      //console.log('In-Memory-Datenbankdatei wird gelöscht...');
      await fse.remove(dbFile);
      //console.log('In-Memory-Datenbankdatei gelöscht.');
    }
  } catch (error: any) {
    console.error('Fehler beim Löschen der In-Memory-Datenbankdatei:', error);
  }
});

describe('in-memory database with ItemService', () => {
  it('creates and reads a user', async () => {
    // Der Directus-Server wird jetzt im 'beforeAll'-Block gestartet.
    let directus = createDirectus(directusUrl).with(rest()).with(authentication());

    // Login als Admin (ENV-Werte hast du ja oben definiert)
    let authResponse = await directus.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    const me = await directus.request(readMe());
    //const news = await directus.request(readItems('news'));

    const users = await directus.request(readUsers());

    // Nach dem Bootstrapping sollte ein initialer Admin-Benutzer vorhanden sein.
    expect(users).toHaveLength(1);

    // Der Server wird jetzt im 'afterAll'-Block gestoppt und die In-Memory-Datenbank gelöscht.
  });
});
