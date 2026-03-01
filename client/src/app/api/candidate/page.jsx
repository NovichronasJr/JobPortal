"use client";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCandidateJob } from "@/context/CandidateJobContext";
import { 
  Sparkles, Zap, Target, ArrowRight, 
  BrainCircuit, Clock, Loader2, Info, TrendingUp,
  Bell, CheckCircle2, Video, X
} from "lucide-react";
import Link from "next/link";

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
  const { user, loading: authLoading } = useAuth();
  
  // --- CONSUME CONTEXT ---
  const { 
    jobs = [], 
    appliedJobs = [], 
    notifications = [], 
    markAsRead,
    loading: jobsLoading 
  } = useCandidateJob();
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // --- 1. THE DIFFERENTIAL MATCH ENGINE ---
  const topMatches = useMemo(() => {
    if (!jobs.length || !user?.profile) return [];

    const appliedJobIds = appliedJobs.map(app => 
      (app.jobId?._id || app.jobId).toString()
    );

    const candidateSkills = user.profile.skills?.map(s => s.toUpperCase()) || [];
    const candidateExp = user.profile.experienceYears || 0;

    const availableJobs = jobs.filter(job => !appliedJobIds.includes(job._id.toString()));

    const scoredJobs = availableJobs.map(job => {
      const jobSkills = job.skills?.map(s => s.toUpperCase()) || [];
      const matched = candidateSkills.filter(s => jobSkills.includes(s)).length;
      const totalSkills = job.skills?.length || 1;
      
      const reqExp = parseInt(job.experience) || 0;
      const expDiff = candidateExp - reqExp;
      const expScore = expDiff >= 0 ? 10 : Math.max(0, 10 + expDiff);

      const score = Math.min(100, Math.round(((matched * 10) + (expScore * 4)) / ((totalSkills * 10) + 40) * 100));
      return { ...job, calculatedMatch: score };
    });

    return scoredJobs.sort((a, b) => b.calculatedMatch - a.calculatedMatch).slice(0, 3);
  }, [jobs, user?.profile, appliedJobs]);

  // --- 2. LIVE TELEMETRY (STATS) ---
  const stats = useMemo(() => {
    const inReview = appliedJobs.filter(app => ["Applied", "Pending", "Interviewing"].includes(app.status)).length;
    const totalScore = appliedJobs.reduce((acc, curr) => acc + (curr.aiScore || 0), 0);
    const avgScore = appliedJobs.length > 0 ? (totalScore / appliedJobs.length).toFixed(1) : "9.2";

    return {
        totalApps: appliedJobs.length,
        inReview: inReview,
        decisionScore: avgScore
    };
  }, [appliedJobs]);

  // --- 3. IDENTITY HYDRATION ---
  const imageUrl = useMemo(() => {
    const rawPath = user?.profile?.profilePhoto;
    if (!rawPath) return `${BACKEND_URL}/default_pics/candidate.jpg`;
    return rawPath.startsWith("http") 
      ? rawPath 
      : `${BACKEND_URL}/${rawPath.replace(/\\/g, "/")}`;
  }, [user, BACKEND_URL]);

  const firstName = user?.profile?.firstName || user?.name?.split(" ")[0] || "Candidate";
  const lastName = user?.profile?.lastName || "";

  if (authLoading || jobsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="w-12 h-12 text-indigo-500" />
        </motion.div>
        <p className="mt-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Neural Data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants} 
      className="relative p-6 lg:p-12 space-y-12 bg-[#020617] min-h-screen selection:bg-indigo-500/30 overflow-x-hidden"
    >
      
      {/* --- HERO SECTION --- */}
      <motion.header variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-[2.2rem] blur-md opacity-20 animate-pulse" />
            <div className="relative w-28 h-28 rounded-[2rem] bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl">
              <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 border-4 border-[#020617] rounded-full shadow-lg z-20" />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">{firstName}</span> <span className="text-indigo-500">{lastName}</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium italic">
              AI Engine has identified <span className="text-white">{topMatches.length} high-potential nodes</span> for your stack.
            </p>
          </div>
        </div>
        
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 rounded-[2rem] border border-slate-800/50 shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <BrainCircuit size={24} />
          </div>
          <div className="pr-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">Decision Engine</p>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-2 italic uppercase">
               Market-Ready <Sparkles size={14} />
            </p>
          </div>
        </div>
      </motion.header>

      {/* --- ANALYTICS GRID --- */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Market Fit Score" value={stats.decisionScore} sub="Neural Calibration" icon={<TrendingUp className="text-indigo-400" />} />
        <StatCard title="Active Syncs" value={stats.totalApps} sub={`${stats.inReview} in Review`} icon={<Zap className="text-amber-400" />} />
        <StatCard title="Identity Reach" value="High" sub="Top Tier Visibility" icon={<Target className="text-emerald-400" />} />
      </motion.div>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-4">
        
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 uppercase italic tracking-tighter">
              New Elite Matches <Sparkles size={22} className="text-indigo-500" />
            </h2>
            <Link href="/api/candidate/jobs" className="group text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-all flex items-center gap-2">
              Explore Marketplace <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {topMatches.length > 0 ? (
                topMatches.map((job) => (
                    <JobMatchCard key={job._id} job={job} backendUrl={BACKEND_URL} />
                ))
            ) : (
                <div className="p-20 text-center border border-dashed border-slate-800 rounded-[3rem] bg-white/[0.01]">
                    <p className="text-slate-600 font-black uppercase tracking-widest text-xs italic">All optimal matches currently synced.</p>
                </div>
            )}
          </div>
        </motion.div>

        <motion.aside variants={itemVariants} className="space-y-8">
          <h2 className="text-2xl font-bold text-white tracking-tighter uppercase italic px-2">Companion Insights</h2>
          <div className="bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent border border-indigo-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clock size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Insight</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed italic">
                Scanning your match history... You have extreme traction in nodes requiring **{user?.profile?.skills?.[0] || 'Modern Web'}** architecture.
              </p>
              
              <div className="p-5 bg-slate-950/60 rounded-3xl border border-slate-800/80">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-3">Market Demand Index</p>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "82%" }} className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400" />
                </div>
              </div>

              <Link href="/api/candidate/profile" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                Optimize My Profile
              </Link>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* --- FLOATING NOTIFICATION PULSE --- */}
      <NotificationPulse notifications={notifications} markAsRead={markAsRead} />

    </motion.div>
  );
}

