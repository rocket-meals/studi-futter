import { Command } from 'commander';
import {DirectusDatabaseSync} from "./DirectusDatabaseSync";
import {DockerDirectusHelper} from "./DockerDirectusHelper";
import {ServerHelper} from "repo-depkit-common";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from 'dotenv';
import {DockerContainerManager} from "./DockerContainerManager";

const program = new Command();

// Programm-Konfiguration
program
    .name('backend-sync')
    .description('Directus Backend Synchronization Tool')
    .version('1.0.0');

// Push Command
program
    .option('--push', 'Push local schema to Directus')
    .option('--pull', 'Pull schema from Directus to local')
    .option('--pull-from-test-system', 'Pull schema from remote test system')
    .option('--docker-push', 'Push inside Docker container')
    .option('--docker-directus-restart', 'Restart Directus Docker containers after push')
    .option('--directus-url <url>', 'Directus instance URL')
    .option('--admin-email <email>', 'Admin email')
    .option('--admin-password <password>', 'Admin password')
    .option('--path-to-data-directus-sync <path>', 'Path to sync data');

enum SyncOperation {
    NONE = 'none',
    PUSH = 'push',
    PULL = 'pull'
}

async function findFileUpwards(startDir: string, filename: string): Promise<string | null> {
    let currentDir = startDir;

    while (true) {
        const potentialPath = path.join(currentDir, filename);
        if (fs.existsSync(potentialPath)) {
            return potentialPath;
        }

        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break; // Reached the root directory
        }
        currentDir = parentDir;
    }

    return null;
}

async function findEnvFile(): Promise<string | null> {
    const startDir = process.cwd();
    return findFileUpwards(startDir, '.env');
}

// Main function
async function main() {
    program.parse();
    const options = program.opts();

    let adminEmail = options.adminEmail || process.env.ADMIN_EMAIL
    let adminPassword = options.adminPassword || process.env.ADMIN_PASSWORD
    let directusInstanceUrl = options.directusUrl;
    let pathToDataDirectusSync = options.pathToDataDirectusSync;
    let dockerDirectusRestart = options.dockerDirectusRestart || false;

    let syncOperation = SyncOperation.NONE;
    if(options.push || options.dockerPush) {
        syncOperation = SyncOperation.PUSH;
    }

    if(options.dockerPush){
        dockerDirectusRestart = true;
    }

    if(options.pull || options.pullFromTestSystem) {
        syncOperation = SyncOperation.PULL;
    }

    if(options.dockerPush) {
        directusInstanceUrl = DockerDirectusHelper.getDirectusServerUrl();
        pathToDataDirectusSync = DockerDirectusHelper.getDataPathToDirectusSyncData();
    }
    if(options.pullFromTestSystem) {
        directusInstanceUrl = ServerHelper.TEST_SERVER_CONFIG.server_url;
        let envFilePath = await findEnvFile();
        if(envFilePath){
            console.log(`🔍 Gefundene .env Datei für Pull vom Testsystem: ${envFilePath}`);
            dotenv.config({ path: envFilePath });
            adminEmail = process.env.ADMIN_EMAIL;
            adminPassword = process.env.ADMIN_PASSWORD;
        }
    }

    let errors = false;
    if (!directusInstanceUrl) {
        console.error('❌ Fehler: Directus URL muss angegeben werden (--directus-url) oder Docker Push muss aktiviert sein (--docker-push)');
        errors = true;
    }
    if(!pathToDataDirectusSync){
        console.error('❌ Fehler: Pfad zu den Sync-Daten muss angegeben werden (--path-to-data-directus-sync)');
        errors = true;
    }
    if (!adminEmail) {
        console.error('❌ Fehler: Admin Email muss angegeben werden (--admin-email) oder über Umgebungsvariablen ADMIN_EMAIL gesetzt sein');
        errors = true;
    }
    if (!adminPassword) {
        console.error('❌ Fehler: Admin Password muss angegeben werden (--admin-password) oder über Umgebungsvariablen ADMIN_PASSWORD gesetzt sein');
        errors = true;
    }
    if(syncOperation === SyncOperation.NONE){
        console.error('❌ Fehler: Ungültige Operation. Wählen Sie entweder --push, --pull oder --docker-push');
        errors = true;
    }

    if(errors){
        program.help();
        process.exit(1);
    }

    try {
        console.log("🚀 Starte Backend Sync Service...");
        console.log(`📡 Directus URL: ${directusInstanceUrl}`);

        const syncHelper = new DirectusDatabaseSync({
            directusInstanceUrl: directusInstanceUrl,
            adminEmail: adminEmail,
            adminPassword: adminPassword,
            pathToDataDirectusSyncData: pathToDataDirectusSync
        });

        switch (syncOperation) {
            case SyncOperation.PUSH:
                console.log('🔄 Führe initiale Push-Operation durch...');
                await syncHelper.push();
                console.log('✅ Initiale Push-Operation erfolgreich abgeschlossen!');
                break;
            case SyncOperation.PULL:
                console.log('🔄 Führe initiale Pull-Operation durch...');
                await syncHelper.pull();
                console.log('✅ Initiale Pull-Operation erfolgreich abgeschlossen!');
                break;
            case SyncOperation.NONE:
                // Sollte nie erreicht werden, da oben validiert
                break;
        }

        if(dockerDirectusRestart){
            console.log('🔄 Starte Directus Docker Container neu...');
            const restartSuccess = await DockerContainerManager.restartDirectusContainers(directusInstanceUrl);
            if(restartSuccess){
                console.log('✅ Directus Docker Container erfolgreich neu gestartet!');
            } else {
                console.error('❌ Fehler: Directus Docker Container Neustart fehlgeschlagen!');
                process.exit(1);
            }
        }


    } catch (error) {
        console.error("💥 Fehler im Backend Sync Service:", error);
        process.exit(1);
    }
}

// Starte den Service
main();
