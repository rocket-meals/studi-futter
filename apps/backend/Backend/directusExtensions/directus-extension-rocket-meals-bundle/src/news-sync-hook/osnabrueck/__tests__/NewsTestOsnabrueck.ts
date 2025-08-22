// small jest test
import { describe, expect, it, jest } from '@jest/globals';
import { StudentenwerkOsnabrueckNews_Parser } from '../StudentenwerkOsnabrueckNews_Parser';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const html = fs.readFileSync(path.resolve(__dirname, './News.html'), 'utf8');
const htmlArticlePage = fs.readFileSync(path.resolve(__dirname, './NewsSpecificPage.html'), 'utf8');

describe('NewsTestOsnabrueck', () => {
  async function getNews() {
    let newsParser = new StudentenwerkOsnabrueckNews_Parser();

    jest.spyOn(axios, 'get').mockImplementation(url => {
      if (url === StudentenwerkOsnabrueckNews_Parser.newsUrl) {
        return Promise.resolve({ data: html });
      } else if (url.startsWith(StudentenwerkOsnabrueckNews_Parser.newsArticleUrl)) {
        return Promise.resolve({ data: htmlArticlePage });
      }
      console.log('Unknown URL: ' + url);
      return Promise.reject(new Error('Unknown URL'));
    });

    let news = await newsParser.getRealNewsItems();
    return news;
  }

  it('should find news with fields', async () => {
    let news = await getNews();
    //console.log("Found news: " + news.length);
    expect(news.length).toBeGreaterThan(0);
  });

  it('should find news with the correct date', async () => {
    let news = await getNews();
    let expectedDateOnly = '08.08.24';
    let expectedTitle = 'Länderwoche in der Mensa: So bunt wie unser Mensateam!';

    let found = news.find(newsItem => {
      return newsItem.basicNews.alias === expectedTitle;
    });

    expect(found).toBeDefined();
    //console.log(JSON.stringify(found, null, 2));
  });
});
