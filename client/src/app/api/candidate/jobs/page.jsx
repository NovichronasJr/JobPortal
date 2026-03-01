// "use client";
// import { useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Search, Filter, Hash, Sparkles, X } from "lucide-react";
// import { useCandidateJob } from "@/context/CandidateJobContext";
// import JobCard from "../../../../components/JobCard";
// import { useAuth } from "@/context/AuthContext";
// import JobDetailSlider from "../../../../components/JobDetailSlider";

// export default function JobsPage() {
//   const {user} = useAuth();
//   const { jobs, loading } = useCandidateJob();
//   const [selectedJob, setSelectedJob] = useState(null);
//   const BACKEND_URL = "http://localhost:8001";

//   // --- FILTER STATES ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [envFilter, setEnvFilter] = useState("All"); 
//   const [typeFilter, setTypeFilter] = useState("All");
//   const [stackFilter, setStackFilter] = useState("All");
//   const [preferredCategory, setPreferredCategory] = useState("All");

//   const candidate = { 
//     _id: user?.profile?._id, // Critical for the backend applyJob route
//     name: `${user?.profile?.firstName} ${user?.profile?.lastName}`, 
//     skills: user?.profile?.skills 
//       ? user.profile.skills.filter(Boolean).map(skill => skill.toUpperCase()) 
//       : [], 
  
//     experienceYears: user?.profile?.experienceYears || 0 
//   };
//   // --- DATA EXTRACTION ---
//   const { allCategories, allStacks } = useMemo(() => {
//     if (!jobs) return { allCategories: [], allStacks: [] };
//     const cats = [...new Set(jobs.flatMap(j => j.categories || []))].sort();
//     const stacks = [...new Set(jobs.flatMap(j => j.skills || []))].sort();
//     return { allCategories: cats, allStacks: stacks };
//   }, [jobs]);

//   // --- LIVE FILTER ENGINE ---
//   const filteredJobs = useMemo(() => {
//     if (!jobs) return [];
//     return jobs.filter((job) => {
//       const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                            job.recruiterId?.organizationName?.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesEnv = envFilter === "All" || job.workModel === envFilter;
//       const matchesType = typeFilter === "All" || job.workType === typeFilter;
//       const matchesStack = stackFilter === "All" || job.skills?.includes(stackFilter);
//       const matchesCategory = preferredCategory === "All" || job.categories?.includes(preferredCategory);

//       return matchesSearch && matchesEnv && matchesType && matchesStack && matchesCategory;
//     });
//   }, [searchQuery, envFilter, typeFilter, stackFilter, preferredCategory, jobs]);

//   if (loading) return <div className="p-10 text-slate-500 font-black animate-pulse uppercase tracking-[0.5em]">Syncing Marketplace...</div>;

//   return (
//     <div className="p-4 lg:p-10 bg-[#020617] min-h-screen relative selection:bg-indigo-500/30">
      
//       {/* HEADER WITH AI SYNC CHIP */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8 mb-10">
//         <div>
//           <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Marketplace</h1>
//           <p className="text-slate-500 mt-2 font-medium italic">Systems active. Monitoring {jobs.length} nodes.</p>
//         </div>

//         <AnimatePresence>
//           {preferredCategory !== "All" && (
//             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 pl-4 pr-2 py-2 rounded-2xl">
//                 <div className="flex items-center gap-2">
//                   <Sparkles size={14} className="text-indigo-400" />
//                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Sync: {preferredCategory}</span>
//                 </div>
//                 <button onClick={() => setPreferredCategory("All")} className="bg-indigo-500/20 hover:bg-indigo-500 text-indigo-200 hover:text-white p-1 rounded-lg transition-all"><X size={12} /></button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-10">
        
//         {/* SIDEBAR */}
//         <aside className="w-full lg:w-80 space-y-6">
//           <div className="sticky top-10 bg-slate-900/20 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
//             <div className="flex items-center justify-between mb-8">
//                <span className="flex items-center gap-2 text-white font-bold text-sm italic uppercase tracking-tighter"><Filter size={16} className="text-indigo-500" /> Constraints</span>
//                <button onClick={() => {setSearchQuery(""); setEnvFilter("All"); setTypeFilter("All"); setStackFilter("All"); setPreferredCategory("All");}} className="text-[10px] font-black text-slate-700 hover:text-white uppercase transition-colors">Reset</button>
//             </div>

