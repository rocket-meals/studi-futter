import { DatabaseTypes } from 'repo-depkit-common';
import { ApiContext } from '../ApiContext';
import { ItemsServiceCreator } from '../ItemsServiceCreator';
import { EventContext } from '@directus/types';
import { CollectionNames } from 'repo-depkit-common';

export class AutoTranslationSettingsHelper {
  private apiExtensionContext: ApiContext;
  private eventContext: EventContext | undefined;

  constructor(apiExtensionContext: ApiContext, eventContext?: EventContext) {
    this.apiExtensionContext = apiExtensionContext;
    this.eventContext = eventContext;
  }

  async setAutoTranslationSettings(appSettings: Partial<DatabaseTypes.AutoTranslationSettings>) {
    const itemsServiceCreator = new ItemsServiceCreator(this.apiExtensionContext, this.eventContext);
    const itemsService = await itemsServiceCreator.getItemsService<DatabaseTypes.AutoTranslationSettings>(CollectionNames.AUTO_TRANSLATION_SETTINGS);
    await itemsService.upsertSingleton(appSettings);
    /**
     * await this.database(TABLENAME_FLOWHOOKS).update({
     *             cashregisters_parsing_status: status
     *         });
     */
  }

  async getAppSettings(): Promise<Partial<DatabaseTypes.AutoTranslationSettings> | undefined | null> {
    const itemsServiceCreator = new ItemsServiceCreator(this.apiExtensionContext, this.eventContext);
    const itemsService = await itemsServiceCreator.getItemsService<DatabaseTypes.AutoTranslationSettings>(CollectionNames.AUTO_TRANSLATION_SETTINGS);
    return await itemsService.readSingleton({});
  }
}
