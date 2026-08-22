import axios from "axios";

const configuredBase =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

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


// =====================================================
// REQUEST INTERCEPTOR
// Automatically attaches access token
// =====================================================

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("rmsjToken");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// =====================================================
// TOKEN REFRESH
// =====================================================

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
        }
      )
      .then((response) => {
        const newAccessToken =
          response.data.access;

        if (!newAccessToken) {
          throw new Error(
            "No access token returned."
          );
        }

        localStorage.setItem(
          "rmsjToken",
          newAccessToken
        );

        return newAccessToken;
      })
      .catch((error) => {

        localStorage.removeItem(
          "rmsjToken"
        );

        localStorage.removeItem(
          "rmsjRefresh"
        );

        localStorage.removeItem(
          "rmsjRole"
        );

        localStorage.removeItem(
          "rmsjUsername"
        );

        localStorage.removeItem(
          "rmsjFullName"
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


// =====================================================
// RESPONSE INTERCEPTOR
// Automatically refreshes expired access token
// =====================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest =
      error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }


    // Never refresh the login/refresh endpoints
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

      const newAccessToken =
        await refreshAccessToken();


      if (!newAccessToken) {
        return Promise.reject(error);
      }


      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      return api(originalRequest);

    } catch (refreshError) {

      if (
        !window.location.pathname.startsWith(
          "/auth/"
        )
      ) {
        window.location.href =
          "/auth/login";
      }

      return Promise.reject(
        refreshError
      );
    }
  }
);


// =====================================================
// URL HELPER
// =====================================================

export function absoluteUrl(path) {

  if (!path) {
    return "";
  }

  if (
    /^https?:\/\//i.test(path)
  ) {
    return path;
  }

  return `${API_ORIGIN}${
    path.startsWith("/")
      ? path
      : `/${path}`
  }`;
}


// =====================================================
// ARTICLE HELPERS
// =====================================================

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
