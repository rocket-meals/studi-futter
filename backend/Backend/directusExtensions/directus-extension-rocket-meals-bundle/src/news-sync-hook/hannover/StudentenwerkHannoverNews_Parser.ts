//import axios from "axios";
import {load as cheerioLoad, CheerioAPI} from 'cheerio';
import type { Element as CheerioElement } from 'domhandler';
import { TranslationHelper } from "../../helpers/TranslationHelper";
import { NewsParserInterface, NewsTypeForParser } from "./../NewsParserInterface";
import * as https from "node:https";
import undici, {Agent} from 'undici';

const agent = new Agent({ maxHeaderSize: 32 * 1024 });

export class StudentenwerkHannoverNews_Parser implements NewsParserInterface {

    static baseUrl = 'https://www.studentenwerk-hannover.de';
    static newsUrl = `${StudentenwerkHannoverNews_Parser.baseUrl}/unternehmen/news`;
    static newsDetailArticleUrlStart = "/unternehmen/news";

    constructor() { }

    async getNewsItems(limitAmountNews?: number): Promise<NewsTypeForParser[]> {
        let realNewsItems = await this.getRealNewsItems(limitAmountNews);
        return [...realNewsItems];
    }

    async getRealNewsItems(limitAmountNews?: number): Promise<NewsTypeForParser[]> {
        try {
            let response = await this.fetchNewsPage();
            return StudentenwerkHannoverNews_Parser.parseNewsItems(response, limitAmountNews);
        } catch (error: any) {
            console.error("Error fetching or parsing news page:", error);
            throw new Error(`Failed to fetch or parse news page: ${error.toString()}`);
        }
    }

    async fetchNewsPage() {
        const { statusCode, body } = await undici.request(StudentenwerkHannoverNews_Parser.newsUrl, {
            dispatcher: agent
        });

        if (statusCode < 200 || statusCode >= 300) {
            throw new Error(`Failed to fetch news page. HTTP status ${statusCode} - Error: ${body.toString()}`);
        }

        const text = await body.text();
        return text;

        /**
        return axios.get(StudentenwerkHannoverNews_Parser.newsUrl).then(response => {
            return response.data; // gibt den HTML-Inhalt zurück
        });
            */
    }

    static async fetchArticlePage(articleUrl: string) {
        const { statusCode, body } = await undici.request(articleUrl, {
            dispatcher: agent
        });

        if (statusCode < 200 || statusCode >= 300) {
            throw new Error(`Failed to fetch article page. HTTP status ${statusCode} - Error: ${body.toString()}`);
        }

        return await body.text(); // gibt den HTML-Inhalt zurück

        // Axios nutzt intern den Node.js HTTP-Parser. Dieser hat eine harte Begrenzung bei ca. 8192 Bytes (8 KB) für Response-Header. Diese Grenze lässt sich im aktuellen Node.js nicht direkt erhöhen für axios.
        // return axios.get(articleUrl).then(response => response.data);
    }

    static async parseNewsItems(html: string, limitAmountNews?: number): Promise<NewsTypeForParser[]> {
        const $newsIndexArticle = cheerioLoad(html);

        let data: NewsTypeForParser[] = [];
        let articleItems = $newsIndexArticle('div.article');
        let limit = limitAmountNews ? Math.min(limitAmountNews, articleItems.length) : articleItems.length;

        for (let index = 0; index < articleItems.length && index < limit; index++) {
            let element: CheerioElement | undefined = articleItems[index];

            let imageUrl = StudentenwerkHannoverNews_Parser.extractImageUrl($newsIndexArticle, element);
            let header = $newsIndexArticle(element).find('h3').text().trim();
            let content = $newsIndexArticle(element).find('div.news_slider-content_teaser').text().trim();
            let articleUrl = StudentenwerkHannoverNews_Parser.extractArticleUrl($newsIndexArticle, element);

            let date = await StudentenwerkHannoverNews_Parser.fetchArticleDate(articleUrl);

            let categories = StudentenwerkHannoverNews_Parser.extractCategories($newsIndexArticle, element);

            data.push({
                basicNews: {
                    external_identifier: "news_" + header.replace(/\W+/g, '_'),
                    image_remote_url: imageUrl,
                    alias: header,
                    date: date,
                    url: articleUrl,
                    categories: categories
                },
                translations: {
                    [TranslationHelper.LANGUAGE_CODE_DE]: {
                        title: header,
                        content: content,
                        be_source_for_translations: true,
                        let_be_translated: false,
                    },
                },
            });
        }

        data.reverse(); // latest news are on top
        return data;
    }

    static extractImageUrl($: CheerioAPI, element: CheerioElement | undefined): string {
        let imageStyle = $(element).find('div.news-slider-image').attr('style');
        let imageUrlMatch = imageStyle ? imageStyle.match(/url\(['"]?(.*?)['"]?\)/) : null;
        return imageUrlMatch ? StudentenwerkHannoverNews_Parser.baseUrl + imageUrlMatch[1] : '';
    }

    static extractArticleUrl($: CheerioAPI, element: CheerioElement | undefined): string | undefined {
        let articleUrl = $(element).find('a.articleLink').attr('href');
        if (articleUrl && articleUrl.startsWith(StudentenwerkHannoverNews_Parser.newsDetailArticleUrlStart)) {
            return StudentenwerkHannoverNews_Parser.baseUrl + articleUrl;
        }
        return undefined;
    }

    static async fetchArticleDate(articleUrl?: string): Promise<string | null> {
        if (!articleUrl) return null;
        try {
            let articleResponse = await this.fetchArticlePage(articleUrl);
            const $articleDetails = cheerioLoad(articleResponse);

            // .news-list-date > time:nth-child(2)
            let datePublishedText = $articleDetails(".news-list-date").text().trim();

            let dateParts = datePublishedText.split('.');
            // @ts-ignore if dateParts is not valid, the Date constructor will throw an error
            let dateAsDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
            dateAsDate.setHours(12, 0, 0, 0);
            return dateAsDate.toISOString();
        } catch (error) {
            console.log("Error fetching article page: " + articleUrl);
            return null;
        }
    }

    static extractCategories($: CheerioAPI, element: CheerioElement | undefined): { [key: string]: string } {
        let categories: { [key: string]: string } = {};
        $(element).find('div.news_slider-content_categorie').each((index, el) => {
            let categoryName = $(el).text().trim();
            if (categoryName) {
                categories[categoryName] = categoryName;
            }
        });
        return categories;
    }
}