//             <div className="space-y-8">
//               <FilterGroup title="Search">
//                 <div className="relative group">
//                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
//                   <input type="text" placeholder="Title, company..." className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
//                 </div>
//               </FilterGroup>

//               <FilterGroup title="Environment">
//                 <div className="flex flex-wrap gap-2">
//                   {["All", "Remote", "On-site", "Hybrid"].map(env => (
//                     <FilterChip key={env} label={env} active={envFilter === env} onClick={() => setEnvFilter(env)} />
//                   ))}
//                 </div>
//               </FilterGroup>

//               <FilterGroup title="Stack">
//                 <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
//                   <FilterChip label="All" active={stackFilter === "All"} onClick={() => setStackFilter("All")} />
//                   {allStacks.map(stack => (
//                     <FilterChip key={stack} label={stack} active={stackFilter === stack} onClick={() => setStackFilter(stack)} />
//                   ))}
//                 </div>
//               </FilterGroup>

//               <FilterGroup title="Work Type">
//                 <div className="flex flex-wrap gap-2">
//                   {["All", "Full-time", "Part-time", "Internship"].map(type => (
//                     <FilterChip key={type} label={type} active={typeFilter === type} onClick={() => setTypeFilter(type)} />
//                   ))}
//                 </div>
//               </FilterGroup>
//             </div>
//           </div>
//         </aside>

//         {/* FEED */}
//         <div className="flex-1 space-y-8">
//           {filteredJobs.length > 0 ? (
//             filteredJobs.map((job, idx) => (
//               <JobCard key={job._id} job={job} index={idx} onOpen={() => setSelectedJob(job)} backendUrl={BACKEND_URL} candidate={candidate}/>
//             ))
//           ) : (
//             <div className="py-32 text-center border border-white/5 rounded-[4rem] bg-white/[0.01]">
//                <Hash className="mx-auto text-slate-800 mb-6" size={48} />
//                <p className="text-slate-500 font-black italic uppercase tracking-widest text-xs">No Nodes Matching Search Parameters</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <AnimatePresence>
//         {selectedJob && (
//           <JobDetailSlider 
//             job={selectedJob} 
//             candidate={candidate} 
//             availableCategories={allCategories} 
//             onClose={() => setSelectedJob(null)}
//             onSetLocation={(loc) => setEnvFilter(loc)} 
//             onSetCategory={(cat) => setPreferredCategory(cat)} 
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Hash, Sparkles, X } from "lucide-react";
import { useCandidateJob } from "@/context/CandidateJobContext";
import JobCard from "../../../../components/JobCard";
import { useAuth } from "@/context/AuthContext";
import JobDetailSlider from "../../../../components/JobDetailSlider";

