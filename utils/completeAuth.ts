import { jwtDecode } from "jwt-decode";
import type { NextRouter } from "next/router";
import api from "./api";

// Extracted from the existing pages/auth/login.tsx flow so Google sign-in
// produces exactly the same app state as normal password login — same
// localStorage keys, same suspended-account check, same role-based
// redirect. Normal login.tsx is untouched; this is purely additive.
export async function completeAuth(access: string, refresh: string | undefined, router: NextRouter) {
  const payload: any = jwtDecode(access);

  const role = payload.role || "author";
  const username = payload.username || "";
  const fullName = payload.full_name || "";
  const accountStatus = payload.account_status || "active";

  if (accountStatus !== "active") {
    localStorage.removeItem("rmsjToken");
    throw new Error("Your RSRE account has been suspended. Please contact an administrator.");
  }

  localStorage.setItem("rmsjToken", access);
  if (refresh) localStorage.setItem("rmsjRefresh", refresh);
  localStorage.setItem("rmsjRole", role);
  localStorage.setItem("rmsjUsername", username);
  localStorage.setItem("rmsjFullName", fullName);

  api.get("/profile/").then((profileResponse) => {
    localStorage.setItem("rmsjUser", JSON.stringify(profileResponse.data));
    window.dispatchEvent(new Event("rmsj-auth-changed"));
  }).catch(() => {
    window.dispatchEvent(new Event("rmsj-auth-changed"));
  });
  window.dispatchEvent(new Event("rmsj-auth-changed"));

  if (role === "administrator") return router.replace("/rsre-admin");
  if (role === "author" || role === "reader") return router.replace("/dashboard");
  if (role === "reviewer") return router.replace("/dashboard/reviewer");
  if (role === "editor") return router.replace("/dashboard/editor");
  if (role === "editor_in_chief") return router.replace("/dashboard/editor-in-chief");
  return router.replace("/");
}
