import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('hms_user') || 'null'),
  token: localStorage.getItem('hms_token') || null,
  isAuthenticated: !!localStorage.getItem('hms_token'),

  login: (user, token) => {
    localStorage.setItem('hms_user', JSON.stringify(user));
    localStorage.setItem('hms_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('hms_user');
    localStorage.removeItem('hms_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('hms_user') || 'null');
    return user?.role === 'ROLE_ADMIN';
  },
}));

export default useAuthStore;
