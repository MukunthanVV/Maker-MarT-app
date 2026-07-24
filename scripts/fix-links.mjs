import fs from 'fs';
import path from 'path';

const pagesDir = './src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

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
