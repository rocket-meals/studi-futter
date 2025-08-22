// small jest test
import { describe, expect, it } from '@jest/globals';
import { BaseGermanMarkdownTemplateHelper, HTML_TEMPLATE_FILE_ENDING, HtmlGenerator, HtmlTemplatesEnum } from '../HtmlGenerator';
import path from 'path';
import fse from 'fs-extra';
import { TestArtifacts } from '../../TestArtifacts';
import { MarkdownHelper } from '../MarkdownHelper';
import { MyDatabaseTestableHelper } from '../../MyDatabaseHelperInterface';

export async function getTestHtmlForBaseGermanMarkdownContent() {
  let exampleMarkdown = MarkdownHelper.EXAMPLE_MARKDOWN;
  let myDatabaseTestableHelperInterface = new MyDatabaseTestableHelper();

  let html = await HtmlGenerator.generateHtml(
    {
      ...BaseGermanMarkdownTemplateHelper.getTemplateDataForMarkdownContent(exampleMarkdown),
    },
    myDatabaseTestableHelperInterface,
    HtmlTemplatesEnum.BASE_GERMAN_MARKDOWN_CONTENT
  );
  return html;
}

describe('Html Template Test', () => {
  it('Test if all enum templates exist', async () => {
    let emailTemplateNamesWithoutEnding = Object.values(HtmlTemplatesEnum);

    for (let templateName of emailTemplateNamesWithoutEnding) {
      const rootPathHtmlTemplates = HtmlGenerator.getPathToHtmlTemplates();
      const systemTemplatePath = path.join(rootPathHtmlTemplates, templateName + HTML_TEMPLATE_FILE_ENDING);
      expect(path).toBeTruthy();
      let exists = await fse.pathExists(systemTemplatePath);
      expect(exists).toBeTruthy();
    }
  });

  it('Test html generation of default template', async () => {
    let html = await getTestHtmlForBaseGermanMarkdownContent();
    let savePath = TestArtifacts.saveTestArtifact(html, 'html/' + HtmlTemplatesEnum.BASE_GERMAN_MARKDOWN_CONTENT + '.html');
    expect(html).toBeTruthy();
  });
});
