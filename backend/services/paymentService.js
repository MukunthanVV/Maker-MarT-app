import Razorpay from 'Razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

// 10. Show a friendly console warning for missing Razorpay Keys
if (!key_id || key_id === 'mock' || !key_id.startsWith('rzp_test_')) {
    console.warn('\n⚠️  [WARNING] Razorpay Test Keys are missing or invalid in .env!');
    console.warn('⚠️  Please add valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to use the real payment flow.\n');
}

// 4. Verify Razorpay instance initializes correctly
console.log('Initializing Razorpay instance with key_id:', key_id ? `${key_id.substring(0, 8)}...` : 'undefined');

const razorpayInstance = new Razorpay({
    key_id: key_id || 'mock',
    key_secret: key_secret || 'mock'
});

export const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
    try {
        console.log(`\n--- Razorpay createOrder request ---`);
        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency,
            receipt,
        };
        console.log('Options:', options);
        
        const order = await razorpayInstance.orders.create(options);
        
        // 5. Verify backend successfully creates Razorpay Order and Log
        console.log('✓ Razorpay Order Created Successfully!');
        console.log(`Order ID: ${order.id}`);
        console.log(`Amount: ${order.amount}`);
        console.log(`Currency: ${order.currency}`);
        console.log(`------------------------------------\n`);
        
        return order;
    } catch (error) {
        console.error('\n❌ Error creating Razorpay Order:', error);
        throw error;
    }
};

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock';
    
    // Create the expected signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === signature;
};
