"use client";
import React, { useState, useMemo } from "react";
import { useRecruiterJob } from "@/context/RecruiterJobContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Users, Target, 
  Calendar, ArrowUpRight, Search, Filter, 
  RotateCcw, X, AlertCircle, RefreshCw,
} from "lucide-react";

// --- THE NEURAL CATEGORY CONSTANT ---
const JOB_CATEGORIES = [
  "Software Developer", "Frontend Development", "Backend Development",
  "Full Stack Development", "Mobile App Development", "Cybersecurity",
  "Data Analyst", "Data Scientist", "Machine Learning Engineer",
  "Cloud Architect", "DevOps Engineer", "UI/UX Designer",
  "Product Manager", "Embedded Systems", "Blockchain Developer",
  "Quality Assurance (QA)"
];

export default function RecruiterJobs() {
  const { jobs, loading, count, refreshJobs } = useRecruiterJob();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // --- 1. FILTER & SEARCH STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- 2. RESET FUNCTION ---
  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setCategoryFilter("All");
  };

  // --- 3. NEURAL SEARCH ENGINE ---
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job) => {
      const matchesName = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      // Deep category check: ensures it matches the specific JOB_CATEGORIES array
      const matchesCategory = categoryFilter === "All" || job.categories?.some(cat => cat === categoryFilter);
      const matchesDate = !dateFilter || new Date(job.closingDate) <= new Date(dateFilter);
      
      return matchesName && matchesCategory && matchesDate;
    });
  }, [jobs, searchTerm, dateFilter, categoryFilter]);

  // --- 4. DEADLINE EXTENSION PROTOCOL ---
  const handleExtendDeadline = async (jobId, currentClosingDate) => {
    try {
      const newDate = new Date(currentClosingDate);
      newDate.setDate(newDate.getDate() + 7);

      const res = await fetch(`${BACKEND_URL}/api/recruiter/extend-job/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newClosingDate: newDate }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) refreshJobs(); 
    } catch (err) {
      console.error("Neural Sync Failure during extension:", err);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="p-10 lg:p-16 max-w-[1600px] mx-auto min-h-screen selection:bg-indigo-500/30">
      
      {/* --- HEADER & COMMAND MATRIX --- */}
      <header className="space-y-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
              Job<span className="text-indigo-500">.Vault</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold italic">
              Monitoring <span className="text-white underline decoration-indigo-500 underline-offset-4">{count}</span> verified mission briefs.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-all" size={18} />
                <input 
                    type="text"
                    placeholder="Search Requisitions..."
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-black uppercase tracking-widest focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-14 px-6 rounded-2xl border flex items-center gap-3 transition-all ${isFilterOpen ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-indigo-500'}`}
            >
                <Filter size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Filters</span>
            </button>
          </div>
        </div>

        {/* --- EXPANDABLE PROFESSIONAL FILTER PANEL --- */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: -20 }} 
              animate={{ height: "auto", opacity: 1, y: 0 }} 
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="p-8 bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {/* Category Dropdown */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <Target size={12} /> Skill Cluster
                    </label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Sectors</option>
                      {JOB_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                 </div>

                 {/* Date Selector */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} /> Closing Before
                    </label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-indigo-500 invert-[0.8] brightness-200"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                 </div>

                 {/* Reset Actions */}
                 <div className="flex flex-col justify-end">
                    <button 
                      onClick={resetFilters}
                      className="w-full py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-400 hover:border-rose-400/30 transition-all flex items-center justify-center gap-2 group"
                    >
                      <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Reset Matrix
                    </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- ACTIVE FILTERS BADGES --- */}
      {(searchTerm || categoryFilter !== "All" || dateFilter) && (
        <div className="flex flex-wrap gap-3 mb-8">
           {categoryFilter !== "All" && <FilterBadge label={categoryFilter} onClear={() => setCategoryFilter("All")} />}
           {dateFilter && <FilterBadge label={`Before ${dateFilter}`} onClear={() => setDateFilter("")} />}
           {searchTerm && <FilterBadge label={`Search: ${searchTerm}`} onClear={() => setSearchTerm("")} />}
        </div>
      )}

      {/* --- REQUISITION GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredJobs.length > 0 ? filteredJobs.map((job, index) => {
          const currentApps = job.applicantCount || 0;
          const maxSeats = job.maxSeats || 1;
          const isUnderStaffed = currentApps < maxSeats;
          
          return (
            <motion.div 
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group h-full flex flex-col"
            >
              <div className="relative h-full flex flex-col bg-slate-950/80 backdrop-blur-3xl border border-slate-800/50 rounded-[3rem] overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/5">
                
                {/* Brand Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                  <div className="w-20 h-20 rounded-[1.8rem] bg-white overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-700">
                    <img 
                        src={`${BACKEND_URL}/${job.recruiterId?.organizationLogo}`} 
                        className="w-full h-full object-cover" 
                        alt="Brand" 
                        onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=" + job.title}
                    />
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors ${
                      isUnderStaffed ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isUnderStaffed ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                        {isUnderStaffed ? `${maxSeats - currentApps} Seats Left` : 'Optimal Node'}
                    </span>
                  </div>
                </div>

                {/* Role Title */}
                <div className="px-8 py-4 flex-grow">
                  <h3 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase italic line-clamp-2 min-h-[4.5rem] group-hover:text-indigo-400 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.categories?.slice(0, 3).map(cat => (
                      <span key={cat} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">{cat}</span>
                    ))}
                  </div>
                </div>

                {/* --- EXTENSION TRIGGER --- */}
                {isUnderStaffed && (
                    <div className="px-6 pb-2">
                        <button 
                            onClick={() => handleExtendDeadline(job._id, job.closingDate)}
                            className="w-full py-4 bg-amber-500/5 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-black transition-all group/btn"
                        >
                            <RotateCcw size={12} className="group-hover/btn:rotate-180 transition-transform duration-500" /> Extend Sync (+7 Days)
                        </button>
                    </div>
                )}

                {/* Stats Bento */}
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/30 rounded-[2rem] p-4 border border-slate-800/30">
                    <MetaItem icon={<Users size={12}/>} label={`${currentApps} / ${maxSeats} Candidates`} />
                    <MetaItem icon={<Calendar size={12}/>} label={new Date(job.closingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} />
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 pt-0">
                  <Link href={`/api/recruiter/openings/${job._id}`} className="block">
                    <button className="w-full py-6 bg-slate-950 border border-slate-800/80 rounded-[2rem] flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)]">
                      Launch Decision Engine <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        }) : (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-800 rounded-[4rem] bg-slate-900/10">
                <AlertCircle className="mx-auto text-slate-800 mb-6" size={48} />
                <h3 className="text-xl font-black text-slate-600 uppercase italic">No matching requisitions found</h3>
            </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FilterBadge({ label, onClear }) {
  return (
    <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-3 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
      {label}
      <button onClick={onClear} className="hover:text-white transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

function MetaItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/50">
      <div className="text-indigo-500/70">{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{label}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-20 h-20 border-t-2 border-indigo-500 rounded-full animate-spin" />
      <p className="mt-8 text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] animate-pulse">Syncing Vault...</p>
    </div>
  );
}