import { useEffect } from "react";
import { useRouter } from "next/router";

export default function FounderPage(){
  const router = useRouter();
  useEffect(()=>{ router.replace("/about#founding-team"); },[router]);
  return <div className="min-h-screen flex items-center justify-center text-slate-600">Opening the RSJH founding team…</div>;
}
