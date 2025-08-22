import { DeepLTranslator } from './DeepLTranslator';
import { MyTranslatorInterface } from './MyTranslatorInterface';
import { TranslatorSettings } from './TranslatorSettings';
import { EnvVariableHelper } from '../helpers/EnvVariableHelper';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';

export class Translator {
  private logger: any;
  translatorSettings: TranslatorSettings;
  private translatorImplementation: undefined | MyTranslatorInterface;

  constructor(translatorSettings: TranslatorSettings, myDatabaseHelper: MyDatabaseHelper) {
    this.logger = myDatabaseHelper?.apiContext?.logger;
    this.translatorSettings = translatorSettings;
  }

  async init() {
    //console.log("Initializing Translator");
    let auth_key = await this.getAuthKey();
    if (!auth_key) {
      const message = 'Auth Key not set! Please set the key in .env file: ' + EnvVariableHelper.getEnvFieldNameForAutoTranslateApiKey();
      await this.setSettings(this.getSettingsAuthKeyErrorObject(message));
      return;
    }
    try {
      //console.log("Auth Key found");
      await this.reloadAuthKey(auth_key);
      let correctObj = await this.getSettingsAuthKeyCorrectObject();
      await this.setSettings(correctObj);
    } catch (error: any) {
      console.log('Error Initializing Translatior');
      console.log(error.toString());
      await this.setSettings(this.getSettingsAuthKeyErrorObject(error));
    }
  }

  async translate(text: string, source_language: string, destination_language: string) {
    if (!this.translatorImplementation) return null;
    const translation = await this.translatorImplementation.translate(text, source_language, destination_language);
    await this.reloadUsage(); //update usage stats
    return translation;
  }

  async getSettingsAuthKeyCorrectObject() {
    const usage = await this.getUsage();
    const extra = await this.getExtra();
    return {
      valid_auth_key: true,
      informations: 'Auth Key is valid!',
      ...usage,
      ...extra,
    };
  }

  getSettingsAuthKeyErrorObject(error: any) {
    return {
      auth_key: null,
      valid_auth_key: false,
      informations: 'Auth Key not valid!\n' + error.toString(),
    };
  }

  /** Private Methods */

  async reloadAuthKey(auth_key: string) {
    //console.log("Reload AuthKey");
    this.translatorImplementation = new DeepLTranslator(auth_key);
    await this.translatorImplementation.init();
    await this.reloadUsage();
  }

  async reloadUsage() {
    //console.log("Reload Usage");
    const usage = await this.getUsage();
    const used = usage.used || 0;
    const limit = usage.limit || 0;
    let percentage = 0;
    if (limit > 0) {
      percentage = Math.round((used / limit) * 100);
    }
    await this.setSettings({ percentage: percentage, ...usage });
  }

  async getUsage() {
    if (!this.translatorImplementation) return { used: 0, limit: 0 };
    return await this.translatorImplementation.getUsage();
  }

  async getExtra() {
    if (!this.translatorImplementation) return { extra: '' };
    return await this.translatorImplementation.getExtra();
  }

  async setSettings(newSettings: any) {
    await this.translatorSettings.setSettings(newSettings);
  }

  async getAuthKey() {
    return await this.translatorSettings.getAuthKey();
  }
}
