import {DatabaseTypes} from 'repo-depkit-common';

export class RssBuilder {
  public static buildRss(news: DatabaseTypes.News[], link: string) {
    const channelTitle = 'Rocket Meals News';
    const channelDescription = 'Latest news';

    const itemsXml = news
        .map((item) => {
          const translations = Array.isArray(item.translations) ? item.translations : [];
          const first = translations.length > 0 ? translations[0] : {};
          const title = first?.title || '';
          const description = first?.content || '';
          const url = item.url || '';
          const pubDate = item.date ? new Date(item.date).toUTCString() : '';
          return `\n    <item>\n      <title><![CDATA[${title}]]></title>\n      <link>${url}</link>\n      <description><![CDATA[${description}]]></description>\n      <pubDate>${pubDate}</pubDate>\n    </item>`;
        })
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${channelTitle}</title>\n    <link>${link}</link>\n    <description>${channelDescription}</description>${itemsXml}\n  </channel>\n</rss>`;
  }
}
