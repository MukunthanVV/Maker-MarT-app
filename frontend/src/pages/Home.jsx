import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { PRODUCTS } from '../data/products';

const BANNERS = [
  {
    id: 1,
    title: "🏛 Auction Place",
    content: (
      <div className="space-y-1">
        <div className="flex items-center gap-2"><span className="text-xl">🚀</span><span>Sell Faster.</span></div>
        <div className="flex items-center gap-2"><span className="text-xl">💰</span><span>Earn More.</span></div>
        <div className="flex items-center gap-2"><span className="text-xl">⚡</span><span>Close in Minutes.</span></div>
      </div>
    ),
    button: "Explore Auctions",
    bg: "bg-gradient-to-br from-[var(--color-warning)] to-amber-400",
    textColor: "text-amber-950",
    btnBg: "bg-white text-amber-950 hover:bg-white/90 shadow-sm"
  },
  {
    id: 2,
    title: "♻ Save Money",
    content: (
      <div className="whitespace-pre-line leading-relaxed">
        {"Buy verified electronics\nfrom students in your campus."}
      </div>
    ),
    button: "Browse Marketplace",
    bg: "bg-[var(--color-primary)]",
    textColor: "text-white",
    btnBg: "bg-white text-[var(--color-primary)] hover:bg-white/90 shadow-sm"
  },
  {
    id: 3,
    title: "🧪 Building a Project?",
    content: (
      <div className="whitespace-pre-line leading-relaxed">
        {"Find everything you need\nfor your next project."}
      </div>
    ),
    button: "Explore Components",
    bg: "bg-[var(--color-surface)] border border-[var(--color-border)]",
    textColor: "text-[var(--color-text-primary)]",
    btnBg: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm"
  },
  {
    id: 4,
    title: "🔥 Hot Auctions Today",
    content: (
      <div className="space-y-1">
        <div className="font-bold text-lg">8 Live Auctions</div>
        <div>Join before seats fill.</div>
      </div>
    ),
    button: "Join Now",
    bg: "bg-gradient-to-r from-[var(--color-warning)] to-amber-500",
    textColor: "text-amber-950",
    btnBg: "bg-white text-amber-950 hover:bg-white/90 shadow-sm"
  },
  {
    id: 5,
    title: "🌍 Community Impact",
    content: (
      <div className="space-y-1">
        <div className="font-bold text-lg">18,000+ Components Reused</div>
        <div>1.8 Tons E-Waste Saved</div>
      </div>
    ),
    button: "Learn More",
    bg: "bg-[var(--color-primary-dark)]",
    textColor: "text-white",
    btnBg: "bg-[var(--color-accent-light)] text-[var(--color-primary-dark)] hover:opacity-90 shadow-sm font-bold"
  }
];

const RECENT_PRODUCTS = PRODUCTS.filter(p => !p.isAuction).slice(0, 8);
const LIVE_AUCTIONS = PRODUCTS.filter(p => p.isAuction).slice(0, 5);

