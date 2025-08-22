// small jest test
import { describe, expect, it } from '@jest/globals';
import { getTestHtmlForBaseGermanMarkdownContent } from '../../html/__tests__/TestHtmlTemplates';
import { TestArtifacts } from '../../TestArtifacts';
import { HtmlTemplatesEnum } from '../../html/HtmlGenerator';
import { PdfGeneratorForJest } from '../PdfGeneratorHelperForJest';
import { PdfGeneratorHelper } from '../PdfGeneratorHelper';

PdfGeneratorForJest.activateForJest(); // activate puppeteer for jest tests
describe('Pdf Generator Test', () => {
  it('Test pdf generation from html', async () => {
    let html = await getTestHtmlForBaseGermanMarkdownContent();
    let requestOptions = {
      mockImageResolution: true, // mock image resolution to avoid loading real images
    };
    let pdfBuffer = await PdfGeneratorHelper.generatePdfFromHtml(html, requestOptions);
    expect(pdfBuffer).toBeTruthy();
    let savePath = TestArtifacts.saveTestArtifact(pdfBuffer, 'pdf/' + HtmlTemplatesEnum.BASE_GERMAN_MARKDOWN_CONTENT + '.pdf');

    expect(true).toBeTruthy();
  });
});
