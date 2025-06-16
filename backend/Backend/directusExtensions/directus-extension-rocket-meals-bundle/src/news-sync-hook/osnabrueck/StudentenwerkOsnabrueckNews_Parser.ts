import axios from "axios";
import { load as cheerioLoad } from 'cheerio';
import { TranslationHelper } from "../../helpers/TranslationHelper";
import { NewsParserInterface, NewsTypeForParser } from "./../NewsParserInterface";
import {WorkflowsRuns} from "../../databaseTypes/types";
import {WorkflowRunLogger} from "../../workflows-runs-hook/WorkflowRunJobInterface";

type ArticleDetails = {
    date?: Date | null;
}

export class StudentenwerkOsnabrueckNews_Parser implements NewsParserInterface {

    static baseUrl = 'https://www.studentenwerk-osnabrueck.de/';
    static newsUrl = `https://www.studentenwerk-osnabrueck.de/de/nachrichten.html`;
    static newsArticleUrl = "https://www.studentenwerk-osnabrueck.de//de/nachrichten/artikel-details";

    constructor() {}

    async getNewsItems(workflowRun?: WorkflowsRuns, logger?: WorkflowRunLogger): Promise<NewsTypeForParser[]> {
        let realNewsItems = await this.getRealNewsItems();
        return [...realNewsItems];
    }

    async getRealNewsItems(): Promise<NewsTypeForParser[]> {
        try {
            let response = await axios.get(StudentenwerkOsnabrueckNews_Parser.newsUrl);
            let $ = cheerioLoad(response.data); // Load the HTML into cheerio
            let articles = $('div.article');

            let news: NewsTypeForParser[] = [];

            for (let i = 0; i < articles.length; i++) {
                let article = articles[i];
                let imageElement = $(article).find('img');
                let imageUrl = imageElement.length ? StudentenwerkOsnabrueckNews_Parser.baseUrl + imageElement.attr('src') : '';

                let linkElement = $(article).find('a');
                let articleUrl = linkElement.length ? StudentenwerkOsnabrueckNews_Parser.baseUrl + linkElement.attr('href') : '';

                let articleDetails = await this.getArticleDetails(articleUrl);

                let headerElement = $(article).find('span');
                let header = headerElement.length ? headerElement.text().trim() : '';

                let contentElement = $(article).find('div.teaser-text').find('div');
                let content = contentElement.length ? contentElement.text().trim() : '';

                // Process the content
                content = content.replace(/Weiterlesen$/, '').trim();
                content = content.replace(/\n$/, '').trim();
                content = content.replace(/\t$/, '').trim();
                content = content.replace(/&nbsp;/g, ' ').trim();

                news.push({
                    basicNews: {
                        external_identifier: "news_" + header.replace(/\W+/g, '_'),
                        image_remote_url: imageUrl,
                        alias: header,
                        date: articleDetails?.date ? articleDetails.date.toISOString() : null,
                        url: articleUrl,
                        categories: {} // Assuming no category data; fill in as needed
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

            news.reverse(); // latest news are on top

            return news;
        } catch (error) {
            console.log(error);
        }

        return [];
    }



    async getArticleDetails(articleUrl: string): Promise<ArticleDetails> {
        let articleDetails: ArticleDetails = {};
        //console.log("Fetching article details: " + articleUrl);
        try {
            let response = await axios.get(articleUrl);

            let $ = cheerioLoad(response.data); // Load the HTML into cheerio

            // <div class="datum">
            // 				08.08.24
            // 			</div>

            let dateElement = $('div.datum');
            let dateString = dateElement.length ? dateElement.text().trim() : null;
            if(!!dateString){
                let dateParts = dateString.split('.');
                if(dateParts.length === 3){
                    let day = parseInt(dateParts[0]+"");
                    let month = parseInt(dateParts[1]+"");
                    let yearSingle = parseInt(dateParts[2]+"");
                    let year: number | undefined = undefined
                    if(yearSingle < 100){
                        let currentYearWithCentury = new Date().getFullYear();
                        let currentYear = parseInt((""+currentYearWithCentury).substring(0, 2));
                        year = parseInt((currentYear + "" + yearSingle));
                    } else {
                        year = yearSingle;
                    }

                    if(!!year){
                        // create date with 12:00:00 time to avoid timezone issues
                        articleDetails.date = new Date(year, month - 1, day, 12, 0, 0);
                    }
                }
            }


        } catch (error) {
            console.log("Error while fetching article details: " + articleUrl);
            console.log(error);
        }

        return articleDetails
    }
}
