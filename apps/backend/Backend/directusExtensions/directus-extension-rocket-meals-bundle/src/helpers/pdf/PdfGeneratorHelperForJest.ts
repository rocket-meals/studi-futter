import puppeteer from 'puppeteer';
import { PdfGeneratorHelper } from './PdfGeneratorHelper';
import { PuppeteerGenerator } from './PuppeteerGenerator';

export class PdfGeneratorForJest extends PdfGeneratorHelper {
  public static activateForJest() {
    PuppeteerGenerator.PuppeteerForJest = puppeteer; // set puppeteer for jest tests
  }
}
