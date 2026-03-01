// "use client";
// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Sparkles, User, BrainCircuit, ChevronDown, 
//   ArrowLeft, FileText, GraduationCap, 
//   Target, Zap, X, ExternalLink, Code2, Loader2
// } from "lucide-react";

// export default function JobApplication() {
//   const { Job_Id } = useParams();
//   const router = useRouter();
  
//   // --- 1. NEURAL SANITIZER ---
//   const cleanJobId = Job_Id?.startsWith(":") ? Job_Id.slice(1) : Job_Id;

//   const [data, setData] = useState({ applications: [], jobTitle: "" });
//   const [loading, setLoading] = useState(true);
//   const [expandedId, setExpandedId] = useState(null); 
//   const [viewingResume, setViewingResume] = useState(null); 
//   const [updatingId, setUpdatingId] = useState(null); 
  
//   const BACKEND_URL = "http://localhost:8001";

//   // --- 2. DATA FETCHING ---
//   useEffect(() => {
//     const fetchApplicants = async () => {
//       try {
//         const res = await fetch(`${BACKEND_URL}/api/recruiter/applications/${cleanJobId}`, {
//           credentials: 'include'
//         });
//         const result = await res.json();
//         if (result.success) setData(result);
//       } catch (err) {
//         console.error("Neural Fetch Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (cleanJobId) fetchApplicants();
//   }, [cleanJobId]);

//   // --- 3. DECISION HANDLER (SHORTLIST ONLY) ---
//   const handleShortlist = async (appId) => {
//     setUpdatingId(appId);
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/recruiter/applications/status/${appId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: "Shortlisted" }),
//         credentials: "include",
//       });
//       const result = await res.json();
      
//       if (result.success) {
//         setData(prev => ({
//           ...prev,
//           applications: prev.applications.map(app => 
//             app._id === appId ? { ...app, status: "Shortlisted" } : app
//           )
//         }));
//       }
//     } catch (err) {
//       console.error("Neural Sync Error:", err);
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const toggleDropdown = (id) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
//       <BrainCircuit className="animate-pulse text-indigo-500 mb-4" size={40} />
//       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Synchronizing Neural Requisitions</p>
//     </div>
//   );

//   return (
//     <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-10 bg-[#020617] min-h-screen text-slate-200 selection:bg-indigo-500/30">
      
//       {/* --- HEADER --- */}
//       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
//         <div className="space-y-2">
//           <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
//             <ArrowLeft size={14} /> Back to Vault
//           </button>
//           <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
//             Decision<span className="text-indigo-500">.Center</span>
//           </h1>
//           <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 mt-2">
//             Target Node: <span className="text-white italic">{data.jobTitle || "Syncing..."}</span>
//           </div>
//         </div>

//         <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 flex items-center gap-6 shadow-2xl">
//           <div className="text-right">
//             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Syncs</p>
//             <p className="text-3xl font-black text-white italic">{data.applications.length}</p>
//           </div>
//           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
//             <Target size={24} />
//           </div>
//         </div>
//       </header>

//       {/* --- APPLICANT FEED --- */}
//       <div className="space-y-6">
//         {data.applications.map((app, idx) => {
//           const isExpanded = expandedId === app._id;
//           const isShortlisted = app.status === "Shortlisted";
//           const c = app.candidateId;

