import cron from 'node-cron';
import { fetchAndStoreNews } from './newsService.js';

export const initCronJobs = () => {
    // Run every 4 hours
    cron.schedule('0 */4 * * *', async () => {
        console.log('Running scheduled task: Fetching live tech news');
        await fetchAndStoreNews();
    });

    console.log('Cron jobs initialized.');
};
