import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!orderDetails) {
    return (
      <div className="bg-[var(--color-background)] text-[var(--color-text-primary)] min-h-screen flex flex-col items-center justify-center p-4 font-sans">
        <h1 className="text-h2 mb-6">No order details found</h1>
        <button onClick={() => navigate('/')} className="btn-primary">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans min-h-screen pb-24 flex items-center justify-center p-4">
      <div className="card-standard p-8 sm:p-12 w-full max-w-2xl flex flex-col items-center text-center">
        
        <div className="w-24 h-24 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center mb-6 border border-[var(--color-success)]/20 shadow-sm">
          <span className="material-symbols-outlined text-[var(--color-success)] text-[48px]">check_circle</span>
        </div>
        
        <h1 className="text-h1 mb-2">Payment Successful</h1>
        <p className="text-body text-[var(--color-text-secondary)] mb-8 text-lg">Your order has been placed securely.</p>

        <div className="w-full bg-[var(--color-background)] rounded-2xl p-6 border border-[var(--color-border)] mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-left shadow-sm">
          <img 
            src={orderDetails.productImage} 
            alt={orderDetails.productName} 
            className="w-32 h-32 rounded-xl object-cover border border-[var(--color-border)]"
            onError={(e) => { e.target.src = 'https://placehold.co/800x800/F8FAFC/46A857?text=Image+Not+Found'; }}
          />
          <div className="flex-1 space-y-2">
            <h3 className="text-h3">{orderDetails.productName}</h3>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Sold by: <span className="font-bold text-[var(--color-text-primary)]">{orderDetails.sellerName}</span></p>
            <div className="pt-2 flex flex-wrap gap-4">
               <div>
                 <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mb-1">Amount Paid</p>
                 <p className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">₹{orderDetails.amountPaid.toLocaleString('en-IN')}</p>
               </div>
               <div>
                 <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mb-1">Payment ID</p>
                 <p className="font-mono text-sm font-semibold">{orderDetails.paymentId}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[var(--color-success)]/10 rounded-xl p-4 border border-[var(--color-success)]/20 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-sm">
           <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-[var(--color-success)]">local_shipping</span>
             <div>
               <p className="font-bold text-[var(--color-success)]">Estimated Delivery</p>
               <p className="text-sm text-[var(--color-text-primary)] font-semibold">Today, 5 PM</p>
             </div>
           </div>
           <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-success)]">
             <span className="material-symbols-outlined text-sm">verified_user</span> Safe Exchange
           </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-4">
          <button 
            onClick={() => navigate('/')}
            className="btn-outline flex-1 py-4 text-lg"
          >
            Continue Shopping
          </button>
          <button 
            onClick={() => navigate('/my-orders')}
            className="btn-primary flex-1 py-4 text-lg justify-center gap-2"
          >
            My Orders
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
};
