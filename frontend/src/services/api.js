import axios from 'axios';

// Ensure API_BASE_URL always includes the '/api' suffix even if omitted in deployment environment variables
let rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to simplify payload handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Extract formatted message from standardized backend response
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    const details = error.response?.data?.error?.details || [];
    const statusCode = error.response?.status || 500;

    return Promise.reject({
      message,
      statusCode,
      details,
      raw: error,
    });
  }
);

export const api = {
  getHealth: () => apiClient.get('/health'),
  getMentors: () => apiClient.get('/mentors'),
  getSlots: (date, timezone) =>
    apiClient.get('/slots', {
      params: { date, timezone },
    }),
  createBooking: (bookingData) => apiClient.post('/book', bookingData),
  getBookings: () => apiClient.get('/bookings'),

  // OTP endpoints
  sendOTP: (email, name, phone) => apiClient.post('/otp/send', { email, name, phone }),
  verifyOTP: (email, otp) => apiClient.post('/otp/verify', { email, otp }),
  checkDuplicate: (email, phone) => apiClient.post('/otp/check-duplicate', { email, phone }),
};

export default api;
