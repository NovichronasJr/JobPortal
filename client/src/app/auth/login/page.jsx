"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion , AnimatePresence} from "framer-motion";
import { User, Briefcase, Lock, Mail, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cookieSetter } from "@/lib/cookiesetter";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); 

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
     
      const response = await fetch("http://localhost:8001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

     
      await cookieSetter({ 
        token: data.token, 
        user: data.user 
      });

      
      router.replace("/");
      
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[45%] h-[45%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-6 shadow-inner">
            <Briefcase className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-3">
            Welcome back
          </h1>
          <p className="text-slate-400">Step into your Decision Companion</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-8 rounded-3xl shadow-2xl shadow-black/50">
          
          {/* Error Message Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role Toggle Switch */}
          <div className="relative flex p-1 bg-slate-950/50 rounded-2xl border border-slate-800 mb-8">
            <motion.div 
              layout
              className="absolute inset-1 w-[calc(50%-4px)] bg-indigo-600 rounded-xl shadow-lg"
              animate={{ x: role === "candidate" ? 0 : "100%" }}
            />
            <button
              onClick={() => setRole("candidate")}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors z-10 ${role === "candidate" ? "text-white" : "text-slate-500"}`}
            >
              <User className="w-4 h-4" /> Candidate
            </button>
            <button
              onClick={() => setRole("recruiter")}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors z-10 ${role === "recruiter" ? "text-white" : "text-slate-500"}`}
            >
              <Briefcase className="w-4 h-4" /> Recruiter
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-slate-200"
                    placeholder="amit@vonnue.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-slate-200"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-white shadow-xl shadow-indigo-900/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link href="/auth/signup" replace>
                <span className="text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300 transition-colors">
                  Create one now
                </span>
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}