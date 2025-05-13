import {FormAnswers} from "../databaseTypes/types";

// Define the extracted value_ keys
export const FIELD_VALUE_KEY_PREFIX = "value_";
export type KeyOfFormAnswersValueFieldsType = Extract<keyof FormAnswers, `${typeof FIELD_VALUE_KEY_PREFIX}${string}`>;

// Ensure FIELD_VALUE_KEY contains all necessary mappings
export const FormAnswersValueFieldKeys: Record<KeyOfFormAnswersValueFieldsType, KeyOfFormAnswersValueFieldsType> = {
    value_string: "value_string",
    value_number: "value_number",
    value_date: "value_date",
    value_boolean: "value_boolean",
    value_custom: "value_custom",
    value_files: "value_files",
    value_image: "value_image",
}

export enum FormSubmissionState {
    DRAFT = "draft", // Noch nicht eingereicht
    SUBMITTED = "submitted", // Eingereicht und System soll verarbeiten
    SYNCING = "syncing", // In Bearbeitung von dem System
    CLOSED = "closed", // Eingereicht und System hat verarbeitet
    FAILED = "failed", // Eingereicht und System hat nicht verarbeitet
}

export type FormImportSyncFormAnswer = Partial<FormAnswers> & {external_import_id: string}
export type FormImportSyncFormAnswers = FormImportSyncFormAnswer[]

export type FormImportSyncFormSubmissions = {
    internal_custom_id: string,
    alias?: string | null,
    form_answers: FormImportSyncFormAnswers
}