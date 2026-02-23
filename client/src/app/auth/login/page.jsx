"use client";
import { useState } from "react";
import {cookieSetter} from "@/lib/cookiesetter"; 
import { useRouter } from "next/navigation";
import { User, Briefcase, Lock, Mail } from "lucide-react"; // npm install lucide-react

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");

  async function handleSubmit(e) {
    e.preventDefault();
    if (password === "test@123456") {
      try {
        await cookieSetter({ name: "test", email, role });
        router.replace("/");
      } catch (err) {
        console.error("Session error", err);
      }
    } else {
      alert("Invalid credentials. Please check the research log for mock passwords.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-indigo-950 px-4">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full z-10 space-y-8 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-indigo-600/20 border border-indigo-500/30 mb-4">
            <Briefcase className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-400">
            Access your Decision Companion Dashboard
          </p>
        </div>

        {/* Role Selector */}
        <div className="relative flex p-1 bg-slate-800/50 rounded-xl border border-slate-700">
          <button
            onClick={() => setRole("candidate")}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === "candidate" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" /> Candidate
          </button>
          <button
            onClick={() => setRole("recruiter")}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === "recruiter" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Recruiter
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transform transition-all active:scale-[0.98] focus:ring-2 focus:ring-indigo-500/50"
          >
            Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account? <span className="text-indigo-400 cursor-pointer hover:underline">Create one</span>
          </p>
        </form>
      </div>
    </div>
  );
}