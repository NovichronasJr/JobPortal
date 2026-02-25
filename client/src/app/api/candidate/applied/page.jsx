"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
Clock,
  XCircle, MessageSquare, Calendar, ChevronRight 
} from "lucide-react";

const APPLIED_JOBS = [
  {
    id: "app_1",
    role: "Full Stack Developer",
    company: "Vonnue Innovations",
    appliedDate: "Feb 22, 2026",
    status: "Interviewing",
    matchScore: "98%",
    nextStep: "Technical Round on Feb 26",
    logo: "VN"
  },
  {
    id: "app_2",
    role: "Backend Engineer",
    company: "TechNova Solutions",
    appliedDate: "Feb 18, 2026",
    status: "Pending",
    matchScore: "85%",
    nextStep: "Awaiting recruiter review",
    logo: "TN"
  },
  {
    id: "app_3",
    role: "MERN Intern",
    company: "Pixel Perfect",
    appliedDate: "Feb 10, 2026",
    status: "Rejected",
    matchScore: "72%",
    nextStep: "Better luck next time!",
    logo: "PP"
  }
];

export default function AppliedJobs() {
  return (
    <div className="p-6 lg:p-12 space-y-10 bg-[#020617] min-h-screen">
      
      {/* --- HEADER --- */}
      <header>
        <h1 className="text-4xl font-black text-white tracking-tighter">Application Tracker</h1>
        <p className="text-slate-500 mt-2 font-medium">Monitor your journey and upcoming milestones.</p>
      </header>

      {/* --- PIPELINE SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusStat label="Total" count={APPLIED_JOBS.length} color="indigo" />
        <StatusStat label="Interviewing" count={1} color="emerald" />
        <StatusStat label="Pending" count={1} color="amber" />
        <StatusStat label="Rejected" count={1} color="slate" />
      </div>

      {/* --- APPLICATIONS LIST --- */}
      <div className="space-y-4">
        {APPLIED_JOBS.map((app, idx) => (
          <ApplicationCard key={app.id} app={app} index={idx} />
        ))}
      </div>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

function ApplicationCard({ app, index }) {
  const statusStyles = {
    Interviewing: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Rejected: "text-slate-500 bg-slate-500/10 border-slate-500/20",
  };

  const StatusIcon = {
    Interviewing: <MessageSquare size={14} />,
    Pending: <Clock size={14} />,
    Rejected: <XCircle size={14} />,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-slate-900/20 border border-slate-800/50 p-6 rounded-[2rem] hover:bg-slate-900/40 hover:border-indigo-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
    >
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-slate-700 group-hover:text-indigo-400 transition-colors">
          {app.logo}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{app.role}</h3>
          <p className="text-sm text-slate-500 font-medium">{app.company}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 flex-1 lg:ml-12">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Applied On</p>
          <p className="text-sm text-slate-300 font-bold flex items-center gap-2">
            <Calendar size={14} className="text-indigo-500" /> {app.appliedDate}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Match Score</p>
          <p className="text-sm text-white font-black italic">{app.matchScore}</p>
        </div>
        <div className="hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Next Step</p>
          <p className="text-xs text-slate-400 font-medium truncate max-w-[150px]">{app.nextStep}</p>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-slate-800/50 pt-4 lg:pt-0">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${statusStyles[app.status]}`}>
          {StatusIcon[app.status]} {app.status}
        </span>
        <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function StatusStat({ label, count, color }) {
  const colors = {
    indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
    emerald: "border-emerald-500/20 bg-emerald-400/5 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-400/5 text-amber-400",
    slate: "border-slate-700 bg-slate-800/10 text-slate-500"
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex items-center justify-between`}>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-xl font-black">{count}</span>
    </div>
  );
}