// --- SUB-COMPONENTS ---

function NotificationPulse({ notifications, markAsRead }) {
  const activeAlerts = notifications.filter(n => !n.read).slice(0, 3);
  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 w-full max-w-[380px] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeAlerts.map((alert) => (
          <motion.div
            key={alert._id}
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            className="pointer-events-auto group relative"
          >
            <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-2xl flex gap-4 items-start">
              <div className={`p-3 rounded-2xl border ${
                alert.title.includes("OFFER") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                alert.title.includes("Sync") ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                "bg-slate-800 border-white/5 text-slate-400"
              }`}>
                {alert.title.includes("OFFER") ? <Sparkles size={18} /> : 
                 alert.title.includes("Sync") ? <Video size={18} /> : 
                 <Bell size={18} />}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex justify-between">
                  {alert.title} <X size={12} className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => markAsRead(alert._id)}/>
                </h4>
                <p className="text-[11px] text-slate-400 italic leading-snug">{alert.message}</p>
                <div className="pt-3 flex gap-3">
                  <button onClick={() => markAsRead(alert._id)} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Acknowledge</button>
                  {alert.link && <Link href={alert.link} className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 flex items-center gap-1">View Node <ArrowRight size={10}/></Link>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, sub, icon }) {
  return (
    <motion.div whileHover={{ y: -8 }} className="p-8 bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
      <div className="flex justify-between items-start mb-6">
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-indigo-500/30 transition-colors">{icon}</div>
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{title}</span>
      </div>
      <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter">{value}</h3>
      <p className="text-[10px] text-indigo-400 mt-3 font-black uppercase tracking-widest">{sub}</p>
    </motion.div>
  );
}

function JobMatchCard({ job, backendUrl }) {
  const company = job.recruiterId?.organizationName || "Elite Corp";
  return (
    <motion.div whileHover={{ x: 10 }} className="p-6 bg-slate-900/20 border border-slate-800/50 rounded-[2.2rem] flex items-center justify-between group transition-all hover:bg-slate-900/40">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
          {job.recruiterId?.organizationLogo ? <img src={`${backendUrl}/${job.recruiterId.organizationLogo}`} className="w-full h-full object-cover" /> : <span className="text-slate-800 font-black text-2xl">{company[0]}</span>}
        </div>
        <div>
          <h4 className="font-bold text-white text-xl uppercase italic tracking-tight">{job.title}</h4>
          <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1.5"><Info size={12} className="text-indigo-500"/> {company}</span>
            <span className="text-indigo-400/80">{job.workType}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Match Index</p>
          <span className="text-emerald-400 font-black text-2xl italic tracking-tighter">{job.calculatedMatch}%</span>
        </div>
        <Link href={`/api/candidate/jobs`} className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <ArrowRight size={24} />
        </Link>
      </div>
    </motion.div>
  );
}