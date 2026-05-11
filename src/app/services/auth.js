import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from './config';

const TOKEN_KEY = '@oficina:access_token';
const REFRESH_KEY = '@oficina:refresh_token';

let listeners = [];

function notifyListeners(isAuthenticated) {
  listeners.forEach(listener => listener(isAuthenticated));
}

export const authService = {
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  async login(username, password) {
    const res = await axios.post(`${BASE_URL}/auth/token/`, { username, password });
    await AsyncStorage.setItem(TOKEN_KEY, res.data.access);
    await AsyncStorage.setItem(REFRESH_KEY, res.data.refresh);
    notifyListeners(true);
    return res.data;
  },

  async logout() {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
    notifyListeners(false);
  },

  async getAccessToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_KEY);
  },

  async refreshTokens() {
    const refresh = await AsyncStorage.getItem(REFRESH_KEY);
    if (!refresh) throw new Error('No refresh token');

    const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
    await AsyncStorage.setItem(TOKEN_KEY, res.data.access);
    await AsyncStorage.setItem(REFRESH_KEY, res.data.refresh);
    return res.data.access;
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },
};
