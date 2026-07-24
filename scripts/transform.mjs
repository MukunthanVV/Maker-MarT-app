import fs from 'fs';
import path from 'path';

const sourceDir = '../stitch_maker_hardware_exchange';
const destDir = './src/pages';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Mapping of directory names to Component names
const pageMappings = {
  'checkout_payment': 'CheckoutPayment',
  'component_details': 'ComponentDetails',
  'engineer_chat': 'EngineerChat',
  'explore_categories': 'ExploreCategories',
  'list_component': 'ListComponent',
  'makermart_home': 'Home',
  'makermart_inbox': 'Inbox',
  'makermart_login': 'Login',
  'personal_profile': 'PersonalProfile'
};

for (const [dirName, compName] of Object.entries(pageMappings)) {
  const htmlFilePath = path.join(sourceDir, dirName, 'code.html');
  
  if (fs.existsSync(htmlFilePath)) {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Extract body content
    let bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyHtml = '';
    
    if (bodyContentMatch && bodyContentMatch[1]) {
      bodyHtml = bodyContentMatch[1];
    } else {
      console.error(`Could not find body content for ${dirName}`);
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
  } else {
    console.warn(`File not found: ${htmlFilePath}`);
  }
}
