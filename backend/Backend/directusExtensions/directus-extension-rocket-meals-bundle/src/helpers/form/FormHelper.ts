import {
    FormExtractFormAnswer,
    FormExtractRelevantInformation,
    FormExtractRelevantInformationSingle
} from "../../forms-sync-hook";
import {
    BaseGermanMarkdownTemplateHelper,
    DEFAULT_HTML_TEMPLATE,
    HtmlGenerator,
    HtmlGeneratorOptions
} from "../html/HtmlGenerator";
import {PdfGeneratorHelper, PdfGeneratorOptions, RequestOptions} from "../pdf/PdfGeneratorHelper";
import {DirectusFilesAssetHelper} from "../DirectusFilesAssetHelper";
import {MarkdownHelper} from "../html/MarkdownHelper";
import {MyDatabaseTestableHelperInterface} from "../MyDatabaseHelperInterface";
import {TranslationBackendKeys, TranslationsBackend} from "../TranslationsBackend";
import {DateHelper, DateHelperTimezone} from "../DateHelper";
import {EnvVariableHelper} from "../EnvVariableHelper";
import {HashHelper} from "../HashHelper";

export class FormHelper {

    public static getExampleFormExtractRelevantInformation(): FormExtractRelevantInformation {
        let amount = 5;
        let formExtractRelevantInformation: FormExtractRelevantInformation = [];
        let form_submission_id = Math.random().toString();
        for(let i = 0; i < amount; i++){
            let form_field = this.getExampleFormField();
            formExtractRelevantInformation.push({
                form_field_id: form_field.id,
                sort: i,
                form_field: this.getExampleFormField(),
                form_answer: this.getExampleFormExtractFormAnswer(form_field.id, form_submission_id)
            });
        }
        return formExtractRelevantInformation;
    }

    private static getExampleFormField(){
        return {
            alias: "Field Test",
            background_color: "#FFFFFF",
            date_created: "2021-09-01T00:00:00.000Z",
            date_updated: "2021-09-01T00:00:00.000Z",
            export_settings: "",
            external_export_field_name: null,
            external_export_id: null,
            external_import_id: null,
            field_type: "string",
            form: "1",
            form_settings: "",
            icon: "",
            icon_expo: "",
            id: Math.random().toString(),
            image: null,
            image_remote_url: null,
            image_thumb_hash: null,
            import_settings: "",
            internal_custom_id: null,
            is_disabled: false,
            is_required: false,
            is_visible_in_export: true,
            is_visible_in_form: true,
            sort: 0,
            status: "published",
            translations: [],
            user_created: "1",
            user_updated: "1",
            value_prefix: null,
            value_suffix: null
        }
    }

    private static getExampleFormExtractFormAnswer(form_field_id: string, form_submission_id: string): FormExtractFormAnswer {
        return {
            date_created: "2021-09-01T00:00:00.000Z",
            date_updated: "2021-09-01T00:00:00.000Z",
            form_field: form_field_id,
            form_submission: form_submission_id,
            id: Math.random().toString(),
            sort: 0,
            status: "published",
            user_created: "1",
            user_updated: "1",
            value_boolean: true,
            value_custom: null,
            value_date: "2021-09-01T00:00:00.000Z",
            value_files: [],
            value_image: null,
            value_number: 1,
            value_string: "Test",
            values: ""
        }
    }

