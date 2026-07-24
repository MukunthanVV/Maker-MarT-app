import json
import re

# Read tailwind config
with open('tailwind.config.js', 'r') as f:
    content = f.read()

# Extract colors dict using regex
match = re.search(r'"colors":\s*({[^}]*})', content, re.MULTILINE | re.DOTALL)
if match:
    colors_str = match.group(1)
    # clean up the js string to be valid json
    colors_str = re.sub(r'([a-zA-Z0-9_-]+):', r'"\1":', colors_str)
    # replace single quotes with double quotes
    colors_str = colors_str.replace("'", '"')
    
    # parse the json safely (we might need to eval if it's not perfect json, but let's try json.loads)
    try:
        colors = json.loads(colors_str)
    except json.JSONDecodeError:
        # fallback to a simpler parsing
        colors = {}
        for line in colors_str.split('\n'):
            m = re.search(r'"([^"]+)":\s*"([^"]+)"', line)
            if m:
                colors[m.group(1)] = m.group(2)
    
    # Write to index.css
    with open('src/index.css', 'r') as f:
        css_content = f.read()
    
    root_vars = []
    dark_vars = []
    
    for key, value in colors.items():
        root_vars.append(f"  --color-{key}: {value};")
        # simple dark mode heuristic: invert lightness or use specific mappings
        # for now, we will map surface to dark grey, etc.
        if key == 'background' or key == 'surface':
            dark_vars.append(f"  --color-{key}: #121212;")
        elif key == 'surface-container-lowest':
            dark_vars.append(f"  --color-{key}: #000000;")
        elif key == 'surface-container-low':
            dark_vars.append(f"  --color-{key}: #1e1e1e;")
        elif key == 'surface-container':
            dark_vars.append(f"  --color-{key}: #2c2c2c;")
        elif key == 'surface-container-high':
            dark_vars.append(f"  --color-{key}: #383838;")
        elif 'on-' in key:
            dark_vars.append(f"  --color-{key}: #e0e0e0;")
        elif key == 'primary':
            dark_vars.append(f"  --color-{key}: #81c784;") # lighter green for dark mode
        elif key == 'outline':
            dark_vars.append(f"  --color-{key}: #666666;")
        elif key == 'outline-variant':
            dark_vars.append(f"  --color-{key}: #444444;")
        else:
            dark_vars.append(f"  --color-{key}: {value};") # fallback to same
            
    css_addition = "\n:root {\n" + "\n".join(root_vars) + "\n}\n\n.dark {\n" + "\n".join(dark_vars) + "\n}\n"
    
    if ':root' not in css_content:
        with open('src/index.css', 'w') as f:
            f.write(css_content + css_addition)
            
    # Update tailwind.config.js to use variables
    new_colors = {k: f"var(--color-{k})" for k in colors.keys()}
    new_colors_str = json.dumps(new_colors, indent=12)
    new_content = content.replace(match.group(1), new_colors_str)
    
    with open('tailwind.config.js', 'w') as f:
        f.write(new_content)
    
    print("Patched dark mode successfully")
else:
    print("Could not find colors in tailwind.config.js")

