import { describe, it, expect } from '@jest/globals';
import {RssBuilder} from "../RssBuilder";
import {DatabaseTypes} from 'repo-depkit-common';

describe('news rss endpoint', () => {
  it('builds rss xml from items', () => {
    const news: DatabaseTypes.News[] = [
      {
        id: '1',
        date: '2024-01-01',
        url: 'https://example.com/news',
        translations: [
          {
            title: 'Test News',
            content: 'Content',
          },
        ],
      },
    ];
    const xml = RssBuilder.buildRss(news, 'https://example.com');
    expect(xml).toContain('<rss');
    expect(xml).toContain('<title>Rocket Meals News</title>');
    expect(xml).toContain('<title><![CDATA[Test News]]></title>');
  });
});
