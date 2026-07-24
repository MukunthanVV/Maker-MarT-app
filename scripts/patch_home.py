import sys

with open("src/pages/Home.jsx", "r") as f:
    content = f.read()

target = """        <div className="flex items-center gap-4">
          <button onClick={() => setShowFilterModal(true)} className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>"""

replacement = """        <div className="flex items-center gap-4">
          <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full">
            <span className={`material-symbols-outlined ${showFavoritesOnly ? 'text-error' : ''}`}>favorite</span>
          </button>
          <button onClick={() => setShowFilterModal(true)} className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open("src/pages/Home.jsx", "w") as f:
        f.write(content)
    print("Patched Home.jsx successfully")
else:
    print("Target string not found in Home.jsx")

