import axios from 'axios';
import { supabase } from '../supabaseClient';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api',
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (token && !error) {
        if (config.headers && typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      // Gracefully ignore session errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
