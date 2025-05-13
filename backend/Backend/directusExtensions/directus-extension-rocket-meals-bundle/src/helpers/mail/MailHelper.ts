import {Mails} from "../../databaseTypes/types";
import {BaseGermanMarkdownTemplateHelper, HtmlGenerator, HtmlGeneratorOptions} from "../html/HtmlGenerator";
import {MyDatabaseHelperInterface, MyDatabaseTestableHelperInterface} from "../MyDatabaseHelperInterface";

export class MailHelper {

    public static async renderMailToHtml(mail: Partial<Mails>, myDatabaseHelperInterface: MyDatabaseTestableHelperInterface): Promise<any> {
        let variables = MailHelper.getHtmlTemplateDataFromMail(mail);
        let template = HtmlGenerator.getHtmlTemplate(mail.template_name);
        return await HtmlGenerator.generateHtml(variables, myDatabaseHelperInterface, template);
    }

    public static getHtmlTemplateDataFromMail(mail: Partial<Mails>): {[key: string]: any} & {mailContentFieldRenderedAsHtml?: string} {
        let data: {[key: string]: any} & {
            mailContentFieldRenderedAsHtml?: string,
            downloadLinks?: string[]
        } = {};
        if(mail.template_data){
            data = {
                ...data,
                ...mail.template_data,
            }
        }
        if(mail.markdown_content){
            data = {
                ...data,
                ...BaseGermanMarkdownTemplateHelper.getTemplateDataForMarkdownContent(mail.markdown_content),
            }
        }

        return data;
    }

}