    public static async generateMarkdownContentFromForm(formExtractRelevantInformation: FormExtractRelevantInformationSingle[], myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): Promise<string> {
        let markdownContent = "";

        //console.log("generateMarkdownContentFromForm start")

        //console.log("formExtractRelevantInformation")
        //console.log(JSON.stringify(formExtractRelevantInformation, null, 2))

        markdownContent += ``;

        // export type FormExtractRelevantInformationSingle = {form_field_id: string, sort: number | null | undefined, form_field: FormFields, form_answer: FormAnswers }
        for(let formExtractRelevantInformationSingle of formExtractRelevantInformation){
            let fieldName = formExtractRelevantInformationSingle.form_field.alias || formExtractRelevantInformationSingle.form_field.id
            markdownContent += `### ${fieldName}\n`;
            let value = formExtractRelevantInformationSingle.form_answer.value_string ||
                formExtractRelevantInformationSingle.form_answer.value_number ||
                formExtractRelevantInformationSingle.form_answer.value_date
                //formExtractRelevantInformationSingle.form_answer.value_boolean;
            if(value){
                markdownContent += `${value}\n`;
            }

            let date_value = formExtractRelevantInformationSingle.form_answer.value_date;
            if(date_value){
                let dateString = DateHelper.formatDDMMYYYY_HHMMSSToDateWithTimeZone(date_value, EnvVariableHelper.getTimeZoneString());
                markdownContent += `${dateString}\n`;
            }

            let boolean_value = formExtractRelevantInformationSingle.form_answer.value_boolean;
            if(boolean_value===true || boolean_value===false){
                let booleanValueString = boolean_value ? TranslationsBackend.getTranslation(TranslationBackendKeys.FORM_VALUE_BOOLEAN_TRUE) : TranslationsBackend.getTranslation(TranslationBackendKeys.FORM_VALUE_BOOLEAN_FALSE);
                markdownContent += `${booleanValueString}\n`;
            }

            let formAnswerValueImage = formExtractRelevantInformationSingle.form_answer.value_image;
            if(formAnswerValueImage){
                let imageUrl = DirectusFilesAssetHelper.getDirectAssetUrl(formAnswerValueImage, myDatabaseHelperInterface);
                markdownContent += `![${fieldName}](${imageUrl})`;
                markdownContent += `
                `
                //markdownContent += `imageUrl: ${imageUrl}`;
            }

            let formAnswerValueFiles = formExtractRelevantInformationSingle.form_answer.value_files;
            if(formAnswerValueFiles){
                for(let formAnswerValueFile of formAnswerValueFiles){
                    // access the resource without authentication, by using the internal asset URL, since we are at the backend
                    let imageUrl = DirectusFilesAssetHelper.getDirectAssetUrl(formAnswerValueFile, myDatabaseHelperInterface);
                    markdownContent += `![${fieldName}](${imageUrl})`;
                    markdownContent += `
                    `
                    markdownContent += `imageUrl: ${imageUrl}`;
                }
            }

        }

        //console.log("generateMarkdownContentFromForm end")
        //console.log("markdownContent")
        //console.log(markdownContent)

        // add a line break at the end
        markdownContent += `
        -----------------
        `;

        // add a generated at date
        let generatedAtDate = new Date();
        let generatedAtDateString = DateHelper.formatDDMMYYYY_HHMMSSToDateWithTimeZone(generatedAtDate.toString(), EnvVariableHelper.getTimeZoneString());
        markdownContent += `Generiert am ${generatedAtDateString}\n`;

        let hashValue = HashHelper.getHashFromObject(formExtractRelevantInformation);
        markdownContent += `Hash: ${hashValue}\n`;

        return markdownContent;
    }

    public static async generatePdfFromForm(formExtractRelevantInformation: FormExtractRelevantInformation, myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): Promise<Buffer> {
        let markdownContent = await this.generateMarkdownContentFromForm(formExtractRelevantInformation, myDatabaseHelperInterface);
        let template = DEFAULT_HTML_TEMPLATE;
        let html = await HtmlGenerator.generateHtml(BaseGermanMarkdownTemplateHelper.getTemplateDataForMarkdownContent(markdownContent), myDatabaseHelperInterface, template);

        let requestOptions: RequestOptions = {
            bearerToken: null
        }

        let adminBearerToken = await myDatabaseHelperInterface.getAdminBearerToken();
        if(adminBearerToken){
            requestOptions.bearerToken = adminBearerToken;
        }


        let pdfBuffer = PdfGeneratorHelper.generatePdfFromHtml(html, requestOptions);
        return pdfBuffer;
    }
}
