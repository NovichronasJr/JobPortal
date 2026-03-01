"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, MapPin, DollarSign, Clock, Sparkles, Send, CheckCircle2, Loader2, Briefcase, Cpu } from "lucide-react";
import { useCandidateJob } from "@/context/CandidateJobContext";
export default function JobDetailSlider({ job, candidate, availableCategories, onClose, onSetCategory, onSetLocation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const {refreshApplied} = useCandidateJob();
  // --- BRAIN: NEURAL MATCH LOGIC ---
  const analysis = useMemo(() => {
    if (!job?.skills || !candidate?.skills) return { count: 0, score: 0 };

    // Match uppercase skills for precision
    const jobSkillsUpper = job.skills.map(s => s.toUpperCase());
    const matched = candidate.skills.filter(s => jobSkillsUpper.includes(s));
    
    // Formula: (MatchedSkills * 10) + (ExpScore * 4) / TotalWeight
    const totalSkills = job.skills.length || 1;
    const reqExp = parseInt(job.experience) || 0;
    const expDiff = candidate.experienceYears - reqExp;
    const expScore = expDiff >= 0 ? 10 : Math.max(0, 10 + expDiff);

    const score = Math.min(100, Math.round(((matched.length * 10) + (expScore * 4)) / ((totalSkills * 10) + 40) * 100));
    
    return { count: matched.length, score, isQualified: matched.length > 0 };
  }, [job, candidate]);

  // --- SUBMISSION LOGIC (NATIVE FETCH) ---
  const handleApply = async () => {
    setIsApplying(true);
    
    const payload = { 
      jobId: job._id, 
      candidateId: candidate._id, 
      aiScore: analysis.score 
    };

    try {
      const response = await fetch(`http://localhost:8001/api/candidate/applyJob`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Automatically sends your session cookie
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsApplied(true);
        // Successful sync: Close slider after brief visual confirmation
        setTimeout(onClose, 2000);
        refreshApplied(candidate?._id);

      } else {
        alert(data.message || "Neural Sync failed: The node rejected this application.");
        setIsApplying(false);
      }
    } catch (err) {
      console.error("Critical Sync Error:", err);
      alert("System Sync Failed: Connection to the marketplace node was lost.");
      setIsApplying(false);
    }
  };

  const chatSteps = [
    {
      id: "skills",
      title: "Technical Fit",
      message: analysis.isQualified 
        ? `Hey ${candidate.name.split(' ')[0]}! Neural scan complete. You match ${analysis.count} core requirements perfectly. Your profile is high-signal for this role. Shall we audit your experience?`
        : `Hey ${candidate.name.split(' ')[0]}! Analyzing the requirements... It looks like your stack is a bit of a pivot from their needs. Still, your unique background could bridge the gap. Check experience?`,
      btn: "Analyze Experience"
    },
    {
      id: "experience",
      title: "Career Trajectory",
      message: `The recruiter targets ${job.experience} years, and you're bringing ${candidate.experienceYears}. My sync indicates a ${analysis.score}% match probability. How's the environment vibe?`,
      btn: "Check Work Site"
    },
    {
      id: "location",
      title: "Work-Life Sync",
      message: `The role is ${job.location} and strictly ${job.workType}. Does that fit your current workflow, or should I pivot your marketplace view to focus on Remote roles?`,
      type: "location"
    },
    {
      id: "category",
      title: "The Next Peak",
      message: "Got it! Recording your preferences. Which other technical category should I prioritize for your future recommendations?",
      type: "category"
    },
    {
      id: "final",
      title: "Neural Sync Complete",
      message: "Everything is recorded! Your Decision Profile is updated and we've refined the Marketplace filters. We're ready for the final sync!",
      type: "success"
    }
  ];

  const handleCategorySelect = (cat) => {
    setSyncStatus("syncing");
    onSetCategory(cat);
    setTimeout(() => { setSyncStatus("idle"); setCurrentStep(4); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 200 }} className="relative w-full max-w-3xl bg-[#020617] border-l border-white/5 h-full shadow-2xl flex flex-col">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/20 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xl border border-white/10">
               <img src={`http://localhost:8001/${job.recruiterId?.organizationLogo}`} className="w-full h-full object-cover" alt="logo" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{job.title}</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{job.recruiterId?.organizationName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 pb-44 custom-scrollbar">
          <div className="grid grid-cols-4 gap-4">
            <StatTile icon={<DollarSign size={14}/>} label="Budget" value={job.stipend} />
            <StatTile icon={<Clock size={14}/>} label="Exp" value={job.experience} />
            <StatTile icon={<MapPin size={14}/>} label="Site" value={job.location} />
            <StatTile icon={<Briefcase size={14}/>} label="Type" value={job.workType} />
          </div>

          {/* JOB BRIEF & FULL TECH STACK */}
          <section className="space-y-10">
            <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500" /> The Intelligence Brief</h4>
               <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>

            <div className="p-8 rounded-[3rem] bg-indigo-500/[0.02] border border-indigo-500/10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/60 mb-8 flex items-center gap-2"><Cpu size={14} /> Comprehensive Technical Stack</h4>
               <div className="flex flex-wrap gap-3">
                  {job.skills?.map((skill) => {
                    const isMatched = candidate?.skills?.includes(skill.toUpperCase());
                    return (
                      <div key={skill} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all
                        ${isMatched ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/5" : "bg-slate-950 border-white/5 text-slate-600"}`}>
                        {isMatched && <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />}
                        {skill}
                      </div>
                    );
                  })}
               </div>
            </div>
          </section>

          {/* CHAT COMPANION */}
          <div className={`p-10 rounded-[3.5rem] border transition-all duration-700 relative overflow-hidden ${currentStep === 4 ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]" : "bg-indigo-600/10 border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.05)]"}`}>
            <div className="flex items-center gap-3 mb-8">
              {currentStep === 4 ? <CheckCircle2 className="text-emerald-400" size={24}/> : <Zap className="text-indigo-500 fill-indigo-500" size={20} />}
              <span className="text-white font-black uppercase italic tracking-tight">{currentStep === 4 ? "Decision Sync Complete" : "Companion Insights"}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentStep === 4 ? "success" : syncStatus === "syncing" ? "syncing" : currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                {syncStatus === "syncing" ? (
                  <div className="flex flex-col items-center py-10 space-y-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Syncing Preferences...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-200 text-lg font-medium leading-relaxed italic">"{chatSteps[currentStep].message}"</p>
                    <div className="flex flex-wrap gap-4">
                      {chatSteps[currentStep].type === "location" ? (
                        <div className="grid grid-cols-2 gap-4 w-full">
                          <button onClick={() => {onSetLocation(job.workModel); setCurrentStep(3)}} className="py-4 bg-white text-black font-black text-[10px] uppercase rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl">{job.location} is Fine</button>
                          <button onClick={() => {onSetLocation("Remote"); setCurrentStep(3)}} className="py-4 bg-slate-900 border border-white/10 text-slate-400 font-black text-[10px] uppercase rounded-xl hover:text-white">Prefer Remote</button>
                        </div>
                      ) : chatSteps[currentStep].type === "category" ? (
                        <div className="w-full space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            {availableCategories.map(cat => (
                              <button key={cat} onClick={() => handleCategorySelect(cat)} className="p-4 bg-slate-950 border border-white/5 text-slate-500 text-[9px] font-black uppercase rounded-xl hover:border-indigo-500 hover:text-white transition-all">{cat}</button>
                            ))}
                          </div>
                          <button onClick={() => {onSetCategory("All"); setCurrentStep(4);}} className="w-full py-3 border border-dashed border-white/10 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:text-white transition-all">Skip Preference</button>
                        </div>
                      ) : currentStep === 4 ? (
                        <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-[10px] tracking-widest bg-emerald-500/10 px-4 py-2 rounded-lg">
                           <Sparkles size={14} /> Profile Optimally Synced
                        </div>
                      ) : (
                        <button onClick={() => setCurrentStep(prev => prev + 1)} className="px-10 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-xl flex items-center gap-3 hover:bg-indigo-500 shadow-xl transition-all">
                          {chatSteps[currentStep].btn} <Send size={14}/>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* STICKY APPLY FOOTER */}
        <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
          <button 
            disabled={currentStep < 4 || isApplying || isApplied}
            onClick={handleApply}
            className={`w-full py-7 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-xs transition-all flex items-center justify-center gap-4 shadow-2xl
              ${isApplied ? "bg-emerald-500 text-white" : currentStep === 4 ? "bg-white text-black hover:bg-indigo-600 hover:text-white" : "bg-slate-900 text-slate-700 cursor-not-allowed"}
            `}
          >
            {isApplying ? <Loader2 className="animate-spin" /> : isApplied ? <CheckCircle2 /> : null}
            {isApplying ? "Syncing Decision..." : isApplied ? "Successfully Applied" : "Finish Companion Chat to Apply"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StatTile({ icon, label, value }) {
  return (
    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl text-center hover:bg-white/[0.03] transition-colors">
      <div className="text-indigo-500 flex justify-center mb-2">{icon}</div>
      <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1">{label}</p>
      <p className="text-white font-black text-[10px] truncate uppercase italic">{value || "TBD"}</p>
    </div>
  );
}