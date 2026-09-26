import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
};

export default api;
