"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, Zap, Target, ArrowRight, 
  BrainCircuit, Clock, Loader2, Info, TrendingUp 
} from "lucide-react";
import Link from "next/link";

// --- DUMMY DATA FOR MATCHES (To be replaced by API call later) ---
const RECENT_MATCHES = [
  { id: 1, role: "Senior MERN Developer", company: "Vonnue Innovations", match: "98%", logo: "VN", type: "Remote" },
  { id: 2, role: "Full Stack Engineer", company: "MetaGrid", match: "89%", logo: "MG", type: "Hybrid" },
  { id: 3, role: "Backend Intern (Node.js)", company: "CloudScale", match: "82%", logo: "CS", type: "On-site" },
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function CandidateDashboard() {
  const { user, loading } = useAuth();
  
  // 1. Environment Configuration
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // 2. Dynamic Image & Identity Logic
  const imageUrl = useMemo(() => {
    const rawPath = user?.profile_pic;
    if (!rawPath) return `${BACKEND_URL}/default_pics/candidate.jpg`;
    return rawPath.startsWith("http") 
      ? rawPath 
      : `${BACKEND_URL}/${rawPath.replace(/\\/g, "/")}`;
  }, [user, BACKEND_URL]);

  const displayName = user?.name || user?.email?.split("@")[0] || "Candidate";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-indigo-500" />
        </motion.div>
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing DNA...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 lg:p-12 space-y-12 bg-[#020617] min-h-screen selection:bg-indigo-500/30"
    >
      
      {/* --- HERO SECTION --- */}
      <motion.header variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar with Custom Squircle Shape */}
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-[2.2rem] blur-md opacity-20 animate-pulse" />
            <div className="relative w-28 h-28 rounded-[2rem] bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl">
              <img 
                src={imageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = `${BACKEND_URL}/default_pics/candidate.jpg`)}
              />
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 border-4 border-[#020617] rounded-full shadow-lg z-20" />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent capitalize">{displayName}</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              Your AI Companion has analyzed <span className="text-white">24+ new data points</span> today.
            </p>
          </div>
        </div>
        
        {/* Analysis Status Floating Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 rounded-[2rem] border border-slate-800/50 shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <BrainCircuit size={24} />
          </div>
          <div className="pr-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">Decision Engine</p>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
               Profile Optimized <Sparkles size={14} />
            </p>
          </div>
        </div>
      </motion.header>

      {/* --- ANALYTICS GRID --- */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Decision Score" value={user?.candidate?.profile_strength || "9.2"} sub="High Market Fit" icon={<TrendingUp className="text-indigo-400" />} />
        <StatCard title="Active Applications" value="14" sub="4 in Review" icon={<Zap className="text-amber-400" />} />
        <StatCard title="Recruiter Views" value="86" sub="+12% this week" icon={<Target className="text-emerald-400" />} />
      </motion.div>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-4">
        
        {/* Left Column: Intelligence Matches */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Elite AI Matches <Sparkles size={22} className="text-indigo-500" />
            </h2>
            <Link href="/api/candidate/jobs" className="group text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-all flex items-center gap-2">
              Explore All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {RECENT_MATCHES.map((job) => (
              <JobMatchCard key={job.id} job={job} />
            ))}
          </div>
        </motion.div>

        {/* Right Column: Companion Insights */}
        <motion.aside variants={itemVariants} className="space-y-8">
          <h2 className="text-2xl font-bold text-white tracking-tight px-2">Companion Insights</h2>
          <div className="bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent border border-indigo-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clock size={18} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Strategy Update</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Recruiters for **{user?.role === 'candidate' ? 'MERN' : 'Tech'}** roles are currently prioritizing candidates with **Next.js 15 Server Actions**.
              </p>
              
              <div className="p-5 bg-slate-950/60 rounded-3xl border border-slate-800/80">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-3">Market Demand Index</p>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "82%" }} 
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
                  />
                </div>
              </div>

              <Link href="/api/candidate/profile" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-center text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                Optimize My Profile
              </Link>
            </div>
          </div>
        </motion.aside>

      </div>
    </motion.div>
  );
}

// --- SUB-COMPONENTS (ENCAPSULATED FOR READABILITY) ---

function StatCard({ title, value, sub, icon }) {
  return (
    <motion.div whileHover={{ y: -8 }} className="p-8 bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{title}</span>
      </div>
      <h3 className="text-5xl font-black text-white relative z-10">{value}</h3>
      <p className="text-xs text-indigo-400 mt-3 font-bold uppercase tracking-widest relative z-10">{sub}</p>
    </motion.div>
  );
}

function JobMatchCard({ job }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01, x: 10 }}
      className="p-6 bg-slate-900/20 backdrop-blur-sm border border-slate-800/50 rounded-[2.2rem] flex items-center justify-between group transition-all hover:bg-slate-900/40 hover:border-indigo-500/20"
    >
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-800 border border-slate-800 group-hover:text-indigo-500 group-hover:border-indigo-500/30 transition-all shadow-inner">
          {job.logo}
        </div>
        <div>
          <h4 className="font-bold text-white text-xl tracking-tight leading-none mb-2 group-hover:text-indigo-300 transition-colors">
            {job.role}
          </h4>
          <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Info size={12} /> {job.company}</span>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <span className="text-indigo-400/80">{job.type}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Match Index</p>
          <span className="text-emerald-400 font-black text-2xl italic tracking-tighter">{job.match}</span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-600/20 transition-all">
          <ArrowRight size={24} />
        </div>
      </div>
    </motion.div>
  );
}