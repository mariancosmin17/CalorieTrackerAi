export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

export const API_ENDPOINTS = {
  LOGIN: '/login',
  LOGIN_2FA: '/login/2fa',
  REGISTER: '/register',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ENABLE_2FA: '/2fa/enable',
  VERIFY_2FA_SETUP: '/2fa/verify',
  DISABLE_2FA: '/2fa/disable',
  PROFILE: '/profile',
  UPDATE_PROFILE: '/profile',
  PREDICT: '/predict',
  HISTORY: '/history',
  HISTORY_SAVE: '/history/save',
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  REMEMBER_ME: 'remember_me',
};

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'CalorieTracker AI',
  VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0',
  TIMEOUT: 30000,
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_2FA: '/verify-2fa',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  HISTORY: '/history',
};