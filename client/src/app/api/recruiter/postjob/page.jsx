"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, Briefcase, MapPin, 
  ChevronDown, Bold, 
  Loader2, Target,
  DollarSign, Clock, 
  Sparkles, BrainCircuit, CheckCircle2, ArrowRight, Calendar as CalendarIcon,
  UserCheck // Added for Work Type icon
} from "lucide-react";

export default function PostJob() {
  const [showAiBot, setShowAiBot] = useState(false);
  const [botStep, setBotStep] = useState(0);
  const [isBotComplete, setIsBotComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeDropdown, setTypeDropdown] = useState(false);
  const [workTypeDropdown, setWorkTypeDropdown] = useState(false); // New state
  const editorRef = useRef(null);
  const dateInputRef = useRef(null);

  const [jobData, setJobData] = useState({
    title: "", skills: [], newSkill: "",
    experience: "", type: "Remote", workType: "Full-time", // New field default
    location: "", stipend: "",
    closingDate: "" 
  });

  const [aiWeightage, setAiWeightage] = useState({
    hiddenSkills: [], newHiddenSkill: "",
    accommodateFresher: null, maxPositions: ""
  });

  const today = new Date().toISOString().split('T')[0];

  const botQuestions = [
    { id: 0, text: "To help me find the perfect match, are there any <span class='text-indigo-400 font-bold italic uppercase tracking-tighter'>extra skills</span> or specific traits you're keeping an eye out for?", field: "hiddenSkills" },
    { id: 1, text: "I want to make sure the experience level is just right. Should we open the doors for <span class='text-indigo-400 font-bold italic uppercase tracking-tighter'>high-potential freshers</span>, or are you looking for a pro?", field: "accommodateFresher" },
    { id: 2, text: "Just so I can manage the pipeline effectively, how many <span class='text-indigo-400 font-bold italic uppercase tracking-tighter'>positions</span> are we aiming to fill for this specific role?", field: "maxPositions" }
  ];

  const handleFormat = (cmd) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, null);
    }
  };

  const nextStep = () => {
    if (botStep < botQuestions.length - 1) setBotStep(botStep + 1);
    else setIsBotComplete(true);
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) dateInputRef.current.showPicker();
  };

  const addHiddenSkill = () => {
    if (aiWeightage.newHiddenSkill.trim()) {
      setAiWeightage({
        ...aiWeightage,
        hiddenSkills: [...aiWeightage.hiddenSkills, aiWeightage.newHiddenSkill.trim()],
        newHiddenSkill: ""
      });
    }
  };

  const removeHiddenSkill = (skillToRemove) => {
    setAiWeightage({
      ...aiWeightage,
      hiddenSkills: aiWeightage.hiddenSkills.filter(s => s !== skillToRemove)
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="relative flex min-h-screen">
        <main className={`flex-1 transition-all duration-500 ease-in-out p-6 lg:p-12 ${showAiBot ? 'pr-[480px]' : ''}`}>
          
          <header className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-5 bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-2xl">
                <Briefcase size={32} className="text-indigo-500"/>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase italic">
                  New<span className="text-indigo-500">.Opening</span>
                </h1>
                <p className="text-slate-500 mt-1 text-lg font-medium italic">Let's find your next star player.</p>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-2xl p-4 rounded-[1.5rem] border border-slate-800/50 shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <BrainCircuit size={20} />
              </div>
              <div className="pr-2">
                <p className="text-[9px] uppercase font-black tracking-widest text-slate-600 leading-none mb-1">Matching Status</p>
                <p className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 leading-none">
                  Ready to scan <Sparkles size={12} />
                </p>
              </div>
            </div>
          </header>

          <div className="max-w-[1000px] space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Requisition Title</label>
                <input className="w-full bg-slate-950 border-2 border-slate-800 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" placeholder="e.g. Senior Full Stack Engineer" value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} />
              </section>

              <section className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Tech Stack Requirements</label>
                <div className="flex gap-2">
                  <input className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 placeholder:text-slate-700" placeholder="e.g. C/C++, Java or Python" value={jobData.newSkill} onChange={e => setJobData({...jobData, newSkill: e.target.value})} onKeyPress={e => e.key === 'Enter' && (setJobData({...jobData, skills: [...jobData.skills, jobData.newSkill], newSkill: ""}))} />
                  <button onClick={() => setJobData({...jobData, skills: [...jobData.skills, jobData.newSkill], newSkill: ""})} className="bg-indigo-600 px-6 rounded-[1.2rem] hover:bg-indigo-500 transition-all font-black text-xs text-white uppercase tracking-widest">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {jobData.skills.map(s => (
                    <span key={s} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      {s} <X size={12} className="cursor-pointer hover:text-white" onClick={() => setJobData({...jobData, skills: jobData.skills.filter(sk => sk !== s)})}/>
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Job Briefing & Details</label>
              <div className="border-2 border-slate-800 rounded-[2rem] bg-slate-950/50 overflow-hidden focus-within:border-indigo-500/40 transition-all shadow-inner">
                <div className="flex gap-2 p-3 border-b border-slate-800 bg-slate-900/50">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400"><Bold size={18}/></button>
                </div>
                <div ref={editorRef} contentEditable className="p-8 min-h-[220px] text-[15px] font-medium text-slate-400 outline-none leading-relaxed prose prose-invert max-w-none" onFocus={() => !showAiBot && setShowAiBot(true)}/>
              </div>
            </section>

            {/* Bottom Grid Expanded to 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Experience" icon={<Clock size={14}/>} placeholder="e.g. 2+" value={jobData.experience} onChange={e => setJobData({...jobData, experience: e.target.value})} />
              
              {/* Work Model Dropdown */}
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">Work Model</label>
                <div onClick={() => setTypeDropdown(!typeDropdown)} className="bg-slate-950 border-2 border-slate-800 rounded-[1.2rem] px-5 py-4 text-sm font-bold flex justify-between items-center cursor-pointer hover:border-indigo-500/40 transition-all">
                  {jobData.type} <ChevronDown size={18} className={typeDropdown ? 'rotate-180 transition-transform text-indigo-500' : 'text-slate-600'}/>
                </div>
                {typeDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border-2 border-slate-800 rounded-[1.2rem] overflow-hidden z-20 shadow-2xl">
                    {['Remote', 'Hybrid', 'Onsite'].map(opt => (
                      <div key={opt} onClick={() => {setJobData({...jobData, type: opt}); setTypeDropdown(false)}} className="px-5 py-3 hover:bg-indigo-600 text-xs font-black uppercase tracking-widest cursor-pointer border-b border-slate-800 last:border-0">{opt}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Type Dropdown (New Field) */}
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                   <UserCheck size={14} className="text-indigo-500/60"/> Work Type
                </label>
                <div onClick={() => setWorkTypeDropdown(!workTypeDropdown)} className="bg-slate-950 border-2 border-slate-800 rounded-[1.2rem] px-5 py-4 text-sm font-bold flex justify-between items-center cursor-pointer hover:border-indigo-500/40 transition-all">
                  {jobData.workType} <ChevronDown size={18} className={workTypeDropdown ? 'rotate-180 transition-transform text-indigo-500' : 'text-slate-600'}/>
                </div>
                {workTypeDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border-2 border-slate-800 rounded-[1.2rem] overflow-hidden z-20 shadow-2xl">
                    {['Full-time', 'Internship', 'Part-time'].map(opt => (
                      <div key={opt} onClick={() => {setJobData({...jobData, workType: opt}); setWorkTypeDropdown(false)}} className="px-5 py-3 hover:bg-indigo-600 text-xs font-black uppercase tracking-widest cursor-pointer border-b border-slate-800 last:border-0">{opt}</div>
                    ))}
                  </div>
                )}
              </div>

              <Field label="Salary Range" icon={<DollarSign size={14}/>} placeholder="e.g. 20k-30k" value={jobData.stipend} onChange={e => setJobData({...jobData, stipend: e.target.value})} />
              <Field label="Location" icon={<MapPin size={14}/>} placeholder="e.g. Pune" onFocus={() => !showAiBot && setShowAiBot(true)} value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} />
              
              <div className="space-y-3 relative group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <CalendarIcon size={14} className="text-indigo-500/60"/> Application Deadline
                </label>
                <div 
                  onClick={handleCalendarClick}
                  className="bg-slate-950 border-2 border-slate-800 rounded-[1.2rem] px-5 py-4 text-sm font-bold flex justify-between items-center cursor-pointer hover:border-indigo-500/40 transition-all text-white group-hover:border-slate-700"
                >
                  <span className={jobData.closingDate ? "text-white" : "text-slate-700"}>
                    {jobData.closingDate || "YYYY-MM-DD"}
                  </span>
                  <CalendarIcon size={16} className="text-slate-600 group-hover:text-indigo-500 transition-colors"/>
                </div>
                <input 
                  ref={dateInputRef}
                  type="date" 
                  min={today}
                  className="absolute opacity-0 pointer-events-none"
                  style={{ top: '50%', left: '50%' }}
                  onChange={(e) => setJobData({...jobData, closingDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showAiBot && (
            <motion.aside 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[480px] h-full bg-[#020617] border-l-2 border-slate-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col backdrop-blur-3xl"
            >
              <div className="p-8 border-b-2 border-slate-800">
                <div className="flex items-center gap-5">
                  <div className="relative w-14 h-14 flex items-center justify-center bg-indigo-500/10 rounded-[1.2rem] border-2 border-indigo-500/30">
                    <div className="flex gap-1.5 items-end h-4">
                      <motion.div animate={{ height: [6, 16, 6] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 bg-indigo-400 rounded-full" />
                      <motion.div animate={{ height: [12, 6, 12] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 bg-indigo-400 rounded-full" />
                      <motion.div animate={{ height: [8, 14, 8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 bg-indigo-400 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-widest uppercase italic leading-none">Intelligence<span className="text-indigo-500">.Sync</span></h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Analysis</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto space-y-8">
                <AnimatePresence mode="wait">
                  {!isBotComplete ? (
                    <motion.div key={botStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                      <div className="relative">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block opacity-70">Question {botStep + 1}</span>
                        <p className="text-2xl text-white leading-tight font-bold tracking-tight pr-4">
                          <span dangerouslySetInnerHTML={{ __html: botQuestions[botStep]?.text }} />
                        </p>
                      </div>

                      <div className="space-y-4">
                        {botStep === 0 && (
                          <div className="space-y-4">
                            <div className="relative group">
                              <input 
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50" 
                                placeholder="eg. problem solving" 
                                value={aiWeightage.newHiddenSkill} 
                                onChange={e => setAiWeightage({...aiWeightage, newHiddenSkill: e.target.value})} 
                                onKeyPress={e => e.key === 'Enter' && addHiddenSkill()}
                              />
                              <button onClick={addHiddenSkill} className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition-all text-white">
                                <Plus size={18}/>
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                              {aiWeightage.hiddenSkills.map(s => (
                                <motion.span 
                                  initial={{ scale: 0.8, opacity: 0 }} 
                                  animate={{ scale: 1, opacity: 1 }}
                                  key={s} 
                                  className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"
                                >
                                  {s} <X size={12} className="cursor-pointer hover:text-white" onClick={() => removeHiddenSkill(s)}/>
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {botStep === 1 && (
                          <div className="flex flex-col gap-3">
                            {['Yes, Freshers are welcome', 'Prefer Pro'].map(opt => (
                              <button key={opt} onClick={() => {setAiWeightage({...aiWeightage, accommodateFresher: opt}); setBotStep(2)}} className="w-full py-5 rounded-2xl border-2 border-slate-800 text-[10px] font-black hover:border-indigo-500 hover:bg-indigo-600 transition-all text-slate-500 hover:text-white uppercase tracking-[0.3em] shadow-xl text-left px-8">{opt}</button>
                            ))}
                          </div>
                        )}
                        {botStep === 2 && (
                          <input type="number" min={0} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-indigo-500/50" placeholder="Quantity..." value={aiWeightage.maxPositions} onChange={e => setAiWeightage({...aiWeightage, maxPositions: e.target.value})} />
                        )}
                      </div>

                      <div className="pt-4 flex flex-col gap-4">
                        <button onClick={nextStep} className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95">Continue Analysis</button>
                        <button onClick={() => setShowAiBot(false)} className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center mt-2 hover:text-indigo-400 transition-colors">Skip for now</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center h-full space-y-6">
                      <div className="w-28 h-28 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center text-emerald-400 border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]"><CheckCircle2 size={56}/></div>
                      <div>
                        <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Strategy<span className="text-emerald-400">.Sync</span></h4>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-4">Candidate models successfully locked</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-10 border-t-2 border-slate-800 bg-slate-950/50">
                <button disabled={!isBotComplete || isSubmitting} onClick={() => setIsSubmitting(true)} className={`w-full py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] flex items-center justify-center gap-3 transition-all ${isBotComplete ? "bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500" : "bg-slate-950 text-slate-800 border-2 border-slate-800 cursor-not-allowed"}`}>{isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Target size={22}/> Post Opening</>}</button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
      
      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Field({ label, icon, placeholder, type = "text", value, onChange, onFocus }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
        <span className="text-indigo-500/60">{icon}</span> {label}
      </label>
      <input type={type} onFocus={onFocus} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[1.2rem] px-5 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" />
    </div>
  );
}