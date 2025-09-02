import {DockerDirectusHelper} from "./DockerDirectusHelper";
import {FetchIgnoreSelfSignedCertHelper} from "./FetchIgnoreSelfSignedCertHelper";

export class DockerDirectusPingHelper {

  // Ping-Check-Funktion für Directus
  public static async waitForDirectusHealthy(directusUrl = DockerDirectusHelper.getDirectusServerUrl(), maxRetries: number = -1, retryIntervalSeconds: number = 5): Promise<boolean> {
    //const healthCheckUrl = `${directusUrl}/server/health`; // Health prüft auch email connection, welche wenn nicht konfiguriert fehlschlägt
    const pingCheckUrl = `${directusUrl}/server/ping`; // daher als fallback

    console.log(`🔍 Warte auf Directus Ping-Check auf: ${pingCheckUrl}`);

    let attempt = 0;
    while (maxRetries === -1 || attempt < maxRetries) {
      attempt++;
      try {
        console.log(`⏳ Prüfe Directus Ping Status...`);

        // Versuche zuerst den standard Ping endpoint
        let response = await FetchIgnoreSelfSignedCertHelper.fetch(pingCheckUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          // Timeout nach 5 Sekunden
          signal: AbortSignal.timeout(retryIntervalSeconds*1000)
        });

        if (response.ok) {
          console.log(`✅ Directus ist reachable!`);
          console.log(`🚀 Directus Ping-Check erfolgreich, fortfahren...`);
          return true;
        } else {
          console.log(`❌ Directus Ping-Check fehlgeschlagen - Status: ${response.status}`);
        }
      } catch (error: any) {
        // Behandlung spezifischer Fehlertypen
        if(error.name === 'FetchError'){
          if(error.type === 'system' && error.code === 'ECONNREFUSED'){
            console.log(`🔌 Verbindungsfehler - Directus ist noch nicht erreichbar (${error.code})`);
          } else {
            console.log(`❌ Fetch-Fehler beim Ping-Check:`, error.message);
          }
        } else if (error.name === 'TimeoutError') {
          console.log(`⏱️ Ping-Check Timeout - Directus antwortet nicht schnell genug`);
        } else if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
          console.log(`🔌 Verbindungsfehler - Directus ist noch nicht erreichbar`);
        } else {
          console.log(`❌ Unerwarteter Fehler beim Ping-Check:`, error.message);
          console.log(error);
        }
      }

      console.log(`⏸️  Warte ${retryIntervalSeconds} Sekunden vor dem nächsten Ping-Check...`);
      await new Promise(resolve => setTimeout(resolve, retryIntervalSeconds*1000));
    }
    return false;
  }

}