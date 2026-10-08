import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // .env থেকে URL নিচ্ছে
});

// 🔥 Token পাঠানোর লজিক অ্যাড করা হলো
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // টোকেন থাকলে সেটা হেডারে Authorization হিসেবে যুক্ত করে দেবে
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;