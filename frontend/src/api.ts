import { User, Category, Post, Notification } from './types';

export const API_BASE_URL = 'http://www.reachwithusnow.com/api';

function getToken(): string | null {
  return localStorage.getItem('reachwithus_user_token');
}

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = text;
  }

  if (!res.ok) {
    const errorMsg = data?.message || (typeof data === 'string' ? data : `API error ${res.status}`);
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  return data as T;
}

// Upload file helper
export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = data?.message || (typeof data === 'string' ? data : `Image upload failed (${res.status})`);
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data as { url: string; filename: string };
}
