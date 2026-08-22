import axios from "axios";

const configuredBase =
  process.env.NEXT_PUBLIC_API_URL || "/api";

const cleanBase = configuredBase.replace(/\/+$/, "");

const API_BASE = cleanBase.endsWith("/api")
  ? cleanBase
  : `${cleanBase}/api`;

export const API_ORIGIN = API_BASE.endsWith("/api")
  ? API_BASE.slice(0, -4)
  : API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("rmsjToken") ||
        localStorage.getItem("access") ||
        localStorage.getItem("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

async function refreshAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const refreshToken =
    localStorage.getItem("rmsjRefresh");

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE}/auth/token/refresh/`,
        {
          refresh: refreshToken,
        },
        {
          timeout: 8000,
        }
      )
      .then((response) => {
        const access = response.data?.access;

        if (!access) {
          throw new Error("No access token returned.");
        }

        localStorage.setItem("rmsjToken", access);

        return access;
      })
      .catch((error) => {
        [
          "rmsjToken",
          "rmsjRefresh",
          "rmsjRefreshToken",
          "rmsjRole",
          "rmsjUsername",
          "rmsjFullName",
          "rmsjUser",
        ].forEach((key) =>
          localStorage.removeItem(key)
        );

        window.dispatchEvent(
          new Event("rmsj-auth-changed")
        );

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes(
        "/auth/token/"
      )
    ) {
      return Promise.reject(error);
    }

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const refreshToken =
      localStorage.getItem("rmsjRefresh");

    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccess =
        await refreshAccessToken();

      if (!newAccess) {
        return Promise.reject(error);
      }

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccess}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export function absoluteUrl(path) {
  if (!path) return "";

  const value = String(path);

  // Django development responses may contain localhost/127.0.0.1
  // media URLs. Rewrite those to the actual API origin so public
  // images work correctly on Render and other deployed environments.
  if (
    /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(value)
  ) {
    const rewritten = value.replace(
      /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i,
      API_ORIGIN
    );

    return rewritten;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_ORIGIN}${
    value.startsWith("/")
      ? value
      : `/${value}`
  }`;
}

export async function fetchLatestArticles(
  limit = 10
) {
  const response = await api.get(
    `/articles/?is_published=true&page_size=${limit}`
  );

  return response.data;
}

export async function fetchArticle(id) {
  const response = await api.get(
    `/articles/${id}/`
  );

  return response.data;
}

export default api;


