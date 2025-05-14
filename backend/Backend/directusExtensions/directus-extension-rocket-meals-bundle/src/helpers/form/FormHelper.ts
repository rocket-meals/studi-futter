import {
    FormExtractFormAnswer, FormExtractFormAnswerValueFileSingle, FormExtractFormAnswerValueFileSingleOrString,
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
import {DirectusFiles} from "../../databaseTypes/types";

type FormFieldExampleData = {
    value_string?: string | null,
    value_number?: number | null,
    value_boolean?: boolean | null,
    value_date?: string | null,
    value_image?: DirectusFiles | string | null,
    value_files?: FormExtractFormAnswerValueFileSingleOrString[] | null,
    value_custom?: string | null,
}

export class FormHelper {

    public static getExampleFormExtractRelevantInformation(): FormExtractRelevantInformation {
        let formExtractRelevantInformation: FormExtractRelevantInformation = [];
        let form_submission_id = Math.random().toString();

        let index = 0;
        formExtractRelevantInformation.push(this.addFormField("Text Field", {value_string: "This is a long text example"}, form_submission_id, index++));
        formExtractRelevantInformation.push(this.addFormField("Text Field 2", {value_string: "This is a long text example"}, form_submission_id, index++));
        formExtractRelevantInformation.push(this.addFormField("Number Field", {value_number: 123}, form_submission_id, index++));
        formExtractRelevantInformation.push(this.addFormField("Boolean Field", {value_boolean: true}, form_submission_id, index++));
        formExtractRelevantInformation.push(this.addFormField("Date Field", {value_date: "2021-09-01T00:00:00.000Z"}, form_submission_id, index++));

        let sizes = [200, 400, 800, 1600];
        let images: string[] = [];
        for (let i = 0; i < sizes.length; i++) {
            let size = sizes[i];
            let imageUrl = `https://picsum.photos/${size}/${size}`;
            images.push(imageUrl);
        }

        formExtractRelevantInformation.push(this.addFormField("Image Field", {value_image: images[0]}, form_submission_id, index++));
        formExtractRelevantInformation.push(this.addFormField("Files Field", {value_files: images}, form_submission_id, index++));

        return formExtractRelevantInformation;
    }

    private static addFormField(alias: string, data: FormFieldExampleData, form_submission_id: string, index: number): FormExtractRelevantInformationSingle{
        let form_field = this.getExampleFormField(alias);
        return {
            form_field_id: form_field.id,
            sort: index,
            form_field: form_field,
            form_answer: this.getExampleFormExtractFormAnswer(form_field.id, form_submission_id, data)
        }
    }

    private static getExampleFormField(alias: string){
        return {
            alias: alias,
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
            id: Math.random().toString()+alias,
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

    //"2021-09-01T00:00:00.000Z",

    private static getExampleFormExtractFormAnswer(form_field_id: string, form_submission_id: string, data: {
        value_string?: string | null,
        value_number?: number | null,
        value_boolean?: boolean | null,
        value_date?: string | null,
        value_image?: DirectusFiles | string | null,
        value_files?: FormExtractFormAnswerValueFileSingleOrString[] | null,
        value_custom?: string | null,
    }): FormExtractFormAnswer {

        let value_files: FormExtractFormAnswerValueFileSingleOrString[] = [];
        if(data.value_files){
            value_files = data.value_files as FormExtractFormAnswerValueFileSingleOrString[];
        };
        let value_image = null;
        if(data.value_image){
            value_image = data.value_image as DirectusFiles;
        };

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
            value_boolean: data.value_boolean || null,
            value_custom: data.value_custom || null,
            value_date: data.value_date || null,
            value_files: value_files || null,
            value_image: value_image || null,
            value_number: data.value_number || null,
            value_string: data.value_string || null,
            values: ""
        }
    }

    private static generateMarkdownForTypeStringValue(value: string | null | undefined): string {
        let markdownContent = "";
        if(value){
            markdownContent += `${value}`;
            markdownContent += MarkdownHelper.getMarkdownNewLine()
        }
        return markdownContent;
    }

    private static generateMarkdownForTypeNumberValue(value: number | null | undefined): string {
        let markdownContent = "";
        if(value){
            markdownContent += `${value}`;
            markdownContent += MarkdownHelper.getMarkdownNewLine()
        }
        return markdownContent;
    }

    private static generateMarkdownForTypeBooleanValue(value: boolean | null | undefined): string {
        let markdownContent = "";
        if(value===true || value===false){
            let booleanValueString = value ? TranslationsBackend.getTranslation(TranslationBackendKeys.FORM_VALUE_BOOLEAN_TRUE) : TranslationsBackend.getTranslation(TranslationBackendKeys.FORM_VALUE_BOOLEAN_FALSE);
            markdownContent += `${booleanValueString}`;
            markdownContent += MarkdownHelper.getMarkdownNewLine()
        }
        return markdownContent;
    }

    private static generateMarkdownForTypeDateValue(value: string | null | undefined): string {
        let markdownContent = "";
        if(value){
            let dateString = DateHelper.formatDateToTimeZoneReadable(new Date(value), EnvVariableHelper.getTimeZoneString());
            markdownContent += `${dateString}`;
            markdownContent += MarkdownHelper.getMarkdownNewLine()
        }
        return markdownContent;
    }

    private static generateMarkdownForTypeImageUrl(fieldName: string, imageUrl: string | undefined): string {
        let markdownContent = "";
        if(imageUrl){
            markdownContent += `![${fieldName}](${imageUrl})`;
            markdownContent += MarkdownHelper.getMarkdownNewLine()
        }
        return markdownContent;
    }

    private static generateMarkdownForTypeImageValue(fieldName: string, value_image: DirectusFiles | string | null | undefined, myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): string {
        let assetUrl: undefined | string = undefined;
        if(value_image) {
            if (typeof value_image === "string" && value_image.startsWith("http")) {
                assetUrl = value_image;
            } else {
                assetUrl = DirectusFilesAssetHelper.getDirectAssetUrlByObjectOrId(value_image, myDatabaseHelperInterface);
            }
        }
        return this.generateMarkdownForTypeImageUrl(fieldName, assetUrl);
    }

    private static generateMarkdownForTypeFilesValue(fieldName: string, value_file: FormExtractFormAnswerValueFileSingleOrString | null | undefined, myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): string {
        let assetUrl: undefined | string = undefined;
        //console.log("generateMarkdownForTypeFilesValue");
        //console.log(JSON.stringify(value_file, null, 2));
        if(value_file) {
            if (typeof value_file === "string" && value_file.startsWith("http")) {
                assetUrl = value_file;
            } else {
                let valueFileAsObject: FormExtractFormAnswerValueFileSingle = value_file as FormExtractFormAnswerValueFileSingle;
                assetUrl = DirectusFilesAssetHelper.getDirectAssetUrlByObjectOrId(valueFileAsObject.directus_files_id, myDatabaseHelperInterface);
            }
        }

        //console.log("assetUrl", assetUrl);
        return this.generateMarkdownForTypeImageUrl(fieldName, assetUrl);
    }

    public static async generateMarkdownContentFromForm(formExtractRelevantInformation: FormExtractRelevantInformationSingle[], myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): Promise<string> {
        let markdownContent = "";

        markdownContent += ``;

        let markdownNewLine = MarkdownHelper.getMarkdownNewLine();

        //console.log("generateMarkdownContentFromForm");
        //console.log(JSON.stringify(formExtractRelevantInformation, null, 2));
        //console.log("---")

        // export type FormExtractRelevantInformationSingle = {form_field_id: string, sort: number | null | undefined, form_field: FormFields, form_answer: FormAnswers }
        for(let formExtractRelevantInformationSingle of formExtractRelevantInformation) {
            let fieldName = formExtractRelevantInformationSingle.form_field.alias || formExtractRelevantInformationSingle.form_field.id
            markdownContent += `### ${fieldName}`;
            markdownContent += markdownNewLine

            markdownContent += this.generateMarkdownForTypeStringValue(formExtractRelevantInformationSingle.form_answer.value_string);
            markdownContent += this.generateMarkdownForTypeNumberValue(formExtractRelevantInformationSingle.form_answer.value_number);
            markdownContent += this.generateMarkdownForTypeBooleanValue(formExtractRelevantInformationSingle.form_answer.value_boolean);
            markdownContent += this.generateMarkdownForTypeDateValue(formExtractRelevantInformationSingle.form_answer.value_date);
            markdownContent += this.generateMarkdownForTypeImageValue(fieldName, formExtractRelevantInformationSingle.form_answer.value_image, myDatabaseHelperInterface);
            for (let formAnswerValueFile of formExtractRelevantInformationSingle.form_answer.value_files || []) {
                markdownContent += this.generateMarkdownForTypeFilesValue(fieldName, formAnswerValueFile, myDatabaseHelperInterface);
            }
        }

        // add a line break at the end
        markdownContent += `-----------------`+markdownNewLine

        // add a generated at date
        let generatedAtDateString = DateHelper.formatDateToTimeZoneReadable(new Date(), DateHelperTimezone.GERMANY);
        markdownContent += `Generiert am ${generatedAtDateString}`;
        markdownContent += markdownNewLine

        let hashValue = HashHelper.getHashFromObject(formExtractRelevantInformation);
        markdownContent += `Hash: ${hashValue}`;
        markdownContent += markdownNewLine

        return markdownContent;
    }

    public static async generatePdfFromHtml(html: string, myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): Promise<Buffer> {
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

    public static async generateHtmlFromForm(formExtractRelevantInformation: FormExtractRelevantInformation, myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): Promise<string> {
        let markdownContent = await this.generateMarkdownContentFromForm(formExtractRelevantInformation, myDatabaseHelperInterface);
        let template = DEFAULT_HTML_TEMPLATE;
        let html = await HtmlGenerator.generateHtml(BaseGermanMarkdownTemplateHelper.getTemplateDataForMarkdownContent(markdownContent), myDatabaseHelperInterface, template);

        return html;
    }

    public static async generatePdfFromForm(formExtractRelevantInformation: FormExtractRelevantInformation, myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): Promise<Buffer> {
        let html = await this.generateHtmlFromForm(formExtractRelevantInformation, myDatabaseHelperInterface);
        let pdfBuffer = await this.generatePdfFromHtml(html, myDatabaseHelperInterface);
        return pdfBuffer;
    }
}
