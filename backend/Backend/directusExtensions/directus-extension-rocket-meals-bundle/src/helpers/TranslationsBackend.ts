import {PrimaryKey} from "@directus/types";
import {Languages} from "../databaseTypes/types";
import {ApiContext} from "./ApiContext";
import {ItemsServiceCreator} from "./ItemsServiceCreator";
import {EventContext} from "@directus/extensions/node_modules/@directus/types/dist/events";
import {MyTimers} from "./MyTimer";


export class LanguageCodes {
    public static readonly _codes = {
        de: "de-DE" as const,
        en: "en-US" as const,
    };

    static readonly DE = LanguageCodes._codes.de;
    static readonly EN = LanguageCodes._codes.en;
}

export class TranslationsBackend {
    public static getTranslation(key: TranslationBackendKeys, language?: string): string {
        switch (key) {
            case TranslationBackendKeys.FORM_VALUE_BOOLEAN_TRUE:
                return "Ja"
            case TranslationBackendKeys.FORM_VALUE_BOOLEAN_FALSE:
                return "Nein"
        }
    }
}

export enum TranslationBackendKeys {
    FORM_VALUE_BOOLEAN_TRUE = "form_value_boolean_true",
    FORM_VALUE_BOOLEAN_FALSE = "form_value_boolean_false",
}