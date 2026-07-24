import fs from 'fs';

let content = fs.readFileSync('src/pages/ExploreCategories.jsx', 'utf-8');

// 1. Add useNavigate
content = content.replace(
  "export const ExploreCategories = () => {",
  "import { useNavigate } from 'react-router-dom';\n\nexport const ExploreCategories = () => {\n  const navigate = useNavigate();"
);

// 2. Fix duplicate imports (it had import { Link } already)
content = content.replace("import { useNavigate } from 'react-router-dom';\n\nimport React from 'react';\nimport { Link }", "import React from 'react';\nimport { Link, useNavigate }");
// Clean up the initial rough replace
content = content.replace(
  "import React from 'react';\nimport { Link } from 'react-router-dom';\nimport { useNavigate } from 'react-router-dom';\n\nexport const ExploreCategories = () => {\n  const navigate = useNavigate();",
  "import React from 'react';\nimport { Link, useNavigate } from 'react-router-dom';\n\nexport const ExploreCategories = () => {\n  const navigate = useNavigate();"
);

// 3. Add onClick to trending items
content = content.replace(
  /<div className="px-3 py-1 bg-surface-container-high rounded-full([^>]+)>([^<]+)<\/div>/g,
  '<div onClick={() => navigate(\'/?search=$2\')} className="px-3 py-1 bg-surface-container-high rounded-full$1>$2</div>'
);

// 4. Add onClick to category-grid-item
// Need to extract the title inside to know what to pass.
// This is trickier with regex because the title is inside an <h4> or <h5>
// Let's use string manipulation

function addOnClickToCategories(html) {
  let parts = html.split('className="category-grid-item');
  for (let i = 1; i < parts.length; i++) {
    // Find the title text inside
    let titleMatch = parts[i].match(/<h[45][^>]*>([^<]+)<\/h[45]>/);
    if (titleMatch) {
      let title = titleMatch[1];
      parts[i] = `onClick={() => navigate('/?category=${title}')} className="category-grid-item` + parts[i];
    } else {
      parts[i] = 'className="category-grid-item' + parts[i];
    }
  }
  return parts.join('');
}

content = addOnClickToCategories(content);

// 5. Add onClick to the final grid wrap-up items
function addOnClickToSmallCategories(html) {
  let parts = html.split('className="p-4 border border-outline-variant');
  for (let i = 1; i < parts.length; i++) {
    let titleMatch = parts[i].match(/<span className="text-label-mono-md font-label-mono-md">([^<]+)<\/span>/);
    if (titleMatch) {
      let title = titleMatch[1];
      parts[i] = `onClick={() => navigate('/?category=${title}')} className="p-4 border border-outline-variant` + parts[i];
    } else {
      parts[i] = 'className="p-4 border border-outline-variant' + parts[i];
    }
  }
  return parts.join('');
}

content = addOnClickToSmallCategories(content);

fs.writeFileSync('src/pages/ExploreCategories.jsx', content);
console.log('ExploreCategories.jsx updated!');
