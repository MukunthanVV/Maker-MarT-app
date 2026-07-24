const fs = require('fs');
const path = require('path');

const pagesDir = './src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // We will replace <a> tags that look like they belong to the bottom navigation
    // Since the text contains "Home", "Search", "Sell", "Inbox", "Profile" we can replace href="#" with the correct path.
    // Also change <a to <Link and </a> to </Link> for these specific ones.

    // A simple approach is to replace any <a href="#"... containing specific text:
    const linkReplacements = [
        { text: 'Home', path: '/' },
        { text: 'Search', path: '/explore' },
        { text: 'Sell', path: '/sell' },
        { text: 'Inbox', path: '/inbox' },
        { text: 'Profile', path: '/profile' }
    ];

    for (const { text, path: routePath } of linkReplacements) {
        // Find <a> tags that contain the specific text
        // This regex looks for <a ...> ... text ... </a>
        const regex = new RegExp(`<a([^>]*?)href="[^"]*"([^>]*?)>([\\s\\S]*?>\\s*${text}\\s*<\\/a>)`, 'gi');
        
        content = content.replace(regex, (match, p1, p2, p3) => {
            return `<Link${p1}to="${routePath}"${p2}>${p3.replace(/<\/a>$/i, '</Link>')}`;
        });
        
        // Sometimes the text might not be exactly before </a>, so let's do a more generic replacement:
        // If we just replace all <a href="#"> with <Link to="... "> if the innerHTML contains "Home"
        // Wait, regular expressions on HTML are tricky. Let's just do a simpler string replace if the regex missed it.
    }

    // A more robust regex for the specific icons:
    // They are usually structured like:
    // <a href="#" class="..."> <span ...>home</span> <span ...>Home</span> </a>
    // Let's replace <a with <Link and href="..." with to="..." globally for everything, because it's a React app,
    // we should use Link for internal routing anyway.

    // Let's manually replace the href="#" if the block contains the text.
    // Actually, let's just do a blanket replacement for the bottom nav specifically if possible,
    // or just let's try replacing all <a> with <Link> if they point to '#'.
    // Wait, let's just do it cleanly:
    
    // Convert all <a> to <Link> if they have href="#"
    content = content.replace(/<a([^>]+)href="#"([^>]*)>([\s\S]*?)<\/a>/gi, (match, beforeHref, afterHref, innerHtml) => {
        let to = '#';
        if (innerHtml.includes('Home') || innerHtml.includes('>home<')) to = '/';
        else if (innerHtml.includes('Search') || innerHtml.includes('>search<')) to = '/explore';
        else if (innerHtml.includes('Sell') || innerHtml.includes('add_circle')) to = '/sell';
        else if (innerHtml.includes('Inbox') || innerHtml.includes('>mail<')) to = '/inbox';
        else if (innerHtml.includes('Profile') || innerHtml.includes('>person<')) to = '/profile';
        
        if (to !== '#') {
            return `<Link${beforeHref}to="${to}"${afterHref}>${innerHtml}</Link>`;
        }
        return match; // Keep as <a> if we don't know the route
    });

    fs.writeFileSync(filePath, content);
}

console.log("Updated links in all pages.");
