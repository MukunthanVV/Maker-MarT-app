const fs = require('fs');

const htmlContent = fs.readFileSync('../stitch_maker_hardware_exchange/makermart_home/code.html', 'utf8');

// Extract the body content (from <header> to end of </body>)
let bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyHtml = '';

if (bodyContentMatch && bodyContentMatch[1]) {
  bodyHtml = bodyContentMatch[1];
} else {
  console.error("Could not find body content");
  process.exit(1);
}

// Very basic HTML to JSX conversion
let jsxContent = bodyHtml
  .replace(/class="/g, 'className="')
  .replace(/for="/g, 'htmlFor="')
  .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
  .replace(/<img([^>]*?[^\/])>/g, '<img$1 />')
  .replace(/<input([^>]*?[^\/])>/g, '<input$1 />')
  .replace(/<br([^>]*?[^\/])>/g, '<br$1 />')
  .replace(/<hr([^>]*?[^\/])>/g, '<hr$1 />');

// Sometimes inline styles are present, need to handle them manually if they exist, but stitch usually uses tailwind classes.

const componentTemplate = `import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-24">
      ${jsxContent}
    </div>
  );
};
`;

fs.writeFileSync('./src/pages/Home.jsx', componentTemplate);
console.log("Transformed Home.jsx successfully.");
