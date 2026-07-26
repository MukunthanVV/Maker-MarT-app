import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import { createOrder } from '../services/orderService.js';
import crypto from 'crypto';

export const createOrderHandler = async (req, res) => {
    console.log(`\n[API] POST /api/payment/create-order received`);
    console.log(`[API] Body:`, req.body);
    try {
        const { amount, currency = 'INR', receipt = `receipt_${crypto.randomBytes(4).toString('hex')}` } = req.body;
        
        if (!amount) {
            console.error('[API] Error: Amount is required');
            return res.status(400).json({ error: 'Amount is required' });
        }

        const order = await createRazorpayOrder(amount, currency, receipt);
        
        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('[API] Create Order Error Details:', error);
        // 6. Display actual backend error
        const errorMessage = error.error?.description || error.message || 'Internal Server Error';
        res.status(500).json({ error: errorMessage, details: error.error?.reason || '' });
    }
};

export const verifyPaymentHandler = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            productId,
            productName,
            productImage,
            quantity = 1,
            price,
            subtotal,
            platformFee = 20,
            deliveryFee = 40,
            gst = 0,
            deliveryAddress
        } = req.body;

        const buyerId = req.user.id; // From authMiddleware
        const sellerId = req.user.id; // Mocking sellerId as buyerId per user request for testing

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        const isValid = verifyRazorpaySignature(
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid Signature. Payment verification failed.' });
        }

        // Signature is valid, insert order into database
        const orderData = {
            orderId: razorpay_order_id,
            buyerId,
            sellerId,
            productId,
            productName,
            productImage,
            quantity,
            price,
            subtotal,
            platformFee,
            deliveryFee,
            gst,
            grandTotal: price, // price passed from frontend is the grand total
            paymentId: razorpay_payment_id,
            status: 'Processing',
            orderStatus: 'Pending',
            paymentStatus: 'Paid',
            deliveryAddress,
            createdAt: new Date().toISOString()
        };

        const dbResult = await createOrder(orderData);

        res.status(200).json({ 
            success: true, 
            message: 'Payment verified successfully',
            order: dbResult 
        });

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
