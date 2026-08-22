import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      router.replace("/dashboard/administrator");
    }
  }, [router.isReady]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="text-lg font-black text-slate-950">Opening Administrator Dashboard…</div>
        <p className="mt-2 text-sm text-slate-500">Please wait.</p>
      </div>
    </main>
  );
}