export const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);

  const handleBannerScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const itemWidth = e.target.firstElementChild?.offsetWidth || e.target.offsetWidth;
    const index = Math.round(scrollLeft / itemWidth);
    if (index !== activeBanner && index >= 0 && index < BANNERS.length) {
      setActiveBanner(index);
    }
  };

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans min-h-screen pb-24 relative">

      {/* TopAppBar */}
      <header className="bg-[var(--color-surface)] sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[var(--color-primary)] flex items-center justify-center text-white font-black text-xl">M</div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-[var(--color-primary)] leading-tight tracking-tight">MakerMart</span>
            <div className="flex items-center gap-0.5 text-[var(--color-text-secondary)]">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span className="text-xs font-medium line-clamp-1 max-w-[150px]">Sri Krishna Institutions</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-icon">
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <button className="btn-icon">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-12">
        {/* Hero Section */}
        <section className="animate-in fade-in duration-700">
          {/* Main Hero Card */}
          <div className="bg-[var(--color-primary)] text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--color-accent-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:scale-105 transition-transform duration-700 -translate-y-1/4 translate-x-1/4"></div>
            
            <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
              <p className="text-lg text-white/90 font-medium tracking-wide">
                Good Evening,<br />
                Karthick 👋
              </p>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                The Trusted Campus Marketplace<br className="hidden md:block" /> for Electronics.
              </h1>

              <div className="mt-4">
                <p className="text-lg md:text-xl text-[var(--color-primary-dark)] bg-[var(--color-accent-light)] w-fit px-6 py-3 rounded-xl font-bold shadow-sm">
                  Buy. Sell. Reuse. <span className="font-medium text-[var(--color-primary-dark)]/80 ml-1">Safely inside your campus.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Products', value: '2,348', icon: 'inventory_2' },
              { label: 'Students', value: '1,256', icon: 'school' },
              { label: 'Live Auctions', value: '18', icon: 'gavel', color: 'var(--color-warning)' },
              { label: 'E-Waste Saved', value: '1.8T', icon: 'recycling' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-[var(--color-surface)] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-[var(--color-border)] group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300" style={{ backgroundColor: stat.color ? `${stat.color}15` : 'var(--color-primary)15', color: stat.color || 'var(--color-primary)' }}>
                  <span className="material-symbols-outlined text-[26px]">{stat.icon}</span>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] leading-none mb-1">{stat.value}</div>
                  <div className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Search Bar */}
        <section>
          <div className="relative group max-w-3xl mx-auto">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-standard pl-12 py-4 text-lg shadow-sm border-2 border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-2xl"
              placeholder="Search boards, sensors, motors..."
              type="text"
            />
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-h3 mb-4">⚡ Popular Categories</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
            {[
              { name: 'Development Boards', count: '245 Items', icon: 'developer_board' },
              { name: 'Sensors', count: '418 Items', icon: 'sensors' },
              { name: 'Motors', count: '152 Items', icon: 'bolt' },
              { name: 'Batteries', count: '87 Items', icon: 'battery_full' },
              { name: 'Displays', count: '61 Items', icon: 'monitor' },
              { name: 'Tools', count: '133 Items', icon: 'hardware' },
              { name: 'Communication', count: '94 Items', icon: 'router' },
              { name: 'Power', count: '73 Items', icon: 'power' },
            ].map((cat, idx) => (
              <div 
                key={idx}
                className="snap-start shrink-0 w-[140px] md:w-[150px] card-interactive p-5 flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--color-background)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight mb-1">{cat.name}</h3>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">{cat.count}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Banner Carousel */}
        <section>
          <h2 className="text-h3 mb-4">⭐ Featured Deals</h2>
          <div className="relative">
            <div 
              onScroll={handleBannerScroll}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2"
            >
              {BANNERS.map((banner) => (
                <div 
                  key={banner.id}
                  className="snap-center shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] max-w-[500px]"
                >
                  <div className={`h-full ${banner.bg} ${banner.textColor} rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 min-h-[220px] relative overflow-hidden group`}>
                    <div className="relative z-10 flex flex-col gap-2">
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{banner.title}</h3>
                      <div className="text-base md:text-lg opacity-90 font-medium">
                        {banner.content}
                      </div>
                    </div>
                    
                    <button className={`relative z-10 w-fit px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 ${banner.btnBg}`}>
                      {banner.button}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicator Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {BANNERS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${activeBanner === idx ? 'w-6 bg-[var(--color-primary)]' : 'w-2 bg-[var(--color-border)]'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Recently Added */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3">🆕 Recently Added</h2>
            <button className="text-[var(--color-primary)] font-bold text-sm hover:underline flex items-center gap-1 group">
              View All 
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar snap-x">
            {RECENT_PRODUCTS.map((product) => (
              <div 
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="snap-start shrink-0 w-[240px] card-interactive flex flex-col overflow-hidden group"
              >
                {/* Image Section */}
                <div className="w-full aspect-square bg-[var(--color-background)] relative overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-[64px] text-[var(--color-border)] group-hover:scale-110 transition-transform duration-500">memory</span>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="badge-neutral bg-white/90 backdrop-blur-md">
                      <span className={`w-2 h-2 rounded-full ${product.status === 'Available' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`}></span>
                      {product.status}
                    </div>
                  </div>
                  
                  {/* Wishlist Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:scale-110 active:scale-95 transition-all z-10">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                </div>

                {/* Details Section */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                      {product.condition}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {product.time}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">{product.name}</h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[var(--color-text-primary)] leading-none">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-[var(--color-text-secondary)] line-through leading-none font-medium">{product.originalPrice}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-text-primary)]">
                      <span className="material-symbols-outlined text-[16px] text-[var(--color-warning)]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      {product.rating}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-[var(--color-border)]"></div>
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] font-medium line-clamp-1">
                      <span className="material-symbols-outlined text-[14px]">school</span>
                      {product.college}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Auctions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 flex items-center gap-2">
              <span className="text-[var(--color-warning)] material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span> 
              Live Auctions
            </h2>
            <button className="text-[var(--color-warning)] font-bold text-sm hover:underline flex items-center gap-1 group">
              View All 
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar snap-x">
            {LIVE_AUCTIONS.map((auction) => (
              <div 
                key={auction.id}
                onClick={() => navigate(`/product/${auction.id}`)}
                className="snap-start shrink-0 w-[260px] card-auction flex flex-col group"
              >
                {/* Gold Accent Top Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-warning)] z-20"></div>
                
                {/* Image Section */}
                <div className="w-full h-[160px] bg-[var(--color-background)] relative overflow-hidden flex items-center justify-center border-b border-[var(--color-border)]">
                  <span className="material-symbols-outlined text-[64px] text-[var(--color-border)] group-hover:scale-110 transition-transform duration-500">memory</span>
                  
                  {/* Heat Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="badge-neutral bg-white/90 backdrop-blur-md text-[var(--color-warning)]">
                      <span>{auction.heatIcon}</span>
                      {auction.heat}
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max z-10">
                    <div className="px-3 py-1 rounded-full bg-[var(--color-warning)] shadow-md text-xs font-bold text-amber-950 flex items-center gap-1.5 backdrop-blur-md">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      {auction.timeLeft} Left
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] line-clamp-1 group-hover:text-[var(--color-warning)] transition-colors">{auction.name}</h3>
                    <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 font-semibold bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      {auction.bidders}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-1 bg-[var(--color-warning)]/5 p-3 rounded-xl border border-[var(--color-warning)]/20">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Current Bid</span>
                      <span className="text-2xl font-black text-[var(--color-text-primary)]">{auction.currentBid}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">Market Price</span>
                      <span className="text-sm font-semibold text-[var(--color-text-secondary)] line-through">{auction.marketPrice}</span>
                    </div>
                  </div>

                  <button className="btn-auction w-full mt-2 h-10 text-sm">
                    Join Auction
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};
