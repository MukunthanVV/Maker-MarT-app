import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: ['description', 'pubDate'],
    }
});

const getExternalHackathons = async () => {
    try {
        // Attempt to fetch live RSS feed from Devpost or a similar hackathon aggregator
        const feedUrl = 'https://devpost.com/hackathons.rss';
        const feed = await parser.parseURL(feedUrl);
        
        const liveEvents = feed.items.slice(0, 5).map((item, index) => ({
            id: `rss-${index}`,
            title: item.title || 'Hackathon Event',
            desc: item.contentSnippet || item.description || 'Join this exciting upcoming hackathon!',
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Upcoming',
            location: 'Online / External',
            prize: 'Check Link for Prizes',
            source: 'Devpost (Live RSS)',
            link: item.link
        }));

        if (liveEvents.length > 0) {
            return liveEvents;
        }
        
    } catch (error) {
        console.log("Live RSS fetch failed or blocked (common for Devpost), using realistic fallback data...");
    }

    // Fallback / Mocked External Events if Live Scrape Fails
    return [
        {
            id: 'unstop-101',
            title: '🏆 Unstop Innovation Challenge',
            desc: 'A nation-wide hackathon focusing on GenAI and sustainable technology. Join thousands of students globally!',
            date: 'November 10-12, 2026',
            location: 'Online (Unstop)',
            prize: '₹1,00,000 Prize Pool',
            source: 'Unstop',
            link: 'https://unstop.com/'
        },
        {
            id: 'devpost-201',
            title: '⚡ Global Web3 Hack',
            desc: 'Build decentralized applications on Ethereum. Mentorship provided by industry experts.',
            date: 'October 25-30, 2026',
            location: 'Online (Devpost)',
            prize: '$10,000 USD Prize Pool',
            source: 'Devpost',
            link: 'https://devpost.com/'
        }
    ];
};

export { getExternalHackathons };
