"use client";
import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRecruiterJob } from "@/context/RecruiterJobContext"; // <--- CONSUMING CONTEXT
import { 
  Sparkles, Zap, Target, ArrowRight, 
  BrainCircuit, Clock, Loader2, Info, TrendingUp,
  Briefcase, Users, Star, LayoutDashboard
} from "lucide-react";
import Link from "next/link";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function RecruiterDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { jobs, loading: jobsLoading, count: activeJobsCount } = useRecruiterJob();
  const [pipelineData, setPipelineData] = useState([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // --- 1. FETCH FULL PIPELINE TELEMETRY ---
  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/recruiter/pipeline`, { credentials: 'include' });
        const result = await res.json();
        if (result.success) setPipelineData(result.pipeline);
      } catch (err) { console.error("Pipeline Sync Error:", err); }
      finally { setPipelineLoading(false); }
    };
    fetchPipeline();
  }, [BACKEND_URL]);

  // --- 2. CALCULATE LIVE METRICS ---
  const stats = useMemo(() => {
    const totalApplicants = pipelineData.length;
    const highMatches = pipelineData.filter(app => app.aiScore >= 85).length;
    const pendingInterviews = pipelineData.filter(app => app.status === "Interviewing").length;

    return {
      total: totalApplicants,
      elite: highMatches,
      interviews: pendingInterviews
    };
  }, [pipelineData]);

  // --- 3. FILTER DECISION STREAM (TOP 3 RECENT CANDIDATES) ---
  const decisionStream = useMemo(() => {
    return [...pipelineData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [pipelineData]);

  const imageUrl = useMemo(() => {
    const rawPath = user?.profile?.organizationLogo;
    if (!rawPath) return `${BACKEND_URL}/default_pics/recruiter.jpg`;
    return rawPath.startsWith("http") ? rawPath : `${BACKEND_URL}/${rawPath.replace(/\\/g, "/")}`;
  }, [user, BACKEND_URL]);

  if (authLoading || jobsLoading || pipelineLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#020617]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="w-12 h-12 text-indigo-500" />
        </motion.div>
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Synchronizing Recruiter Console...</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 lg:p-12 space-y-12 bg-[#020617] min-h-screen">
      
      {/* --- HERO SECTION --- */}
      <motion.header variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2.2rem] blur-md opacity-20 animate-pulse" />
            <div className="relative w-28 h-28 rounded-[2rem] bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl">
              <img src={imageUrl} alt="Org Logo" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-indigo-500 border-4 border-[#020617] rounded-full z-20" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">
              Recruiter<span className="text-indigo-500">.Console</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium italic">
              Hello, <span className="text-white capitalize">{user?.name}</span>. Your {activeJobsCount} active openings are yielding <span className="text-emerald-400">high-fit results</span>.
            </p>
          </div>
        </div>
        <div className="bg-slate-900/40 p-5 rounded-[2rem] border border-slate-800/50 shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20"><BrainCircuit size={24} /></div>
          <div className="pr-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">Decision Engine</p>
            <p className="text-sm font-bold text-indigo-400 flex items-center gap-2 italic">Pipeline Optimized <Sparkles size={14} /></p>
          </div>
        </div>
      </motion.header>

      {/* --- ANALYTICS GRID --- */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Openings" value={activeJobsCount} sub="Live Market Nodes" icon={<Briefcase className="text-blue-400" />} />
        <StatCard title="Total Applicants" value={stats.total} sub="Verified Identities" icon={<Users className="text-indigo-400" />} />
        <StatCard title="AI Elite Matches" value={stats.elite} sub="90%+ Neural Fit" icon={<Zap className="text-emerald-400" />} />
        <StatCard title="Live Interviews" value={stats.interviews} sub="Active Syncs" icon={<Star className="text-amber-400" />} />
      </motion.div>

      {/* --- MAIN CONTENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 italic uppercase tracking-tighter">Decision Stream <Sparkles size={22} className="text-indigo-500" /></h2>
            <Link href="/recruiter/pipeline-hub" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 flex items-center gap-2">Manage Pipeline <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-4">
            {decisionStream.length > 0 ? decisionStream.map((app) => (
              <ApplicantCard key={app._id} applicant={app} backendUrl={BACKEND_URL} />
            )) : (
              <div className="p-20 text-center border border-dashed border-slate-800 rounded-[3rem] bg-white/[0.01]">
                <p className="text-slate-600 font-black uppercase tracking-widest text-xs italic">No applicants in current stream.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.aside variants={itemVariants} className="space-y-8">
          <h2 className="text-2xl font-bold text-white tracking-tighter px-2 uppercase italic">Hiring Insights</h2>
          <div className="bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent border border-indigo-500/20 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-2 text-indigo-400 mb-4">
              <TrendingUp size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Insight</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed italic mb-6">
              AI suggests reviewing **{decisionStream[0]?.candidateId?.firstName || 'MERN'}**’s profile. Their match score indicates they are a high-tier asset for your current openings.
            </p>
            <Link href="/recruiter/post-job" className="block w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">Post New Node</Link>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}

// --- REFINED SUB-COMPONENTS ---

function StatCard({ title, value, sub, icon }) {
  return (
    <motion.div whileHover={{ y: -8 }} className="p-8 bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
      <div className="flex justify-between items-start mb-6">
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-indigo-500/30 transition-colors">{icon}</div>
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{title}</span>
      </div>
      <h3 className="text-5xl font-black text-white italic tracking-tighter">{value}</h3>
      <p className="text-[10px] text-indigo-400 mt-3 font-black uppercase tracking-widest">{sub}</p>
    </motion.div>
  );
}

function ApplicantCard({ applicant, backendUrl }) {
  const firstName = applicant.candidateId?.firstName || "Candidate";
  return (
    <motion.div whileHover={{ x: 10 }} className="p-6 bg-slate-900/20 border border-slate-800/50 rounded-[2.2rem] flex items-center justify-between group transition-all hover:bg-slate-900/40">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 overflow-hidden">
          <img src={`${backendUrl}/${applicant.candidateId?.profilePhoto}`} className="w-full h-full object-cover" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${firstName}`} />
        </div>
        <div>
          <h4 className="font-bold text-white text-xl uppercase italic tracking-tight">{firstName} {applicant.candidateId?.lastName}</h4>
          <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1.5"><Briefcase size={12} /> {applicant.jobId?.title}</span>
            <span className="text-indigo-400/80">{applicant.status}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">AI Match</p>
          <span className="text-emerald-400 font-black text-2xl italic tracking-tighter">{applicant.aiScore}%</span>
        </div>
        <Link href={`/recruiter/pipeline-hub`} className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <ArrowRight size={24} />
        </Link>
      </div>
    </motion.div>
  );
}