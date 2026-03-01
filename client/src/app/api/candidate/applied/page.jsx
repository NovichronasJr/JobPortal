"use client";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, XCircle, MessageSquare, Calendar, 
  ChevronRight, Hash, Zap, Loader2, ShieldCheck 
} from "lucide-react";
import { useCandidateJob } from "@/context/CandidateJobContext";

export default function AppliedJobs() {
  const { appliedJobs, loading } = useCandidateJob();
  const BACKEND_URL = "http://localhost:8001";

  // --- 1. DYNAMIC STATS CALCULATION ---
  const stats = useMemo(() => {
    return {
      total: appliedJobs.length,
      interviewing: appliedJobs.filter(app => app.status === "Interviewing").length,
      pending: appliedJobs.filter(app => ["Applied", "Pending", "Shortlisted"].includes(app.status)).length,
      rejected: appliedJobs.filter(app => app.status === "Rejected").length,
    };
  }, [appliedJobs]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  return (
    <div className="p-6 lg:p-12 space-y-10 bg-[#020617] min-h-screen">
      
      {/* --- HEADER (Renders Instantly) --- */}
      <header>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Application<span className="text-indigo-500">.Tracker</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium italic">
          {loading ? "Calibrating history matrix..." : `Monitoring your journey through ${appliedJobs.length} active nodes.`}
        </p>
      </header>

      {/* --- PIPELINE SUMMARY (Stable Layout) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusStat label="Total Nodes" count={stats.total} color="indigo" loading={loading} />
        <StatusStat label="Interviewing" count={stats.interviewing} color="emerald" loading={loading} />
        <StatusStat label="Pending Sync" count={stats.pending} color="amber" loading={loading} />
        <StatusStat label="Terminated" count={stats.rejected} color="slate" loading={loading} />
      </div>

      {/* --- APPLICATIONS LIST AREA --- */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {loading ? (
            // --- SKELETON LOADERS (Prevents Layout Jumps) ---
            <motion.div 
              key="skeleton-view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-full bg-slate-900/40 border border-white/5 rounded-[2rem] animate-pulse" />
              ))}
            </motion.div>
          ) : appliedJobs.length > 0 ? (
            // --- ACTUAL CONTENT ---
            <motion.div 
              key="content-view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {appliedJobs.map((app, idx) => (
                <ApplicationCard 
                  key={app._id} app={app} index={idx} 
                  formatDate={formatDate} backendUrl={BACKEND_URL}
                />
              ))}
            </motion.div>
          ) : (
            // --- EMPTY STATE ---
            <motion.div 
              key="empty-view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-32 text-center border border-dashed border-white/5 rounded-[4rem]"
            >
               <Hash className="mx-auto text-slate-800 mb-6" size={48} />
               <p className="text-slate-500 font-black italic uppercase tracking-widest text-xs">No active applications detected in the matrix.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

function StatusStat({ label, count, color, loading }) {
  const colors = {
    indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
    emerald: "border-emerald-500/20 bg-emerald-400/5 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-400/5 text-amber-400",
    slate: "border-slate-700 bg-slate-800/10 text-slate-500"
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-500 ${colors[color]} flex items-center justify-between`}>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 italic">{label}</span>
      {loading ? (
        <Loader2 size={16} className="animate-spin opacity-40" />
      ) : (
        <span className="text-xl font-black italic">{count}</span>
      )}
    </div>
  );
}

function ApplicationCard({ app, index, formatDate, backendUrl }) {
  const statusStyles = {
    Interviewing: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Shortlisted: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    Applied: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Rejected: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    Hired: "text-emerald-500 bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  };

  const StatusIcon = {
    Interviewing: <MessageSquare size={14} />,
    Shortlisted: <Zap size={14} />,
    Applied: <Clock size={14} />,
    Pending: <Clock size={14} />,
    Rejected: <XCircle size={14} />,
    Hired: <ShieldCheck size={14} />
  };

  const companyName = app.jobId?.recruiterId?.organizationName || "Elite Corp";
  const companyLogo = app.jobId?.recruiterId?.organizationLogo;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-slate-900/20 border border-slate-800/50 p-6 rounded-[2.5rem] hover:bg-slate-900/40 hover:border-indigo-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
    >
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
          {companyLogo ? (
            <img src={`${backendUrl}/${companyLogo}`} className="w-full h-full object-cover" alt="logo" />
          ) : (
            <span className="text-slate-800 font-black text-xl">{companyName[0]}</span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors uppercase italic tracking-tight">
            {app.jobId?.title || "Role Syncing..."}
          </h3>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{companyName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 flex-1 lg:ml-12">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Applied Node</p>
          <p className="text-xs text-slate-300 font-bold flex items-center gap-2 italic">
            <Calendar size={12} className="text-indigo-500" /> {formatDate(app.appliedAt)}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Neural Match</p>
          <p className="text-sm text-white font-black italic">{app.aiScore}%</p>
        </div>
        <div className="hidden lg:block text-right lg:text-left">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Current Protocol</p>
          <p className="text-[10px] text-slate-400 font-bold italic truncate uppercase">
             {app.status === "Interviewing" ? "Active Technical Sync" : "Awaiting Screening"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-slate-800/50 pt-4 lg:pt-0">
        <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${statusStyles[app.status] || statusStyles.Pending}`}>
          {StatusIcon[app.status] || StatusIcon.Pending} {app.status}
        </span>
        <button className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}