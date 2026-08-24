import axios from "axios";

const configuredBase =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://rsre-backend.onrender.com/api";

const API_BASE = configuredBase
  .replace(/\/$/, "")
  .endsWith("/api")
  ? configuredBase.replace(/\/$/, "")
  : `${configuredBase.replace(/\/$/, "")}/api`;

export const API_ORIGIN = API_BASE.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("rmsjToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export function absoluteUrl(path) {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${
    path.startsWith("/") ? path : `/${path}`
  }`;
}

export async function fetchLatestArticles(limit = 10) {
  const response = await api.get(
    `/articles/?page_size=${limit}`
  );

  const data = response.data;

  return Array.isArray(data)
    ? data
    : data.results || [];
}

export async function fetchArticle(id) {
  const response = await api.get(`/articles/${id}/`);
  return response.data;
}

export default api;
