export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3030'
).replace(/\/$/, '');

const DEFAULT_TIMEOUT_MS = 10000;

export async function apiRequest(path, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Server is taking too long to respond');
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message;
    const error = new Error(message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getUploadUrl(folder, fileName) {
  if (!fileName) return null;
  if (/^https?:\/\//i.test(fileName)) return fileName;
  if (fileName.startsWith('/')) return `${API_URL}${fileName}`;
  return `${API_URL}/uploads/${folder}/${fileName}`;
}
