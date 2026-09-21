import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import { completeAuth } from "../utils/completeAuth";

declare global {
  interface Window {
    google?: any;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "478335657501-4j1vm1o46as48agboalmh6cdj8j1953l.apps.googleusercontent.com";

console.log(
  "Google Client ID configured:",
  Boolean(CLIENT_ID)
);
// This component simply doesn't render anything if Google sign-in isn't
// configured â€” per the explicit requirement not to show "Continue with
// Google" advertising a feature that can't actually work. Set
// NEXT_PUBLIC_GOOGLE_CLIENT_ID (frontend, public/safe) and
// GOOGLE_CLIENT_ID (backend, same value) to enable it.
export default function GoogleSignInButton() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setError("Could not load Google sign-in. Check your connection.");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!CLIENT_ID || !scriptReady || !window.google?.accounts?.id || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError("");
        try {
          const tokenResponse = await api.post("/auth/google/", { credential: response.credential });
          const { access, refresh } = tokenResponse.data || {};
          if (!access) throw new Error("Google sign-in did not return an access token.");
          await completeAuth(access, refresh, router);
        } catch (err: any) {
          const detail = err?.response?.data?.detail;
          setError(typeof detail === "string" ? detail : "Google sign-in failed. Please try again.");
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
    });

    // Also offer One Tap, but never block the page if it's dismissed/unavailable.
    try { window.google.accounts.id.prompt(); } catch { /* One Tap is optional */ }
  }, [scriptReady, router]);

  if (!CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div className="my-4 flex items-center gap-3 text-xs font-semibold text-graphite-400">
        <div className="h-px flex-1 bg-graphite-200" /> OR <div className="h-px flex-1 bg-graphite-200" />
      </div>
      <div ref={buttonRef} className="flex justify-center" />
      {error && <p className="mt-2 text-center text-sm text-clay-700">{error}</p>}
    </div>
  );
}

