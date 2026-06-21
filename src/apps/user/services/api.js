export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3030'
).replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message;
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return data;
}

export function getUploadUrl(folder, fileName) {
  if (!fileName) return null;
  if (/^https?:\/\//i.test(fileName)) return fileName;
  if (fileName.startsWith('/')) return `${API_URL}${fileName}`;
  return `${API_URL}/uploads/${folder}/${fileName}`;
}
