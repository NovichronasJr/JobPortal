"use client";
import React from "react";
import { useRecruiterJob } from "@/context/RecruiterJobContext";
import { motion } from "framer-motion";
import { 
  MapPin, Clock, Users, 
  Target, Briefcase, 
  Sparkles, Calendar,
  ArrowUpRight, Globe
} from "lucide-react";

export default function RecruiterJobs() {
  const { jobs, loading, count } = useRecruiterJob();
  const BACKEND_URL = "http://localhost:8001";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-indigo-500/20 rounded-full animate-ping absolute" />
          <div className="w-20 h-20 border-t-2 border-indigo-500 rounded-full animate-spin" />
        </div>
        <p className="mt-8 text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] animate-pulse">Synchronizing Neural Inventory</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] mx-10 border-2 border-dashed border-slate-800/50 rounded-[4rem] bg-slate-900/10 backdrop-blur-sm">
        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-700 shadow-inner mb-8">
          <Briefcase size={48} />
        </div>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Zero Requisitions Found</h3>
        <p className="text-slate-500 text-sm mt-3 font-medium opacity-60">Your active pipeline is currently inactive.</p>
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-16 max-w-[1600px] mx-auto min-h-screen">
      {/* HEADER: PRO STYLE */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-500 mb-2">
             <Sparkles size={18} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live Database</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
            Job<span className="text-indigo-500">.Vault</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold italic tracking-wide">
            Overseeing <span className="text-white underline decoration-indigo-500 underline-offset-4">{count}</span> specialized mission briefs.
          </p>
        </div>
        
        <button className="h-14 px-8 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all duration-500 flex items-center gap-3">
          Filter Inventory <ArrowUpRight size={16} />
        </button>
      </header>

      {/* THE BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {jobs.map((job, index) => (
          <motion.div 
            key={job._id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
            className="group relative"
          >
            {/* BACKGROUND GLOW EFFECT */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative bg-slate-950/80 backdrop-blur-3xl border border-slate-800/50 rounded-[3rem] overflow-hidden transition-all duration-500 group-hover:border-indigo-500/40 group-hover:translate-y-[-8px]">
              
              {/* TOP SECTION: THE BEAUTIFUL LOGO CONTAINER */}
              <div className="p-8 pb-0 flex justify-between items-start">
                <div className="w-20 h-20 rounded-[1.8rem] bg-white relative overflow-hidden shadow-[0_10px_40px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-700">
                  <img 
                    src={`${BACKEND_URL}/${job.recruiterId?.organizationLogo}` || "/placeholder.png"} 
                    alt="Brand" 
                    className="w-full h-full object-cover" // CHANGED: Now takes up the whole container
                  />
                  {/* Subtle inner overlay to keep branding looking crisp */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
                </div>
                
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                   </div>
                   <span className="mt-2 text-[9px] font-bold text-slate-700 uppercase tracking-widest">#{job._id.slice(-6)}</span>
                </div>
              </div>

              {/* CENTER SECTION: TITLES */}
              <div className="px-8 py-8 space-y-4">
                <h3 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase italic group-hover:text-indigo-400 transition-colors">
                  {job.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.categories?.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-slate-900 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] rounded-lg border border-slate-800 group-hover:border-indigo-500/20 group-hover:text-slate-300 transition-colors">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* METADATA: BENTO STYLE INFOGRAPHIC */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2 bg-slate-900/30 rounded-[2rem] p-4 border border-slate-800/30">
                  <MetaItem icon={<MapPin size={12}/>} label={job.location} />
                  <MetaItem icon={<Globe size={12}/>} label={job.workModel} />
                  <MetaItem icon={<Users size={12}/>} label={`${job.applicants?.length || 0} Candidates`} />
                  <MetaItem icon={<Calendar size={12}/>} label={new Date(job.closingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="p-4 pt-0">
                <button className="w-full py-6 bg-slate-950 border border-slate-800/80 rounded-[2rem] flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)]">
                  Launch Engine <Target size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Sub-component for clean metadata rendering
function MetaItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/50">
      <div className="text-indigo-500/70">{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{label}</span>
    </div>
  );
}