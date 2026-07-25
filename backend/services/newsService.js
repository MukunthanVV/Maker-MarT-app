import Parser from 'rss-parser';

const parser = new Parser();

// In-memory cache
let newsCache = null;
let lastFetchTime = null;
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

const RSS_FEED_URL = 'http://feeds.bbci.co.uk/news/technology/rss.xml';

export const getLiveNews = async () => {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (newsCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION_MS)) {
    return newsCache;
  }
  
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    
    // Map the RSS feed items to match our frontend schema
    const formattedNews = feed.items.map((item, index) => {
      // Calculate a relative time string if possible, or fallback
      let timeString = item.pubDate;
      try {
        const date = new Date(item.pubDate);
        const diffInHours = Math.floor((now - date.getTime()) / (1000 * 60 * 60));
        if (diffInHours === 0) timeString = 'Just now';
        else if (diffInHours < 24) timeString = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        else timeString = `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
      } catch(e) {}

      return {
        id: index + 1,
        source: 'BBC Tech',
        time: timeString,
        title: item.title,
        link: item.link // We'll pass the link so users can click on the news
      };
    });
    
    // Cache the result
    newsCache = formattedNews;
    lastFetchTime = now;
    
    return newsCache;
  } catch (error) {
    console.error('Failed to fetch RSS news:', error);
    // If fetch fails, return the stale cache if we have one, otherwise throw
    if (newsCache) return newsCache;
    throw error;
  }
};
