import {AutoTranslationSettings} from "../../databaseTypes/types";
import {ApiContext} from "../ApiContext";
import {ItemsServiceCreator} from "../ItemsServiceCreator";
import {EventContext} from "@directus/extensions/node_modules/@directus/types/dist/events";
import {CollectionNames} from "../CollectionNames";

export class AutoTranslationSettingsHelper {

    private apiExtensionContext: ApiContext;
    private eventContext: EventContext | undefined;

    constructor(apiExtensionContext: ApiContext, eventContext?: EventContext) {
        this.apiExtensionContext = apiExtensionContext;
        this.eventContext = eventContext;
    }

    async setAutoTranslationSettings(appSettings: Partial<AutoTranslationSettings>) {
        const itemsServiceCreator = new ItemsServiceCreator(this.apiExtensionContext, this.eventContext);
        const itemsService = await itemsServiceCreator.getItemsService<AutoTranslationSettings>(CollectionNames.AUTO_TRANSLATION_SETTINGS);
        await itemsService.upsertSingleton(appSettings);
        /**
         * await this.database(TABLENAME_FLOWHOOKS).update({
         *             cashregisters_parsing_status: status
         *         });
         */
    }

    async getAppSettings(): Promise<Partial<AutoTranslationSettings> | undefined | null> {
        const itemsServiceCreator = new ItemsServiceCreator(this.apiExtensionContext, this.eventContext);
        const itemsService = await itemsServiceCreator.getItemsService<AutoTranslationSettings>(CollectionNames.AUTO_TRANSLATION_SETTINGS);
        return await itemsService.readSingleton({});
    }

}
