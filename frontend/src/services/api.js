import axios from 'axios';

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL 
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — auto logout if token expired
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────
export const loginAPI = (data) => API.post('/auth/login', data);
export const getMeAPI = () => API.get('/auth/me');

// ── Students ───────────────────────────────
export const getStudentsAPI = (params) => API.get('/students', { params });
export const getStudentByIdAPI = (id) => API.get(`/students/${id}`);
export const addStudentAPI = (data) => API.post('/students', data);
export const updateStudentAPI = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudentAPI = (id) => API.delete(`/students/${id}`);
export const getLeaderboardAPI = () => API.get('/students/leaderboard');
export const getDashboardStatsAPI = () => API.get('/students/dashboard-stats');

// ── Quizzes ────────────────────────────────
export const getTodayQuizAPI = () => API.get('/quizzes/today');
export const submitQuizAPI = (data) => API.post('/quizzes/submit', data);
export const createQuizAPI = (data) => API.post('/quizzes', data);
export const getAllQuizzesAPI = () => API.get('/quizzes');
export const getStudentAnalyticsAPI = (studentId) =>
  API.get(`/quizzes/analytics/${studentId}`);

export default API;
