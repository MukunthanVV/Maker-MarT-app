import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GCP_API_KEY || '';
const PROJECT_ID = '17265918686892945237';
const screensToFetch = {
  '0907eca580ce4741925f57b321a59aca': 'ComponentDetails',
  'c65927aa4d49484bb2e9cc055a953090': 'Inbox'
};

const destDir = './src/pages';

async function fetchAndTransform() {
  for (const [screenId, compName] of Object.entries(screensToFetch)) {
    const url = `https://stitch.googleapis.com/v1/projects/${PROJECT_ID}/screens/${screenId}`;
    
    console.log(`Fetching metadata for ${compName}...`);
    try {
      const res = await fetch(url, {
        headers: {
          'X-Goog-Api-Key': API_KEY
        }
      });
      
      if (!res.ok) {
        console.error(`Failed to fetch metadata for ${compName}: ${res.statusText}`);
        continue;
      }
      
      const data = await res.json();
      const downloadUrl = data.htmlCode?.downloadUrl;
      
      if (!downloadUrl) {
        console.error(`No downloadUrl found for ${compName}`);
        continue;
      }
      
      console.log(`Downloading HTML code for ${compName}...`);
      const codeRes = await fetch(downloadUrl);
      if (!codeRes.ok) {
        console.error(`Failed to download HTML for ${compName}`);
        continue;
      }
      
      const htmlContent = await codeRes.text();
      
      // Extract body content
      let bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let bodyHtml = '';
      
      if (bodyContentMatch && bodyContentMatch[1]) {
        bodyHtml = bodyContentMatch[1];
      } else {
        console.error(`Could not find body content for ${compName}`);
        continue;
      }
      
      // Remove script tags entirely
      bodyHtml = bodyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      // Convert to JSX
      let jsxContent = bodyHtml
        .replace(/class="/g, 'className="')
        .replace(/for="/g, 'htmlFor="')
        .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
        .replace(/<img([^>]*?[^\/])>/g, '<img$1 />')
        .replace(/<input([^>]*?[^\/])>/g, '<input$1 />')
        .replace(/<br([^>]*?[^\/])>/g, '<br$1 />')
        .replace(/<hr([^>]*?[^\/])>/g, '<hr$1 />')
        .replace(/viewBox/g, 'viewBox')
        .replace(/stroke-width/g, 'strokeWidth')
        .replace(/stroke-linecap/g, 'strokeLinecap')
        .replace(/stroke-linejoin/g, 'strokeLinejoin')
        .replace(/fill-rule/g, 'fillRule')
        .replace(/clip-rule/g, 'clipRule')
        .replace(/onsubmit="[^"]*"/g, 'onSubmit={(e) => e.preventDefault()}')
        .replace(/onclick="[^"]*"/g, 'onClick={() => {}}')
        .replace(/style="[^"]*"/g, '');

      const componentTemplate = `import React from 'react';
import { Link } from 'react-router-dom';

export const ${compName} = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-24">
      ${jsxContent}
    </div>
  );
};
`;

      fs.writeFileSync(path.join(destDir, `${compName}.jsx`), componentTemplate);
      console.log(`Transformed ${compName}.jsx successfully.`);
      
    } catch (err) {
      console.error(`Error processing ${compName}:`, err);
    }
  }
}

fetchAndTransform();