//           return (
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
//               key={app._id} 
//               className={`bg-slate-950/50 border rounded-[3rem] overflow-hidden transition-all duration-500 ${
//                 isShortlisted ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : 
//                 isExpanded ? 'border-indigo-500/40 shadow-2xl shadow-indigo-500/5' : 'border-slate-800/50 hover:border-slate-700'
//               }`}
//             >
//               {/* --- MAIN CARD BAR --- */}
//               <div 
//                 className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
//                 onClick={() => toggleDropdown(app._id)}
//               >
//                 <div className="flex items-center gap-6">
//                   <div className="relative">
//                     <div className={`w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden border-2 ${isShortlisted ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-700'}`}>
//                       <img 
//                         src={`${BACKEND_URL}/${c.profilePhoto}`} 
//                         className="w-full h-full object-cover" 
//                         alt="Avatar" 
//                         onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=" + c.firstName + "&background=0D1117&color=fff"} 
//                       />
//                     </div>
//                     {isShortlisted && (
//                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-black border-4 border-[#020617]">
//                         <Zap size={10} fill="black" />
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-white uppercase italic tracking-tight leading-none mb-1">
//                       {c.firstName} {c.lastName}
//                     </h3>
//                     <div className="flex items-center gap-4">
//                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{c.experienceYears} Years Exp</span>
//                       {isShortlisted && <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] italic animate-pulse">Neural Link Established</span>}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-10">
//                   <div className="text-right">
//                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Decision Score</p>
//                     <div className={`text-2xl font-black italic flex items-center gap-2 ${isShortlisted ? 'text-emerald-400' : 'text-slate-200'}`}>
//                       {app.aiScore}% <Sparkles size={16} className="text-indigo-500" />
//                     </div>
//                   </div>
//                   <div className={`w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`}>
//                     <ChevronDown size={20} />
//                   </div>
//                 </div>
//               </div>

//               {/* --- DROPDOWN CONTENT --- */}
//               <AnimatePresence>
//                 {isExpanded && (
//                   <motion.div 
//                     initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
//                     className="border-t border-white/5 bg-slate-900/20"
//                   >
//                     <div className="p-8 lg:p-12">
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
//                         {/* Summary & Skills */}
//                         <div className="space-y-8">
//                           <div>
//                             <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><User size={12} /> Candidate Summary</h4>
//                             <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-indigo-500/30 pl-6">{c.bio || "No summary node provided."}</p>
//                           </div>
//                           <div>
//                             <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><Code2 size={12} /> Technical Profile</h4>
//                             <div className="flex flex-wrap gap-2">
//                               {c.skills?.map(skill => (
//                                 <span key={skill} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{skill}</span>
//                               ))}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Education & Assets */}
//                         <div className="space-y-8">
//                           <div>
//                             <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><GraduationCap size={12} /> Academic Nodes</h4>
//                             <div className="space-y-4">
//                               {c.education?.map((edu, i) => (
//                                 <div key={i} className="flex justify-between items-start">
//                                   <div>
//                                     <p className="text-white font-bold text-sm uppercase italic">{edu.degree}</p>
//                                     <p className="text-[10px] font-bold text-indigo-500 uppercase">{edu.institution}</p>
//                                   </div>
//                                   <span className="text-[9px] font-black text-slate-700">{edu.year}</span>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                           <button 
//                             onClick={() => setViewingResume(c.resumeUrl)}
//                             className="w-full py-5 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group"
//                           >
//                             Launch Neural Asset Viewer <FileText size={18} className="group-hover:animate-bounce" />
//                           </button>
//                         </div>
//                       </div>

//                       {/* --- DECISION ACTION BAR (SHORTLIST ONLY) --- */}
//                       <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
//                         <div className="flex items-center gap-3">
//                            <div className={`w-2 h-2 rounded-full ${isShortlisted ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
//                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
//                              Marketplace Status: <span className={isShortlisted ? 'text-emerald-400' : 'text-slate-300'}>{isShortlisted ? 'Decision Finalized' : 'Decision Pending'}</span>
//                            </div>
//                         </div>
                        
//                         {!isShortlisted ? (
//                           <button 
//                             disabled={updatingId === app._id}
//                             onClick={() => handleShortlist(app._id)}
//                             className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
//                           >
//                             {updatingId === app._id ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16} fill="white"/>} Establish Sync
//                           </button>
//                         ) : (
//                           <div className="px-10 py-5 bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic">
//                             <Sparkles size={16} /> Shortlisted in vault
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </motion.div>
//           )
//         })}
//       </div>

//       {/* --- RESUME DRAWER --- */}
//       <AnimatePresence>
//         {viewingResume && (
//           <>
//             <motion.div 
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               onClick={() => setViewingResume(null)}
//               className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
//             />
//             <motion.div 
//               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
//               transition={{ type: "spring", damping: 30, stiffness: 300 }}
//               className="fixed inset-y-0 right-0 w-full lg:w-[850px] bg-[#020617] border-l border-white/10 z-[70] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
//             >
//               <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#020617]">
//                 <div>
//                   <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Neural.Asset</h3>
//                   <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
//                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Verified Node Document
//                   </div>
//                 </div>
//                 <button onClick={() => setViewingResume(null)} className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-all hover:rotate-90">
//                   <X size={24} />
//                 </button>
//               </div>
              
