export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rmsjToken");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rmsjRefresh");
}

export function getRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rmsjRole");
}

export function getUsername() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rmsjUsername");
}

export function getFullName() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rmsjFullName");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("rmsjUser");
  if (!user) return null;
  try { return JSON.parse(user); } catch { return null; }
}

export function getCurrentUser() {
  return getUser();
}

export function logout() {
  if (typeof window === "undefined") return;
  ["rmsjToken","rmsjRefresh","rmsjRefreshToken","rmsjRole","rmsjUsername","rmsjFullName","rmsjUser"].forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event("rmsj-auth-changed"));
}
