import axios from "axios";
import {load as cheerioLoad, CheerioAPI} from 'cheerio';
import type { Element as CheerioElement } from 'domhandler';
import { TranslationHelper } from "../../helpers/TranslationHelper";
import { NewsParserInterface, NewsTypeForParser } from "./../NewsParserInterface";

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
            return StudentenwerkHannoverNews_Parser.parseNewsItems(response.data, limitAmountNews);
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async fetchNewsPage() {
        return axios.get(StudentenwerkHannoverNews_Parser.newsUrl);
    }

    static async fetchArticlePage(articleUrl: string) {
        return axios.get(articleUrl);
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
            const $articleDetails = cheerioLoad(articleResponse.data);

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