export default function JobsPage() {
  const { user } = useAuth();
  // --- ADDED appliedJobs AND refreshApplied FROM CONTEXT ---
  const { jobs, appliedJobs, loading, refreshApplied } = useCandidateJob();
  const [selectedJob, setSelectedJob] = useState(null);
  const BACKEND_URL = "http://localhost:8001";

  // --- 1. TRIGGER APPLICATION SYNC ON LOAD ---
  useEffect(() => {
    if (user?.profile?._id) {
      refreshApplied(user.profile._id);
    }
  }, [user?.profile?._id]);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [envFilter, setEnvFilter] = useState("All"); 
  const [typeFilter, setTypeFilter] = useState("All");
  const [stackFilter, setStackFilter] = useState("All");
  const [preferredCategory, setPreferredCategory] = useState("All");

  const candidate = { 
    _id: user?.profile?._id,
    name: `${user?.profile?.firstName} ${user?.profile?.lastName}`, 
    skills: user?.profile?.skills 
      ? user.profile.skills.filter(Boolean).map(skill => skill.toUpperCase()) 
      : [], 
    experienceYears: user?.profile?.experienceYears || 0 
  };

  // --- DATA EXTRACTION ---
  const { allCategories, allStacks } = useMemo(() => {
    if (!jobs) return { allCategories: [], allStacks: [] };
    const cats = [...new Set(jobs.flatMap(j => j.categories || []))].sort();
    const stacks = [...new Set(jobs.flatMap(j => j.skills || []))].sort();
    return { allCategories: cats, allStacks: stacks };
  }, [jobs]);

  // --- LIVE FILTER ENGINE ---
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job) => {
      const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           job.recruiterId?.organizationName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEnv = envFilter === "All" || job.workModel === envFilter;
      const matchesType = typeFilter === "All" || job.workType === typeFilter;
      const matchesStack = stackFilter === "All" || job.skills?.includes(stackFilter);
      const matchesCategory = preferredCategory === "All" || job.categories?.includes(preferredCategory);

      return matchesSearch && matchesEnv && matchesType && matchesStack && matchesCategory;
    });
  }, [searchQuery, envFilter, typeFilter, stackFilter, preferredCategory, jobs]);

  if (loading) return <div className="p-10 text-slate-500 font-black animate-pulse uppercase tracking-[0.5em]">Syncing Marketplace...</div>;

  return (
    <div className="p-4 lg:p-10 bg-[#020617] min-h-screen relative selection:bg-indigo-500/30">
      
      {/* HEADER WITH AI SYNC CHIP */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8 mb-10">
        <div>
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Marketplace</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Systems active. Monitoring {jobs.length} nodes.</p>
        </div>

        <AnimatePresence>
          {preferredCategory !== "All" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 pl-4 pr-2 py-2 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Sync: {preferredCategory}</span>
                </div>
                <button onClick={() => setPreferredCategory("All")} className="bg-indigo-500/20 hover:bg-indigo-500 text-indigo-200 hover:text-white p-1 rounded-lg transition-all"><X size={12} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="sticky top-10 bg-slate-900/20 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <span className="flex items-center gap-2 text-white font-bold text-sm italic uppercase tracking-tighter"><Filter size={16} className="text-indigo-500" /> Constraints</span>
               <button onClick={() => {setSearchQuery(""); setEnvFilter("All"); setTypeFilter("All"); setStackFilter("All"); setPreferredCategory("All");}} className="text-[10px] font-black text-slate-700 hover:text-white uppercase transition-colors">Reset</button>
            </div>

            <div className="space-y-8">
              <FilterGroup title="Search">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                  <input type="text" placeholder="Title, company..." className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </FilterGroup>

              <FilterGroup title="Environment">
                <div className="flex flex-wrap gap-2">
                  {["All", "Remote", "On-site", "Hybrid"].map(env => (
                    <FilterChip key={env} label={env} active={envFilter === env} onClick={() => setEnvFilter(env)} />
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title="Stack">
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  <FilterChip label="All" active={stackFilter === "All"} onClick={() => setStackFilter("All")} />
                  {allStacks.map(stack => (
                    <FilterChip key={stack} label={stack} active={stackFilter === stack} onClick={() => setStackFilter(stack)} />
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title="Work Type">
                <div className="flex flex-wrap gap-2">
                  {["All", "Full-time", "Part-time", "Internship"].map(type => (
                    <FilterChip key={type} label={type} active={typeFilter === type} onClick={() => setTypeFilter(type)} />
                  ))}
                </div>
              </FilterGroup>
            </div>
          </div>
        </aside>

        {/* FEED */}
        <div className="flex-1 space-y-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, idx) => {
              // --- 2. THE APPLIED CHECK ---
              // Check if the current job ID is in the user's appliedJobs list
              const isApplied = appliedJobs.some(app => 
                (app.jobId?._id || app.jobId) === job._id
              );

              return (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  index={idx} 
                  onOpen={() => setSelectedJob(job)} 
                  backendUrl={BACKEND_URL} 
                  candidate={candidate}
                  isApplied={isApplied} // Passing the new prop
                />
              )
            })
          ) : (
            <div className="py-32 text-center border border-white/5 rounded-[4rem] bg-white/[0.01]">
               <Hash className="mx-auto text-slate-800 mb-6" size={48} />
               <p className="text-slate-500 font-black italic uppercase tracking-widest text-xs">No Nodes Matching Search Parameters</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <JobDetailSlider 
            job={selectedJob} 
            candidate={candidate} 
            availableCategories={allCategories} 
            onClose={() => setSelectedJob(null)}
            onSetLocation={(loc) => setEnvFilter(loc)} 
            onSetCategory={(cat) => setPreferredCategory(cat)} 
            // --- 3. DISABLE SLIDER ACTIONS IF ALREADY APPLIED ---
            isApplied={appliedJobs.some(app => (app.jobId?._id || app.jobId) === selectedJob._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return <div className="space-y-4"><h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">{title}</h4>{children}</div>;
}
function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all duration-300 ${active ? "bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/40" : "bg-slate-950 border-white/5 text-slate-500 hover:border-white/10"}`}>{label}</button>
  );
}
