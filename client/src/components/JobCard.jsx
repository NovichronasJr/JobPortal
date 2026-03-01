// "use client";
// import React, { useMemo } from "react";
// import { motion } from "framer-motion";
// import { MapPin, Briefcase, ChevronRight, Sparkles, DollarSign, TrendingUp, Clock } from "lucide-react";

// export default function JobCard({ job, index, onOpen, backendUrl, candidate }) {
//   const companyName = job?.recruiterId?.organizationName || "Elite Corp";
//   const companyLogo = job?.recruiterId?.organizationLogo;

//   const matchDetails = useMemo(() => {
//     if (!candidate || !job) return { score: 0, color: "text-slate-500" };
//     const matched = candidate.skills.filter(s => job.skills?.includes(s)).length;
//     const totalSkills = job.skills?.length || 1;
//     const reqExp = parseInt(job.experience) || 0;
//     const expDiff = candidate.experienceYears - reqExp;
//     const expScore = expDiff >= 0 ? 10 : Math.max(0, 10 + expDiff);
//     const score = Math.min(100, Math.round(((matched * 10) + (expScore * 4)) / ((totalSkills * 10) + 40) * 100));

//     let color = "text-emerald-400";
//     if (score < 70) color = "text-amber-400";
//     if (score < 40) color = "text-rose-400";

//     return { score, color };
//   }, [job, candidate]);

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.05 }}
//       onClick={onOpen}
//       className="group bg-slate-900/20 backdrop-blur-md border border-slate-800/50 p-6 md:p-8 rounded-[2.5rem] hover:bg-slate-900/40 hover:border-indigo-500/30 transition-all cursor-pointer relative"
//     >
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//         <div className="flex items-center gap-6">
//           <div className="w-16 h-16 rounded-3xl bg-white border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
//             {companyLogo ? (
//               <img 
//                 src={`${backendUrl}/${companyLogo}`} 
//                 className="w-full h-full object-cover" 
//                 alt="logo" 
//                 onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class='text-slate-800 font-black text-2xl'>${companyName[0]}</span>`; }}
//               />
//             ) : <span className="text-slate-800 font-black text-2xl">{companyName[0]}</span>}
//           </div>

//           <div>
//             <div className="flex items-center gap-2 mb-1">
//                <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic group-hover:text-indigo-400 transition-colors">{job.title}</h2>
//             </div>
//             <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
//               <span className="flex items-center gap-1.5 uppercase italic"><Briefcase size={14} className="text-indigo-400"/> {companyName}</span>
//               <span className="flex items-center gap-1.5 uppercase italic"><MapPin size={14} className="text-indigo-400"/> {job.location}</span>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-8">
//            <div className="text-right hidden sm:block">
//               <p className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-1">Compatibility</p>
//               <div className={`flex items-center gap-2 justify-end font-black text-xl italic ${matchDetails.color}`}>
//                 {matchDetails.score}% <Sparkles size={16} className="text-indigo-400" />
//               </div>
//            </div>
//            <button className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
//               <ChevronRight size={24} />
//            </button>
//         </div>
//       </div>

//       <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col md:flex-row md:items-start justify-between gap-6">
//         <div className="flex flex-wrap gap-2 max-w-2xl">
//           <Badge text={job.stipend || "Competitive"} icon={<DollarSign size={12} />} active />
//           <Badge text={job.workModel} icon={<TrendingUp size={12} />} />
//           <Badge text={`${job.experience || "Fresher"} Exp`} icon={<Clock size={12} />} />
          
//           {/* --- LIMITED TO 5 SKILLS FOR UI CLARITY --- */}
//           {job.skills?.slice(0, 5).map((skill) => {
//             const isMatched = candidate?.skills?.includes(skill);
//             return (
//               <span 
//                 key={skill} 
//                 className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all tracking-tighter
//                   ${isMatched 
//                     ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
//                     : "bg-slate-950/40 border-slate-800 text-slate-600"
//                   }`}
//               >
//                 {skill}
//               </span>
//             );
//           })}
//           {job.skills?.length > 5 && (
//             <span className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[10px] font-black text-slate-500 uppercase">
//               +{job.skills.length - 5} More
//             </span>
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// function Badge({ text, icon, active }) {
//   return (
//     <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${active ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/5" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
//       {icon} {text}
//     </div>
//   );
// }


"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Briefcase, ChevronRight, Sparkles, DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

