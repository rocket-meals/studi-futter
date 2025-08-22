import { EnvVariableHelper } from '../helpers/EnvVariableHelper';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { AutoTranslationSettingsHelper } from '../helpers/itemServiceHelpers/AutoTranslationSettingsHelper';

export class TranslatorSettings {
  private apiKey: undefined | string | null;
  private translationSettingsService: AutoTranslationSettingsHelper;
  private myDatabaseHelper: MyDatabaseHelper;

  constructor(myDatabaseHelper: MyDatabaseHelper) {
    this.myDatabaseHelper = myDatabaseHelper;
    this.apiKey = undefined; // To hold the API key in memory
    this.apiKey = EnvVariableHelper.getAutoTranslateApiKey();
    this.translationSettingsService = this.myDatabaseHelper.getAutoTranslationSettingsHelper();
  }

  async getSettings() {
    return await this.translationSettingsService.getAppSettings();
  }

  async isAutoTranslationEnabled() {
    let settings = await this.getSettings();
    return settings?.active;
  }

  async setSettings(newSettings: any) {
    await this.translationSettingsService.setAutoTranslationSettings(newSettings);
  }

  async getAuthKey() {
    return this.apiKey;
  }
}
