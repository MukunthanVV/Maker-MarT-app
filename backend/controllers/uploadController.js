import { generatePresignedUrl, deleteObject } from '../services/storageService.js';

export const getPresignedUrl = async (req, res) => {
    try {
        const { prefix } = req.body;
        
        // Basic validation for prefix
        if (prefix && typeof prefix !== 'string') {
            return res.status(400).json({ error: 'Invalid prefix' });
        }

        const urlData = await generatePresignedUrl(prefix || 'misc');
        
        return res.status(200).json(urlData);
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        
        if (error.message.includes('missing')) {
            return res.status(500).json({ error: 'Server configuration error: ' + error.message });
        }

        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
};

export const deleteUpload = async (req, res) => {
    try {
        const { key } = req.params;
        
        if (!key) {
            return res.status(400).json({ error: 'Object key is required' });
        }

        await deleteObject(key);
        
        return res.status(200).json({ message: 'Object deleted successfully' });
    } catch (error) {
        console.error('Error deleting object:', error);
        return res.status(500).json({ error: 'Failed to delete object' });
    }
};
