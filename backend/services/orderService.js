import { supabase } from '../config/supabase.js';

export const createOrder = async (orderData) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    order_id: orderData.orderId,
                    buyer_id: orderData.buyerId,
                    seller_id: orderData.sellerId,
                    product_id: orderData.productId,
                    product_name: orderData.productName,
                    product_image: orderData.productImage,
                    quantity: orderData.quantity,
                    subtotal: orderData.subtotal,
                    platform_fee: orderData.platformFee,
                    delivery_fee: orderData.deliveryFee,
                    gst: orderData.gst,
                    grand_total: orderData.grandTotal,
                    payment_id: orderData.paymentId,
                    status: orderData.status, // Keeping for backward compatibility if needed
                    order_status: orderData.orderStatus || 'Pending',
                    payment_status: orderData.paymentStatus,
                    delivery_address: orderData.deliveryAddress,
                    created_at: orderData.createdAt
                }
            ])
            .select();
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error creating order in DB:', error);
        throw error;
    }
};

export const getBuyerOrders = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching buyer orders:', error);
        throw error;
    }
};

export const getSellerOrders = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        throw error;
    }
};

export const getOrderById = async (orderId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, sellerId, newStatus) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ order_status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .eq('seller_id', sellerId)
            .select();
            
        if (error) throw error;
        if (data.length === 0) throw new Error('Order not found or unauthorized');
        return data[0];
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

export const cancelOrder = async (orderId, buyerId) => {
    try {
        // Only allow cancel if status is Pending or Confirmed
        const { data: order } = await supabase
            .from('orders')
            .select('order_status')
            .eq('id', orderId)
            .eq('buyer_id', buyerId)
            .single();
            
        if (!order) throw new Error('Order not found or unauthorized');
        
        if (order.order_status !== 'Pending' && order.order_status !== 'Confirmed') {
            throw new Error(`Cannot cancel order in ${order.order_status} state`);
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ order_status: 'Cancelled', updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .eq('buyer_id', buyerId)
            .select();
            
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};
