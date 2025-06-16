// small jest test
import {describe, expect, it} from '@jest/globals';
import {StudentenwerkHannoverNews_Parser} from "../StudentenwerkHannoverNews_Parser";
import path from "path";
import fs from "fs";

// load preloaded html file content from "./HannoverNews.html"
const htmlNews = fs.readFileSync(path.resolve(__dirname, './News.html'), 'utf8');
const htmlNewsUnterstuetzungBeimStart = fs.readFileSync(path.resolve(__dirname, './NewsUnterstuetzungBeimStart.html'), 'utf8');
const htmlNewsBafoegAntragLeichterGemacht = fs.readFileSync(path.resolve(__dirname, './NewsBafoegAntragLeichterGemacht.html'), 'utf8');

describe("NewsTestHannover", () => {
    let newsParser = new StudentenwerkHannoverNews_Parser();

    it("should find news with fields", async () => {
        let limitAmountNews = 2;
        let news = await newsParser.getRealNewsItems(limitAmountNews);
        expect(news.length).toBeGreaterThan(0);
    });

    it("test date from news article", async () => {
        //console.log("Testing date extraction from news article");
        let articleUrl = "https://www.studentenwerk-hannover.de/unternehmen/news/detail/lange-tafel-2024";

        //console.log("Article URL: " + articleUrl);

        let response = await StudentenwerkHannoverNews_Parser.fetchArticleDate(articleUrl);
        //console.log("Response: " + response);
        //console.log(response);
        expect(response).toBeDefined();
    });


    it("real news", async () => {
        let news = await newsParser.getRealNewsItems(5);
        expect(news.length).toBeGreaterThan(0);
        let sortedNews = news.sort((a, b) => {
            let dateA_raw = a.basicNews.date;
            let dateB_raw = b.basicNews.date;

            // latest articles first

            // if no date, sort to the end
            if (!dateA_raw) return 1; // dateA is undefined, so it goes to the end
            if (!dateB_raw) return -1; // dateB is undefined, so it goes to the end

            let dateA = new Date(dateA_raw);
            let dateB = new Date(dateB_raw);
            return dateB.getTime() - dateA.getTime(); // latest articles first
        });

        let expectedAliasSomewhere = "Essen, quatschen, zuhören";
        let foundAlias = news.some(item => item.basicNews.alias === expectedAliasSomewhere);
        expect(foundAlias).toBe(true);

        for( let newsItem of news) {
            expect(newsItem.basicNews.external_identifier).toBeDefined();
            expect(newsItem.basicNews.image_remote_url).toBeDefined();
            expect(newsItem.basicNews.alias).toBeDefined();
            expect(newsItem.basicNews.date).toBeDefined();
            expect(newsItem.basicNews.url).toBeDefined();

        }
    });
});