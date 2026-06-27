import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './api';
export const getToken = () => SecureStore.getItemAsync('auth_token');
export async function authenticatedRequest(path, options = {}) { const token = await getToken(); if (!token) throw new Error('Please log in again'); return apiRequest(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } }); }
export const sendOtp = (phone) => apiRequest('/auth/phone/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
export async function verifyOtp(challengeToken, otp) { const data = await apiRequest('/auth/phone/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeToken, otp }) }); await SecureStore.setItemAsync('auth_token', data.token); await SecureStore.setItemAsync('auth_user', JSON.stringify(data.user)); return data; }
export async function logout() { await SecureStore.deleteItemAsync('auth_token'); await SecureStore.deleteItemAsync('auth_user'); }
