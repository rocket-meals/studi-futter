import {defineEndpoint} from '@directus/extensions-sdk';
import {MyDatabaseHelper} from '../helpers/MyDatabaseHelper';
import {ApiContext} from '../helpers/ApiContext';
import {RssBuilder} from './RssBuilder';


const EndpointTopName = 'rss-news.xml';

export default defineEndpoint({
    id: EndpointTopName,
    handler: (router, apiContext: ApiContext) => {
        router.get('/', async (_req, res) => {
            const myDatabaseHelper = new MyDatabaseHelper(apiContext);
            const newsHelper = myDatabaseHelper.getNewsHelper();
            const news = await newsHelper.readByQueryWithTranslations({
                limit: 100,
                sort: ['-date'],
            });

            const rss = RssBuilder.buildRss(news, myDatabaseHelper.getServerUrl());
            res.set('Content-Type', 'application/rss+xml; charset=UTF-8');
            res.send(rss);
        });
    }
});
