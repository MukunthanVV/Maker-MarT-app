import * as OrderService from '../services/orderService.js';

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await OrderService.getBuyerOrders(userId);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getSellerOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await OrderService.getSellerOrders(userId);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const order = await OrderService.getOrderById(id);
        
        // Ensure user is either buyer or seller of this order
        if (order.buyer_id !== userId && order.seller_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You do not have access to this order' });
        }
        
        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const sellerId = req.user.id;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        const updatedOrder = await OrderService.updateOrderStatus(id, sellerId, status);
        res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        if (error.message.includes('not found or unauthorized')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const buyerId = req.user.id;
        
        const cancelledOrder = await OrderService.cancelOrder(id, buyerId);
        res.status(200).json({ success: true, order: cancelledOrder });
    } catch (error) {
        console.error('Error cancelling order:', error);
        if (error.message.includes('Cannot cancel')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('not found or unauthorized')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