//               <div className="flex-1 overflow-hidden bg-slate-950 relative">
//                 <div className="absolute inset-0 right-[-20px] overflow-y-scroll custom-scrollbar no-scrollbar">
//                   <iframe 
//                     src={`${BACKEND_URL}/${viewingResume}#toolbar=0&navpanes=0&scrollbar=0`} 
//                     className="h-full border-none pointer-events-auto"
//                     style={{ width: 'calc(100% + 20px)' }}
//                     title="Candidate Resume"
//                   />
//                 </div>
//               </div>

//               <div className="p-6 border-t border-white/5 bg-[#020617] flex justify-between items-center">
//                  <a href={`${BACKEND_URL}/${viewingResume}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">
//                     Open Raw Sync <ExternalLink size={14} />
//                  </a>
//                  <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.4em]">Vonnue Intelligence v1.0</p>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, User, BrainCircuit, ChevronDown, 
  ArrowLeft, FileText, GraduationCap, 
  Target, Zap, X, ExternalLink, Code2, Loader2, Clock, ShieldCheck
} from "lucide-react";

export default function JobApplication() {
  const { Job_Id } = useParams();
  const router = useRouter();
  
  // --- 1. NEURAL SANITIZER ---
  const cleanJobId = Job_Id?.startsWith(":") ? Job_Id.slice(1) : Job_Id;

  const [data, setData] = useState({ applications: [], jobTitle: "" });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); 
  const [viewingResume, setViewingResume] = useState(null); 
  const [updatingId, setUpdatingId] = useState(null); 
  
  const BACKEND_URL = "http://localhost:8001";

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/recruiter/applications/${cleanJobId}`, {
          credentials: 'include'
        });
        const result = await res.json();
        if (result.success) setData(result);
      } catch (err) {
        console.error("Neural Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (cleanJobId) fetchApplicants();
  }, [cleanJobId]);

  // --- 3. DECISION HANDLER (SHORTLIST ONLY) ---
  const handleShortlist = async (appId) => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/recruiter/applications/status/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Shortlisted" }),
        credentials: "include",
      });
      const result = await res.json();
      
      if (result.success) {
        setData(prev => ({
          ...prev,
          applications: prev.applications.map(app => 
            app._id === appId ? { ...app, status: "Shortlisted" } : app
          )
        }));
      }
    } catch (err) {
      console.error("Neural Sync Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleDropdown = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
      <BrainCircuit className="animate-pulse text-indigo-500 mb-4" size={40} />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Synchronizing Neural Requisitions</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-10 bg-[#020617] min-h-screen text-slate-200 selection:bg-indigo-500/30">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
            <ArrowLeft size={14} /> Back to Vault
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
            Decision<span className="text-indigo-500">.Center</span>
          </h1>
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 mt-2">
            Target Node: <span className="text-white italic">{data.jobTitle || "Syncing..."}</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 flex items-center gap-6 shadow-2xl">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Syncs</p>
            <p className="text-3xl font-black text-white italic">{data.applications.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Target size={24} />
          </div>
        </div>
      </header>

      {/* --- APPLICANT FEED --- */}
      <div className="space-y-6">
        {data.applications.map((app, idx) => {
          const isExpanded = expandedId === app._id;
          
          // --- LOGIC: ADVANCED STATUS GUARD ---
          // Candidates who have moved past initial "Applied" stage
          const hasAdvanced = ["Shortlisted", "Interviewing", "Hired", "Rejected"].includes(app.status);
          const isInterviewing = app.status === "Interviewing";
          const isFinalDecision = ["Hired", "Rejected"].includes(app.status);
          
          const c = app.candidateId;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              key={app._id} 
              className={`bg-slate-950/50 border rounded-[3rem] overflow-hidden transition-all duration-500 ${
                isFinalDecision ? 'border-indigo-500/20 opacity-80' :
                hasAdvanced ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : 
                isExpanded ? 'border-indigo-500/40 shadow-2xl shadow-indigo-500/5' : 'border-slate-800/50 hover:border-slate-700'
              }`}
            >
              {/* --- MAIN CARD BAR --- */}
              <div 
                className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                onClick={() => toggleDropdown(app._id)}
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden border-2 transition-all ${
                        hasAdvanced ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-700'
                    }`}>
                      <img 
                        src={`${BACKEND_URL}/${c.profilePhoto}`} 
                        className="w-full h-full object-cover" 
                        alt="Avatar" 
                        onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=" + c.firstName + "&background=0D1117&color=fff"} 
                      />
                    </div>
                    {hasAdvanced && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-black border-4 border-[#020617]">
                        <Zap size={10} fill="black" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase italic tracking-tight leading-none mb-1">
                      {c.firstName} {c.lastName}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{c.experienceYears} Years Exp</span>
                      {hasAdvanced && (
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic flex items-center gap-1 ${
                            isInterviewing ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                        }`}>
                           {isInterviewing ? <Clock size={10}/> : <ShieldCheck size={10}/>}
                           {app.status === "Shortlisted" ? "Sync Established" : `${app.status} Stage`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Decision Score</p>
                    <div className={`text-2xl font-black italic flex items-center gap-2 ${hasAdvanced ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {app.aiScore}% <Sparkles size={16} className="text-indigo-500" />
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              {/* --- DROPDOWN CONTENT --- */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 bg-slate-900/20"
                  >
                    <div className="p-8 lg:p-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        {/* Summary & Skills */}
                        <div className="space-y-8">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><User size={12} /> Candidate Summary</h4>
                            <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-indigo-500/30 pl-6">{c.bio || "No summary node provided."}</p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><Code2 size={12} /> Technical Profile</h4>
                            <div className="flex flex-wrap gap-2">
                              {c.skills?.map(skill => (
                                <span key={skill} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{skill}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Education & Assets */}
                        <div className="space-y-8">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><GraduationCap size={12} /> Academic Nodes</h4>
                            <div className="space-y-4">
                              {c.education?.map((edu, i) => (
                                <div key={i} className="flex justify-between items-start">
                                  <div>
                                    <p className="text-white font-bold text-sm uppercase italic">{edu.degree}</p>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase">{edu.institution}</p>
                                  </div>
                                  <span className="text-[9px] font-black text-slate-700">{edu.year}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <button 
                            onClick={() => setViewingResume(c.resumeUrl)}
                            className="w-full py-5 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group"
                          >
                            Launch Neural Asset Viewer <FileText size={18} className="group-hover:animate-bounce" />
                          </button>
                        </div>
                      </div>

                      {/* --- DECISION ACTION BAR (DYNAMIC) --- */}
                      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${hasAdvanced ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             Current Status: <span className={hasAdvanced ? 'text-emerald-400' : 'text-slate-300'}>{app.status}</span>
                           </div>
                        </div>
                        
                        {/* LOGIC: Only show button if status is 'Applied' */}
                        {app.status === "Applied" ? (
                          <button 
                            disabled={updatingId === app._id}
                            onClick={() => handleShortlist(app._id)}
                            className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                          >
                            {updatingId === app._id ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16} fill="white"/>} Establish Sync
                          </button>
                        ) : (
                          /* STATE: Candidate has moved past 'Applied' */
                          <div className={`px-10 py-5 border rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic ${
                            isInterviewing ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 
                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}>
                            {isInterviewing ? <Clock size={16} /> : <Sparkles size={16} />}
                            {app.status === "Shortlisted" ? "Candidate Shortlisted" : `${app.status} phase active`}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* --- RESUME DRAWER --- */}
      <AnimatePresence>
        {viewingResume && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingResume(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="fixed inset-y-0 right-0 w-full lg:w-[850px] bg-[#020617] border-l border-white/10 z-[70] flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Neural.Asset</h3>
                </div>
                <button onClick={() => setViewingResume(null)} className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-950">
                <iframe src={`${BACKEND_URL}/${viewingResume}#toolbar=0`} className="w-full h-full border-none" title="Resume Viewer" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}