// Added isApplied to the props
export default function JobCard({ job, index, onOpen, backendUrl, candidate, isApplied }) {
  const companyName = job?.recruiterId?.organizationName || "Elite Corp";
  const companyLogo = job?.recruiterId?.organizationLogo;

  const matchDetails = useMemo(() => {
    if (!candidate || !job) return { score: 0, color: "text-slate-500" };
    
    // Normalize skills to UPPERCASE for accurate matching
    const candidateSkills = candidate.skills || [];
    const jobSkills = job.skills?.map(s => s.toUpperCase()) || [];
    
    const matched = candidateSkills.filter(s => jobSkills.includes(s)).length;
    const totalSkills = job.skills?.length || 1;
    const reqExp = parseInt(job.experience) || 0;
    const expDiff = candidate.experienceYears - reqExp;
    const expScore = expDiff >= 0 ? 10 : Math.max(0, 10 + expDiff);
    const score = Math.min(100, Math.round(((matched * 10) + (expScore * 4)) / ((totalSkills * 10) + 40) * 100));

    // If applied, we default to emerald, otherwise use standard logic
    if (isApplied) return { score, color: "text-emerald-400" };

    let color = "text-emerald-400";
    if (score < 70) color = "text-amber-400";
    if (score < 40) color = "text-rose-400";

    return { score, color };
  }, [job, candidate, isApplied]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onOpen}
      // Dynamic border and background based on isApplied
      className={`group backdrop-blur-md border p-6 md:p-8 rounded-[2.5rem] transition-all cursor-pointer relative overflow-hidden
        ${isApplied 
          ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' 
          : 'bg-slate-900/20 border-slate-800/50 hover:bg-slate-900/40 hover:border-indigo-500/30'}`}
    >
      {/* --- APPLIED STATUS TAG --- */}
      {isApplied && (
        <div className="absolute top-0 right-0 bg-emerald-500/20 border-b border-l border-emerald-500/30 px-6 py-2 rounded-bl-3xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Neural Sync Active</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-white border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
            {companyLogo ? (
              <img 
                src={`${backendUrl}/${companyLogo}`} 
                className="w-full h-full object-cover" 
                alt="logo" 
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class='text-slate-800 font-black text-2xl'>${companyName[0]}</span>`; }}
              />
            ) : <span className="text-slate-800 font-black text-2xl">{companyName[0]}</span>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
               <h2 className={`text-2xl font-bold tracking-tight uppercase italic transition-colors ${isApplied ? 'text-emerald-400' : 'text-white group-hover:text-indigo-400'}`}>
                 {job.title}
               </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-1.5 uppercase italic">
                <Briefcase size={14} className={isApplied ? "text-emerald-400" : "text-indigo-400"}/> {companyName}
              </span>
              <span className="flex items-center gap-1.5 uppercase italic">
                <MapPin size={14} className={isApplied ? "text-emerald-400" : "text-indigo-400"}/> {job.location}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-1">Compatibility</p>
              <div className={`flex items-center gap-2 justify-end font-black text-xl italic ${matchDetails.color}`}>
                {matchDetails.score}% <Sparkles size={16} className={isApplied ? "text-emerald-400" : "text-indigo-400"} />
              </div>
           </div>
           
           {/* Change icon based on status */}
           <button className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl
             ${isApplied 
               ? "bg-emerald-500 text-white border-emerald-400" 
               : "bg-slate-950 border border-slate-800 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white"}`}
           >
              {isApplied ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
           </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-wrap gap-2 max-w-2xl">
          <Badge text={job.stipend || "Competitive"} icon={<DollarSign size={12} />} active={isApplied} />
          <Badge text={job.workModel} icon={<TrendingUp size={12} />} />
          <Badge text={`${job.experience || "Fresher"} Exp`} icon={<Clock size={12} />} />
          
          {job.skills?.slice(0, 5).map((skill) => {
            const isMatched = candidate?.skills?.includes(skill.toUpperCase());
            return (
              <span 
                key={skill} 
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all tracking-tighter
                  ${isMatched 
                    ? isApplied ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-600"
                  }`}
              >
                {skill}
              </span>
            );
          })}
          {job.skills?.length > 5 && (
            <span className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[10px] font-black text-slate-500 uppercase">
              +{job.skills.length - 5} More
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Badge({ text, icon, active }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all 
      ${active 
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/5" 
        : "bg-slate-950 border-slate-800 text-slate-500"}`}
    >
      {icon} {text}
    </div>
  );
}