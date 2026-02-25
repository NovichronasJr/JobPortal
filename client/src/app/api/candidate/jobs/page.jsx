"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Briefcase, Filter, 
  DollarSign, Sparkles, ChevronRight, Hash, TrendingUp, Info 
} from "lucide-react";
import { dummyJobs } from "@/constants/const";

export default function JobsPage() {
  // --- 1. STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedTech, setSelectedTech] = useState([]);

  // --- 2. DYNAMIC TECH STACK EXTRACTION ---
  // This automatically pulls unique skills from your database/dummy data
  const availableTechStacks = useMemo(() => {
    const allSkills = dummyJobs.flatMap(job => job.techStack || []);
    return [...new Set(allSkills)].sort();
  }, []);

  // --- 3. FILTER ENGINE ---
  const filteredJobs = useMemo(() => {
    return dummyJobs.filter((job) => {
      // Keyword Search
      const matchesSearch = job.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Work Mode Filter
      const matchesType = selectedType === "All" || job.type === selectedType;
      
      // Tech Stack Intersection (Matches if job has ALL selected skills)
      const matchesTech = selectedTech.length === 0 || 
                          selectedTech.every(tech => job.techStack?.includes(tech));

      return matchesSearch && matchesType && matchesTech;
    });
  }, [searchQuery, selectedType, selectedTech]);

  return (
    <div className="p-4 lg:p-10 space-y-8 bg-[#020617] min-h-screen selection:bg-indigo-500/30">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter">Marketplace</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Curated opportunities based on your Decision Profile.</p>
        </div>
        <div className="flex gap-3">
           <MarketStat label="Total Roles" value={dummyJobs.length} color="indigo" />
           <MarketStat label="Matches" value={filteredJobs.length} color="emerald" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* --- SIDEBAR: FILTER ENGINE --- */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="sticky top-10 bg-slate-900/20 backdrop-blur-3xl border border-slate-800/40 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <span className="flex items-center gap-2 text-white font-bold text-sm">
                 <Filter size={16} className="text-indigo-500" /> Parameters
               </span>
               <button 
                 onClick={() => {setSearchQuery(""); setSelectedType("All"); setSelectedTech([]);}}
                 className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
               >
                 Reset
               </button>
            </div>

            <div className="space-y-8">
              <FilterGroup title="Keyword Search">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search roles..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-indigo-500/50 outline-none transition-all text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </FilterGroup>

              <FilterGroup title="Environment">
                <div className="flex flex-wrap gap-2">
                  {["All", "Remote", "On-site", "Hybrid"].map(type => (
                    <FilterChip key={type} label={type} active={selectedType === type} onClick={() => setSelectedType(type)} />
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title="Technology">
                <div className="flex flex-wrap gap-2">
                  {availableTechStacks.map(tech => (
                    <button 
                      key={tech}
                      onClick={() => setSelectedTech(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech])}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        selectedTech.includes(tech) 
                        ? "bg-indigo-500 border-indigo-400 text-white" 
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT: JOB FEED --- */}
        <div className="flex-1 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => (
                <JobCard key={job.id} job={job} index={idx} />
              ))
            ) : (
              /* --- PROFESSIONAL EMPTY STATE --- */
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 px-6 bg-slate-900/10 border border-slate-800/50 rounded-[3.5rem] text-center backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Hash className="w-10 h-10 text-slate-700 opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-2">No Opportunities Found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                    Your current filters are a bit too specific. Try expanding your search or clearing your parameters to discover more roles.
                  </p>
                  <button 
                    onClick={() => {setSearchQuery(""); setSelectedType("All"); setSelectedTech([]);}}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* --- REUSABLE SUB-COMPONENTS --- */

function JobCard({ job, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-slate-900/20 backdrop-blur-md border border-slate-800/50 p-6 md:p-8 rounded-[2.5rem] hover:bg-slate-900/40 hover:border-indigo-500/30 transition-all cursor-pointer"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl font-black text-slate-700 group-hover:text-indigo-500 transition-all shadow-inner">
            {job.company[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">{job.role}</h2>
               <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 uppercase">New Post</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-indigo-400"/> {job.company}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-400"/> {job.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-1">Decision Score</p>
              <div className="flex items-center gap-2 justify-end text-emerald-400 font-black text-xl italic">
                94% <Sparkles size={16} className="text-indigo-400" />
              </div>
           </div>
           <button className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all shadow-xl">
              <ChevronRight size={24} />
           </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge text={job.stipend} icon={<DollarSign size={12} />} active />
          <Badge text={job.type} icon={<TrendingUp size={12} />} />
          {job.techStack?.map(tech => (
            <span key={tech} className="px-3 py-1 bg-slate-950/40 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-500 group-hover:border-slate-700 uppercase transition-all">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-[11px] font-black uppercase tracking-widest">
           <Info size={12} className="text-indigo-500/50" /> AI Insights Available
        </div>
      </div>
    </motion.div>
  );
}

function MarketStat({ label, value, color }) {
  const styles = color === "indigo" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  return (
    <div className={`px-5 py-2 rounded-xl border ${styles} flex flex-col items-center min-w-[120px]`}>
      <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">{label}</span>
      <span className="text-xl font-extrabold leading-none mt-1">{value}</span>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{title}</h4>
      {children}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
        active ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function Badge({ text, icon, active }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${
      active ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-500"
    }`}>
      {icon} {text}
    </div>
  );
}