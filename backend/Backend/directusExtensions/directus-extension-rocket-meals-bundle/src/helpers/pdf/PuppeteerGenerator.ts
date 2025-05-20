import {PdfGeneratorOptions, RequestOptions} from "./PdfGeneratorHelper";
import { default as puppeteerCore } from "puppeteer-core";
import {EnvVariableHelper} from "../EnvVariableHelper";

export class PuppeteerGenerator {
    public static PuppeteerCore: any = puppeteerCore;
    public static PuppeteerForJest: any = undefined;

    public static getPuppeteerLib() {
        return this.PuppeteerForJest || this.PuppeteerCore;
    }

    /**
     * rocket-meals-directus-2         | Error generating PDF: yx: Navigation timeout of 30000 ms exceeded
     * rocket-meals-directus-2         |     at new e (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:64:5072)
     * rocket-meals-directus-2         |     at e.create (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:64:4760)
     * rocket-meals-directus-2         |     at new eG (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:323:1107)
     * rocket-meals-directus-2         |     at dx.setContent (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:328:4947)
     * rocket-meals-directus-2         |     at async MG.setContent (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:210:4370)
     * rocket-meals-directus-2         |     at async Z0.generatePdfFromHtmlPuppeteer (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:535:3742)
     * rocket-meals-directus-2         |     at async e1.generatePdfFromHtml (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:535:4270)
     * rocket-meals-directus-2         |     at async r1 (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:535:8881)
     * rocket-meals-directus-2         |     at async EventEmitter.<anonymous> (file:///directus/extensions/directus-extension-rocket-meals-bundle/dist/api.js?t=1747127408441:535:14756)
     * rocket-meals-directus-2         |     at async Promise.all (index 1)
     */

    static async generatePdfFromHtmlPuppeteer(html: string, requestOptions: RequestOptions, options: PdfGeneratorOptions): Promise<Buffer> {
        let browser;
        let puppeteer = PuppeteerGenerator.getPuppeteerLib();

        let isInsideDocker = EnvVariableHelper.isInsideDocker();

        let executablePath = isInsideDocker ? "/usr/bin/chromium" : undefined;

        try {
            browser = await puppeteer.launch({
                executablePath: executablePath,
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-software-rasterizer",
                    "--disable-vulkan",
                    "--disable-extensions",
                    "--disable-background-networking",
                    "--disable-breakpad",
                    "--disable-client-side-phishing-detection",
                    "--disable-component-update",
                    "--disable-default-apps",
                    "--disable-hang-monitor",
                    "--disable-ipc-flooding-protection",
                    "--disable-popup-blocking",
                    "--disable-prompt-on-repost",
                    "--disable-sync",
                    "--disable-translate",
                    "--disable-logging",
                    "--metrics-recording-only",
                    "--mute-audio",
                    "--no-first-run",
                    "--safebrowsing-disable-auto-update",
                    "--single-process",
                    "--no-zygote",
                    "--disable-features=AudioServiceOutOfProcess",
                    "--disable-dev-shm-usage" // This helps with memory issues in Docker, since /dev/shm is often too small and causes crashes
                ]
            });

            const page = await browser.newPage();

            // Log failed image loads
            page.on('requestfailed', (request: any) => {
                if (request.resourceType() === 'image') {
                    console.error(`Image failed to load: ${request.url()}`);
                }
            });

            //console.log("Bearer token: " + requestOptions.bearerToken);

            // Intercept requests to add Authorization header
            if (requestOptions.bearerToken) {
                await page.setRequestInterception(true);
                page.on("request", (request: any) => {
                    const headers = {
                        ...request.headers(),
                        Authorization: `Bearer ${requestOptions.bearerToken}`
                    };
                    request.continue({ headers });
                });
            }

            if(isInsideDocker){
                // print if
            }

            await page.setContent(html, { waitUntil: 'domcontentloaded' });

            // Warten, bis alle Bilder geladen oder fehlgeschlagen sind
            await page.evaluate(() => {
                return Promise.all(Array.from(document.images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.addEventListener('load', resolve);
                        img.addEventListener('error', resolve); // auch Fehler beenden Warten
                    });
                }));
            });

            const pdfUint8Array = await page.pdf(options);
            return Buffer.from(pdfUint8Array);
        } catch (error) {
            console.error("Error generating PDF:", error);
            throw new Error("Failed to generate PDF");
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
