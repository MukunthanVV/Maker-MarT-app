import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { PRODUCTS } from '../data/products';

export const ComponentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const currentProduct = PRODUCTS.find(p => p.id === id || p.id === String(id));
  const RELATED_PRODUCTS = PRODUCTS.filter(p => p.id !== id && p.id !== String(id)).slice(0, 4);
  
  const [activeImage, setActiveImage] = useState(currentProduct ? currentProduct.images[0] : null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentProduct) {
      setActiveImage(currentProduct.images[0]);
    }
  }, [id, currentProduct]);

  if (!currentProduct) {
    return (
      <div className="bg-[var(--color-background)] text-[var(--color-text-primary)] min-h-screen flex flex-col items-center justify-center p-4 pb-24">
        <div className="w-24 h-24 bg-[var(--color-surface)] rounded-full flex items-center justify-center text-[var(--color-text-secondary)] mb-6 shadow-sm border border-[var(--color-border)]">
           <span className="material-symbols-outlined text-[48px]">search_off</span>
        </div>
        <h1 className="text-h1 mb-2 text-center">Product Not Found</h1>
        <p className="text-body text-[var(--color-text-secondary)] mb-8 text-center max-w-md">The product you are looking for does not exist, has been removed, or was already sold.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Go Back
        </button>
      </div>
    );
  }

  const DUMMY_PRODUCT = currentProduct;

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans min-h-screen pb-24 relative">
      
      {/* TopAppBar */}
      <header className="bg-[var(--color-surface)] sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-icon">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">MakerMart</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-icon">
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <button className="btn-icon">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Images */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="w-full aspect-square md:max-h-[500px] rounded-[24px] overflow-hidden bg-[var(--color-background)] border border-[var(--color-border)] group relative shadow-sm flex items-center justify-center">
                <img 
                  src={activeImage} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 origin-center"
                  alt="Product Main"
                  onError={(e) => { e.target.src = 'https://placehold.co/800x800/F8FAFC/46A857?text=Image+Not+Found'; }}
                />
              </div>
              
              <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
                {DUMMY_PRODUCT.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === img ? 'border-[var(--color-primary)] shadow-md opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} onError={(e) => { e.target.src = 'https://placehold.co/800x800/F8FAFC/46A857?text=Image+Not+Found'; }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="md:col-span-7 flex flex-col gap-6">
              
              {/* Header Info */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-neutral">
                    {DUMMY_PRODUCT.condition}
                  </span>
                  <span className="badge-primary">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
                    {DUMMY_PRODUCT.availability}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-medium ml-auto">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {DUMMY_PRODUCT.postedTime}
                  </div>
                </div>
                
                <h1 className="text-h1 leading-tight mt-1">
                  {DUMMY_PRODUCT.name}
                </h1>
                
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tight">{DUMMY_PRODUCT.price}</span>
                  {DUMMY_PRODUCT.originalPrice && (
                    <span className="text-lg font-semibold text-[var(--color-text-secondary)] line-through mb-1.5">{DUMMY_PRODUCT.originalPrice}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm font-semibold text-[var(--color-text-secondary)] mt-2 border-b border-[var(--color-border)] pb-5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px] text-[var(--color-warning)]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="text-[var(--color-text-primary)]">{DUMMY_PRODUCT.sellerRating}</span> Seller Rating
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">school</span>
                    {DUMMY_PRODUCT.sellerCollege}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <h3 className="text-h3">Description</h3>
                <p className="text-body text-[var(--color-text-secondary)]">
                  {DUMMY_PRODUCT.description}
                </p>
              </div>

              {/* Specifications */}
              <div className="flex flex-col gap-3 mt-2">
                <h3 className="text-h3">Specifications</h3>
                <div className="bg-[var(--color-surface)] rounded-[24px] border border-[var(--color-border)] shadow-sm overflow-hidden">
                  {DUMMY_PRODUCT.specs.map((spec, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-5 ${idx !== DUMMY_PRODUCT.specs.length - 1 ? 'border-b border-[var(--color-border)]' : ''} hover:bg-[var(--color-background)] transition-colors`}>
                      <span className="text-[var(--color-text-secondary)] font-semibold">{spec.label}</span>
                      <span className="font-bold text-[var(--color-text-primary)]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller Card */}
              <div className="mt-4 bg-[var(--color-surface)] rounded-[24px] border border-[var(--color-border)] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                  <img src={DUMMY_PRODUCT.seller.avatar} alt={DUMMY_PRODUCT.seller.name} className="w-16 h-16 rounded-full border border-[var(--color-border)] shadow-sm object-cover" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-[var(--color-text-primary)] text-xl">{DUMMY_PRODUCT.seller.name}</h4>
                      {DUMMY_PRODUCT.seller.isVerified && (
                        <span className="material-symbols-outlined text-[var(--color-info)] text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-text-secondary)]">{DUMMY_PRODUCT.seller.college}</span>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-[var(--color-text-secondary)]">
                       <span className="flex items-center gap-1.5 badge-neutral"><span className="material-symbols-outlined text-[16px] text-[var(--color-warning)]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>{DUMMY_PRODUCT.seller.rating}</span>
                       <span className="flex items-center gap-1.5 badge-neutral"><span className="material-symbols-outlined text-[16px] text-[var(--color-success)]">bolt</span>{DUMMY_PRODUCT.seller.responseTime}</span>
                    </div>
                  </div>
                </div>
                <button className="btn-outline w-full sm:w-auto">
                  View Profile
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {DUMMY_PRODUCT.isAuction ? (
                  <button className="btn-auction col-span-1 sm:col-span-2 py-4 text-lg">
                    <span className="material-symbols-outlined text-[24px]">gavel</span>
                    Join Auction
                  </button>
                ) : (
                  <button onClick={() => navigate(`/checkout/${DUMMY_PRODUCT.id}`)} className="btn-primary col-span-1 sm:col-span-2 py-4 text-lg">
                    <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                    Buy Now
                  </button>
                )}
                
                <button className="btn-secondary py-3.5">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  Chat with Seller
                </button>
                <button className="btn-secondary py-3.5">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                  Add to Wishlist
                </button>
              </div>

            </div>
          </div>

          {/* Related Products */}
          <section className="mt-16 pt-8 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2">Related Products</h2>
              <button className="text-[var(--color-primary)] font-bold hover:underline flex items-center gap-1 group bg-[var(--color-primary)]/5 px-4 py-2 rounded-full transition-colors hover:bg-[var(--color-primary)]/10">
                View All 
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
            
            <div className="flex overflow-x-auto gap-5 pb-8 hide-scrollbar snap-x">
              {RELATED_PRODUCTS.map((prod) => (
                <div 
                  key={prod.id} 
                  onClick={() => navigate(`/product/${prod.id}`)}
                  className="snap-start shrink-0 w-[240px] card-interactive flex flex-col group"
                >
                  <div className="w-full aspect-square bg-[var(--color-background)] relative overflow-hidden flex items-center justify-center">
                    <img src={prod.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={prod.name} />
                    <div className="absolute top-3 left-3 badge-neutral bg-white/95 backdrop-blur-md">
                      {prod.condition}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 bg-[var(--color-surface)] z-10">
                    <h4 className="font-bold text-[var(--color-text-primary)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors text-lg">{prod.name}</h4>
                    <span className="text-2xl font-black text-[var(--color-text-primary)]">{prod.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
