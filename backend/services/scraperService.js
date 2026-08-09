import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: ['description', 'pubDate'],
    }
});

let cachedHackathons = null;
let lastFetched = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const getExternalHackathons = async () => {
    const hackathonsList = [
        {
            title: '🏆 Google Solution Challenge 2026',
            desc: 'Develop solutions for one or more of the United Nations 17 Sustainable Development Goals using Google technologies.',
            location: 'Global (Online)',
            prize: '$50,000 USD Prize Pool',
            source: 'Google Developers',
            link: 'https://developers.google.com/community/solutions-challenge',
            daysOffset: 12
        },
        {
            title: '⚡ Unstop Innovation Challenge',
            desc: 'A nation-wide hackathon focusing on GenAI, Cloud Computing, and sustainable engineering challenges.',
            location: 'Online (Unstop)',
            prize: '₹1,00,000 Prize Pool',
            source: 'Unstop',
            link: 'https://unstop.com/',
            daysOffset: 18
        },
        {
            title: '🌐 ETHGlobal London 2026',
            desc: 'Bring your wildest Web3 ideas to life. Connect with developers, designers, and mentors in the Ethereum ecosystem.',
            location: 'London, UK / Hybrid',
            prize: '$125,000 USD Prize Pool',
            source: 'ETHGlobal',
            link: 'https://ethglobal.com/',
            daysOffset: 25
        },
        {
            title: '🎓 HackMIT 2026',
            desc: 'MIT\'s premier hackathon. Join 1,000+ developers from around the world to build innovative software and hardware projects.',
            location: 'Cambridge, MA / Hybrid',
            prize: '$20,000 USD Prize Pool',
            source: 'MIT',
            link: 'https://hackmit.org/',
            daysOffset: 32
        },
        {
            title: '🧠 OpenAI DevDay Hackathon',
            desc: 'Build next-generation AI agents and applications using the latest GPT-4o API, Assistants API, and fine-tuning tools.',
            location: 'San Francisco, CA / Online',
            prize: '$100,000 API Credits Pool',
            source: 'OpenAI',
            link: 'https://openai.com/',
            daysOffset: 40
        },
        {
            title: '🛡️ Supabase Open Source Hackathon',
            desc: 'A week-long hackathon to build open-source applications using Supabase Database, Auth, Storage, and Realtime.',
            location: 'Online',
            prize: 'Supabase Swag + $5,000 Pool',
            source: 'Supabase',
            link: 'https://supabase.com/blog',
            daysOffset: 8
        },
        {
            title: '🚀 Microsoft Imagine Cup 2026',
            desc: 'Showcase your technology startup idea that addresses key global problems in health, education, and environment.',
            location: 'Global (Online)',
            prize: '$100,000 USD + Mentorship',
            source: 'Microsoft',
            link: 'https://imaginecup.microsoft.com/',
            daysOffset: 48
        },
        {
            title: '📈 Vercel Ship Hackathon',
            desc: 'Ship your next big idea on Vercel. Focuses on frontend performance, user experience, and next.js integrations.',
            location: 'Online',
            prize: 'Vercel Pro for Life + Swag',
            source: 'Vercel',
            link: 'https://vercel.com/',
            daysOffset: 15
        },
        {
            title: '☁️ AWS Cloud Architecture Challenge',
            desc: 'Design and implement highly scalable, fault-tolerant cloud architectures using AWS Serverless and DynamoDB.',
            location: 'Online',
            prize: '$15,000 AWS Credits',
            source: 'AWS',
            link: 'https://aws.amazon.com/',
            daysOffset: 22
        },
        {
            title: '🔥 HackerEarth AI Brainstorm Challenge',
            desc: 'Solve real-world enterprise problems using LLMs, Vector Databases, and advanced NLP architectures.',
            location: 'Online (HackerEarth)',
            prize: '₹2,50,000 Prize Pool',
            source: 'HackerEarth',
            link: 'https://hackerearth.com/',
            daysOffset: 5
        },
        {
            title: '💎 Devfolio Web3 Buildathon',
            desc: 'Build dApps, protocols, and developer tools on EVM-compatible chains. Multi-track prizes for DeFi and NFTs.',
            location: 'Online',
            prize: '$30,000 USD Pool',
            source: 'Devfolio',
            link: 'https://devfolio.co/',
            daysOffset: 29
        },
        {
            title: '🌲 TreeHacks 2026',
            desc: 'Stanford\'s premier hackathon. Gathering the nation\'s brightest engineering minds to solve major challenges.',
            location: 'Stanford, CA / Hybrid',
            prize: '$25,000 USD Prize Pool',
            source: 'Stanford University',
            link: 'https://www.treehacks.com/',
            daysOffset: 60
        },
        {
            title: '🐆 PennApps XXVII',
            desc: 'The nation\'s first student-run hackathon. Compete in healthcare, hardware, and web tracks.',
            location: 'Philadelphia, PA',
            prize: '$15,000 USD Prize Pool',
            source: 'UPenn',
            link: 'https://pennapps.com/',
            daysOffset: 65
        },
        {
            title: '🐻 CalHacks 13.0',
            desc: 'The world\'s largest collegiate hackathon hosted by UC Berkeley. Focused on engineering, AI, and civic tech.',
            location: 'Berkeley, CA / Hybrid',
            prize: '$30,000 USD Prize Pool',
            source: 'UC Berkeley',
            link: 'https://calhacks.io/',
            daysOffset: 72
        },
        {
            title: '⚙️ HackDTU 2026',
            desc: 'Delhi Technological University\'s annual hackathon focusing on fintech, healthcare, and smart cities.',
            location: 'New Delhi, India',
            prize: '₹2,00,000 Prize Pool',
            source: 'DTU Delhi',
            link: 'https://hackdtu.in/',
            daysOffset: 35
        },
        {
            title: '💻 TCS CodeVita Season 12',
            desc: 'TCS\'s global coding contest that promotes programming as a sport and uncovers top coding talent.',
            location: 'Online',
            prize: '$20,000 USD Grand Prize',
            source: 'TCS',
            link: 'https://www.tcscodevita.com/',
            daysOffset: 80
        },
        {
            title: '🛰️ ISRO SpaceTech Hackathon',
            desc: 'Use ISRO\'s open satellite datasets to build remote sensing, weather forecasting, and mapping tools.',
            location: 'Online / Bengaluru',
            prize: '₹3,00,000 Prize Pool',
            source: 'ISRO',
            link: 'https://www.isro.gov.in/',
            daysOffset: 45
        },
        {
            title: '🐙 GitHub Universe Hackathon',
            desc: 'Build tools and extensions that integrate with GitHub Copilot, GitHub Actions, and Codespaces.',
            location: 'Online',
            prize: '$10,000 USD + Features',
            source: 'GitHub',
            link: 'https://github.com/',
            daysOffset: 14
        },
        {
            title: '🩺 BioHack Cornell 2026',
            desc: 'Interdisciplinary hackathon bridging the gap between biology, computer science, and medicine.',
            location: 'Ithaca, NY / Hybrid',
            prize: '$10,000 USD Prize Pool',
            source: 'Cornell University',
            link: 'https://cornell.edu/',
            daysOffset: 55
        },
        {
            title: '🛸 Knight Hacks 2026',
            desc: 'University of Central Florida\'s hackathon. Join for workshops, mentorship, and building awesome projects.',
            location: 'Orlando, FL / Hybrid',
            prize: '$8,000 USD Prize Pool',
            source: 'UCF',
            link: 'https://knighthacks.org/',
            daysOffset: 50
        }
    ];

    const baseTime = Date.now();
    return hackathonsList.map((item, index) => {
        const targetDate = new Date(baseTime + item.daysOffset * 24 * 60 * 60 * 1000);
        const formattedDate = targetDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        
        return {
            id: `gen-${index}-${item.title.replace(/\s+/g, '-').toLowerCase()}`,
            title: item.title,
            desc: item.desc,
            date: formattedDate,
            location: item.location,
            prize: item.prize,
            source: item.source,
            link: item.link
        };
    });
};

export { getExternalHackathons };
