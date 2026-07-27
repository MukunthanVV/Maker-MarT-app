import Parser from 'rss-parser';
import prisma from '../config/prisma.js';

const parser = new Parser({
    customFields: {
        item: ['description', 'pubDate', 'creator', 'dc:creator', 'content:encoded', 'media:thumbnail', 'media:content'],
    }
});

// List of RSS feeds to scrape
const feeds = [
    { url: 'http://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NYT Tech' },
    { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' }
];

const extractImage = (item) => {
    if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
        return item['media:thumbnail']['$'].url;
    }
    if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
        return item['media:content']['$'].url;
    }
    const content = item['content:encoded'] || item.content || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop'; // fallback tech image
};

const formatNewsItem = (item, feedSource) => {
    // Strip HTML from description for a clean snippet
    let cleanDesc = (item.contentSnippet || item.description || '').replace(/<[^>]+>/g, '').trim();
    if (cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 147) + '...';

    return {
        id: Math.random().toString(), // temporary ID for fallback
        title: item.title,
        source: feedSource,
        time: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-GB') : 'Recent',
        link: item.link,
        image: extractImage(item),
        description: cleanDesc,
        author: item.creator || item['dc:creator'] || feedSource
    };
};

export const fetchAndStoreNews = async () => {
    try {
        console.log('Fetching live tech news...');
        const allNews = [];

        for (const feed of feeds) {
            try {
                const parsedFeed = await parser.parseURL(feed.url);
                const items = parsedFeed.items.slice(0, 5); // Take top 5 from each

                items.forEach(item => {
                    const formattedItem = formatNewsItem(item, feed.source);
                    delete formattedItem.id; // DB will auto-generate UUID
                    allNews.push(formattedItem);
                });
            } catch (err) {
                console.error(`Failed to fetch from ${feed.source}:`, err.message);
            }
        }

        if (allNews.length > 0) {
            await prisma.news.deleteMany({});
            await prisma.news.createMany({ data: allNews });
            console.log(`Successfully updated ${allNews.length} news items.`);
        }
    } catch (error) {
        console.error('Error in fetchAndStoreNews:', error);
    }
};

export const getStoredNews = async () => {
    try {
        const news = await prisma.news.findMany({
            orderBy: { fetchedAt: 'desc' },
            take: 15
        });
        
        if (news.length === 0) throw new Error("No news in DB");
        return news;
    } catch (dbError) {
        console.warn('DB read failed or empty, fetching live on the fly as fallback...');
        const allNews = [];
        for (const feed of feeds) {
            try {
                const parsedFeed = await parser.parseURL(feed.url);
                const items = parsedFeed.items.slice(0, 5);
                items.forEach(item => {
                    allNews.push(formatNewsItem(item, feed.source));
                });
            } catch (err) {
                console.error(`Failed to fetch from ${feed.source}:`, err.message);
            }
        }
        return allNews;
    }
};

const liveNewsSources = {
    'BBC': 'http://feeds.bbci.co.uk/news/rss.xml',
    'NYT': 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'India Today': 'https://www.indiatoday.in/rss/Home'
};

export const fetchLiveNewsBySource = async (sourceName) => {
    try {
        const feedUrl = liveNewsSources[sourceName];
        if (!feedUrl) throw new Error(`Invalid source name: ${sourceName}`);

        const parsedFeed = await parser.parseURL(feedUrl);
        const items = parsedFeed.items.slice(0, 8); // Fetch 8 top stories
        const liveNews = [];

        items.forEach(item => {
            liveNews.push(formatNewsItem(item, sourceName));
        });

        return liveNews;
    } catch (error) {
        console.error(`Error fetching live news from ${sourceName}:`, error);
        throw error;
    }
};
