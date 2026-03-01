"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Briefcase, FileCheck, 
  UserCircle, LogOut, ChevronRight, Sparkles 
} from "lucide-react";
import { deleteCookie } from "@/lib/cookiesetter";

export default function CandidateSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // 1. Backend Asset Configuration
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // 2. Image Logic (Consistent with Dashboard)
  const imageUrl = useMemo(() => {
    const rawPath = user?.profile?.profilePhoto;
    if (!rawPath) return `${BACKEND_URL}/default_pics/candidate.jpg`;
    return rawPath.startsWith("http") 
      ? rawPath 
      : `${BACKEND_URL}/${rawPath.replace(/\\/g, "/")}`;
  }, [user, BACKEND_URL]);

  const navItems = [
    { name: "Dashboard", href: "/api/candidate", icon: <LayoutDashboard size={20} /> },
    { name: "Browse Jobs", href: "/api/candidate/jobs", icon: <Briefcase size={20} /> },
    { name: "Applied Jobs", href: "/api/candidate/applied", icon: <FileCheck size={20} /> },
    { name: "My Profile", href: "/api/candidate/profile", icon: <UserCircle size={20} /> },
    { name: "Interviews", href: "/api/candidate/interviews", icon: <UserCircle size={20} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#020617]/80 backdrop-blur-2xl border-r border-slate-800/60 p-6 flex flex-col justify-between hidden lg:flex z-50">
      
      <div>
        {/* --- BRANDING LOGO --- */}
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={22} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">Companion</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Decision AI</p>
          </div>
        </div>

        {/* --- NAVIGATION --- */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="relative block group">
                {/* Active Background Glow */}
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-indigo-500/10 border-l-2 border-indigo-500 rounded-r-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 relative z-10 ${
                  isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-200"
                }`}>
                  <div className="flex items-center gap-4">
                    <span className={`${isActive ? "text-indigo-400" : "group-hover:text-indigo-400 transition-colors"}`}>
                      {item.icon}
                    </span>
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- USER IDENTITY FOOTER --- */}
      <div className="space-y-4">
        <div className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-3xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
             <img 
               src={imageUrl} 
               alt="Avatar" 
               className="w-full h-full object-cover"
               onError={(e) => (e.target.src = `${BACKEND_URL}/default_pics/candidate.jpg`)}
             />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate capitalize">
              {user?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
              {user?.role}
            </p>
          </div>
        </div>

        <button 
          onClick={() => deleteCookie()} 
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400/70 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 font-bold text-sm group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>End Session</span>
        </button>
      </div>
    </aside>
  );
}