import fs from 'fs';
import path from 'path';

const homePath = './src/pages/Home.jsx';
let content = fs.readFileSync(homePath, 'utf8');

// Extract images
const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/g;
let match;
const images = [];
while ((match = imgRegex.exec(content)) !== null) {
    images.push(match[1]);
}
// image[0] is logo (base64)
// image[1] is Arduino
// image[2] is Ultrasonic
// image[3] is Raspberry Pi
// image[4] is Servo Pack
// image[5] is Sustainable Pick

const newHomeJSX = `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'boards', label: 'Boards', icon: 'developer_board' },
  { id: 'sensors', label: 'Sensors', icon: 'sensors' },
  { id: 'robotics', label: 'Robotics', icon: 'precision_manufacturing' },
  { id: 'iot', label: 'IoT', icon: 'router' },
  { id: 'cables', label: 'Cables', icon: 'settings_input_component' }
];

const PRODUCTS = [
  {
    id: 1,
    title: 'Arduino Uno R3',
    price: '₹450',
    condition: 'Like New',
    timeAgo: '2h ago',
    image: '${images[1]}',
    category: 'boards',
    conditionColor: 'bg-primary text-on-primary'
  },
  {
    id: 2,
    title: 'Ultrasonic Sensor HC-SR04',
    price: '₹80',
    condition: 'Used',
    timeAgo: '5h ago',
    image: '${images[2]}',
    category: 'sensors',
    conditionColor: 'bg-secondary text-on-secondary'
  },
  {
    id: 3,
    title: 'Raspberry Pi 4 (4GB)',
    price: '₹3,200',
    condition: 'Like New',
    timeAgo: '1d ago',
    image: '${images[3]}',
    category: 'boards',
    conditionColor: 'bg-primary text-on-primary'
  },
  {
    id: 4,
    title: 'SG90 Servo Motor Pack',
    price: '₹250',
    condition: 'Used',
    timeAgo: '3h ago',
    image: '${images[4]}',
    category: 'robotics',
    conditionColor: 'bg-secondary text-on-secondary'
  }
];

export const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [likedItems, setLikedItems] = useState(new Set());
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const toggleLike = (e, id) => {
    e.stopPropagation(); // prevent navigating to details page
    const newLiked = new Set(likedItems);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedItems(newLiked);
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-24 relative">
      
      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-headline-md mb-4">Select Location</h2>
            <ul className="space-y-2 mb-6">
              <li className="p-3 border rounded cursor-pointer hover:bg-surface-container bg-primary-container text-on-primary-container font-bold">IIT Delhi - Main Campus</li>
              <li className="p-3 border rounded cursor-pointer hover:bg-surface-container">NIT Trichy</li>
              <li className="p-3 border rounded cursor-pointer hover:bg-surface-container">BITS Pilani</li>
            </ul>
            <button onClick={() => setShowLocationModal(false)} className="w-full bg-outline-variant py-2 rounded font-bold">Close</button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-headline-md mb-4">Filters</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-full border p-2 rounded" />
                  <input type="number" placeholder="Max" className="w-full border p-2 rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Condition</label>
                <select className="w-full border p-2 rounded">
                  <option>Any</option>
                  <option>Like New</option>
                  <option>Used</option>
                </select>
              </div>
            </div>
            <button onClick={() => setShowFilterModal(false)} className="w-full bg-primary text-on-primary py-2 rounded font-bold">Apply Filters</button>
          </div>
        </div>
      )}

      {/* TopAppBar */}
      <header className="bg-surface sticky top-0 z-50 flex justify-between items-center px-gutter w-full h-16 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <img alt="MakerMart Logo" className="w-10 h-10 object-contain" src="${images[0]}"/>
          <div className="flex flex-col">
            <span className="text-body-md font-bold text-primary leading-tight">MakerMart</span>
            <div 
              className="flex items-center gap-0.5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowLocationModal(true)}
            >
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span className="text-label-mono-sm font-label-mono-sm line-clamp-1 max-w-[120px]">IIT Delhi - Main Campus</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowFilterModal(true)} className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-gutter py-md space-y-xl">
        {/* Search Bar */}
        <section className="mt-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg py-4 pl-12 pr-4 focus:outline-none focus:border-secondary transition-all font-body-md shadow-sm" 
              placeholder="Search boards, sensors, motors..." 
              type="text"
            />
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline-md font-headline-md text-on-surface">Categories</h2>
            <Link to="/explore" className="text-primary font-label-mono-md hover:underline">View All</Link>
          </div>
          <div className="flex overflow-x-auto gap-gutter pb-4 hide-scrollbar">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group"
                >
                  <div className={"w-16 h-16 rounded-full flex items-center justify-center transition-colors " + (isSelected ? "bg-primary text-on-primary" : "bg-surface-container group-hover:bg-primary-container group-hover:text-on-primary-container")}>
                    <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
                  </div>
                  <span className={"text-label-mono-sm font-label-mono-sm " + (isSelected ? "text-primary font-bold" : "text-on-surface-variant")}>{cat.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fresh Listings Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline-md font-headline-md text-on-surface">
              {searchQuery ? 'Search Results' : (selectedCategory ? 'Category Results' : 'Fresh Listings')}
            </h2>
            <div className="flex gap-2">
              <Link to="/explore">
                <span className="material-symbols-outlined text-outline hover:text-primary transition-colors cursor-pointer">grid_view</span>
              </Link>
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-outline">
              <p>No items found.</p>
              <button onClick={() => {setSearchQuery(''); setSelectedCategory(null)}} className="text-primary underline mt-2">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {filteredProducts.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => navigate('/product')}
                  className="bg-white rounded-lg border border-outline-variant overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative overflow-hidden bg-surface-container">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={p.image}/>
                    <div className={"absolute top-2 left-2 px-2 py-1 text-[10px] font-label-mono-sm rounded uppercase tracking-wider " + p.conditionColor}>
                      {p.condition}
                    </div>
                    <button 
                      onClick={(e) => toggleLike(e, p.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-on-surface hover:bg-white transition-colors"
                    >
                      <span className={"material-symbols-outlined text-[18px] " + (likedItems.has(p.id) ? "text-error" : "")}>
                        favorite
                      </span>
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-body-md font-semibold text-on-surface line-clamp-1">{p.title}</h3>
                    <p className="text-primary font-bold text-headline-md">{p.price}</p>
                    <div className="flex items-center text-outline text-[12px] gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{p.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sustainable Pick Section */}
        <section className="pb-12">
          <h2 className="text-headline-md font-headline-md text-on-surface mb-4">Sustainable Pick</h2>
          <div onClick={() => navigate('/product')} className="cursor-pointer bg-primary-container text-on-primary-container rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row relative group hover:shadow-lg transition-shadow">
            <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
              <img className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform" src="${images[5] || images[4]}"/>
            </div>
            <div className="p-6 md:w-2/3 flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[20px]">eco</span>
                <span className="text-label-mono-md font-label-mono-md uppercase tracking-widest">Project Bundle</span>
              </div>
              <h3 className="text-headline-lg font-headline-lg">IoT Starter Kit - Donated</h3>
              <p className="text-body-md opacity-90 max-w-lg">A complete kit including ESP32, sensors, and jumper wires donated by the Grad Class of '23. Perfect for beginners!</p>
              <div className="mt-4 flex items-center gap-4">
                <span className="text-headline-md font-bold">₹0 (Free)</span>
                <button className="bg-white text-primary px-6 py-2 rounded-lg font-bold hover:bg-surface-bright transition-colors shadow-sm">Claim Now</button>
              </div>
            </div>
            <div className="absolute top-4 right-4 hidden md:block opacity-20 pointer-events-none">
              <span className="material-symbols-outlined text-[80px]">recycling</span>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface border-t border-outline-variant">
        <Link className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-transform duration-150 active:scale-90" to="/">
          <span className="material-symbols-outlined">home</span>
          <span className="text-label-mono-sm font-label-mono-sm">Home</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 transition-transform duration-150 active:scale-90 hover:text-primary" to="/explore">
          <span className="material-symbols-outlined">search</span>
          <span className="text-label-mono-sm font-label-mono-sm">Search</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 transition-transform duration-150 active:scale-90 hover:text-primary" to="/sell">
          <span className="material-symbols-outlined text-[32px] text-primary">add_circle</span>
          <span className="text-label-mono-sm font-label-mono-sm">Sell</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 transition-transform duration-150 active:scale-90 hover:text-primary relative" to="/inbox">
          <span className="material-symbols-outlined">mail</span>
          <span className="text-label-mono-sm font-label-mono-sm">Inbox</span>
          <span className="absolute top-2 right-4 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 transition-transform duration-150 active:scale-90 hover:text-primary" to="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="text-label-mono-sm font-label-mono-sm">Profile</span>
        </Link>
      </nav>

      {/* FAB (Contextual for Home) */}
      <Link to="/sell" className="fixed right-gutter bottom-24 bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:bg-primary-container transition-all active:scale-95 group z-[40]">
        <span className="material-symbols-outlined text-[28px]">add</span>
        <span className="absolute right-16 bg-on-surface text-surface px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Sell Component</span>
      </Link>
    </div>
  );
};
`;

fs.writeFileSync(homePath, newHomeJSX);
console.log('Home.jsx refactored successfully.');
