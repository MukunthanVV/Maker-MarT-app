import sys

with open("src/pages/Home.jsx", "r") as f:
    content = f.read()

target1 = """  const [likedItems, setLikedItems] = useState(new Set());"""
replacement1 = """  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem('likedItems');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });"""

target2 = """  const [showFilterModal, setShowFilterModal] = useState(false);"""
replacement2 = """  const [showFilterModal, setShowFilterModal] = useState(searchParams.get('filter') === 'open');"""

target3 = """  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);"""
replacement3 = """  const [showFavoritesOnly, setShowFavoritesOnly] = useState(searchParams.get('favorites') === 'true');"""

target4 = """  const toggleLike = (e, id) => {
    e.stopPropagation(); // prevent navigating to details page
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };"""

replacement4 = """  const toggleLike = (e, id) => {
    e.stopPropagation(); // prevent navigating to details page
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      localStorage.setItem('likedItems', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };"""

content = content.replace(target1, replacement1)
content = content.replace(target2, replacement2)
content = content.replace(target3, replacement3)
content = content.replace(target4, replacement4)

with open("src/pages/Home.jsx", "w") as f:
    f.write(content)

print("Home state patched.")

