import { useEffect } from "react";

export default function AdminDashboard() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/dashboard/administrator");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="text-lg font-black text-slate-950">Opening Administrator Dashboard…</div>
        <p className="mt-2 text-sm text-slate-500">Please wait.</p>
      </div>
    </div>
  );
}
