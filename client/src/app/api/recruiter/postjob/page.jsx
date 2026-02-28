"use client";
import React, { useState, useRef, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRecruiterJob } from "@/context/RecruiterJobContext";
import { 
  X, Briefcase, MapPin, 
  ChevronDown, Bold, 
  Loader2, Target,
  DollarSign, Clock, 
  Sparkles, BrainCircuit, CheckCircle2, Calendar as CalendarIcon,
  Search, Tag, ArrowRight, PanelRightOpen
} from "lucide-react";
import { JOB_CATEGORIES } from "@/constants/const";

export default function PostJob() {
  const BACKEND_URL = "http://localhost:8001"
  const router = useRouter();
  const [showAiBot, setShowAiBot] = useState(false);
  const [botStep, setBotStep] = useState(0);
  const [isBotComplete, setIsBotComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeDropdown, setTypeDropdown] = useState(false);
  const [workTypeDropdown, setWorkTypeDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryResults, setShowCategoryResults] = useState(false);
  const [botHasBeenOpened, setBotHasBeenOpened] = useState(false); 
  const {refreshJobs} = useRecruiterJob();
  const editorRef = useRef(null);
  const dateInputRef = useRef(null);

  const [jobData, setJobData] = useState({
    title: "", skills: [], newSkill: "",
    categories: [], experience: "", type: "Remote", 
    workType: "Full-time", location: "", stipend: "",
    closingDate: "" 
  });

  const [aiWeightage, setAiWeightage] = useState({
    hiddenSkills: [], newHiddenSkill: "",
    accommodateFresher: null, maxPositions: ""
  });

  // --- NEW: VALIDATION OBSERVER ---
  // This effect checks if the form is complete whenever jobData changes
  useEffect(() => {
    const checkFormCompletion = () => {
      // 1. Check all standard string/field values
      const coreFieldsFilled = 
        jobData.title.trim() !== "" &&
        jobData.experience.trim() !== "" &&
        jobData.location.trim() !== "" &&
        jobData.stipend.trim() !== "" &&
        jobData.closingDate !== "";

      // 2. Check array values (Tags/Skills)
      const tagsProvided = jobData.skills.length > 0 && jobData.categories.length > 0;

      // 3. Check Rich Text Editor (Briefing)
      // We check if the innerText has actual content
      const briefingProvided = editorRef.current?.innerText.trim().length > 10;

      // Only trigger the bot once when all conditions are met
      if (coreFieldsFilled && tagsProvided && briefingProvided && !botHasBeenOpened) {
        setShowAiBot(true);
        setBotHasBeenOpened(true);
      }
    };

    checkFormCompletion();
  }, [jobData, botHasBeenOpened]); // Monitors form state

  const today = new Date().toISOString().split('T')[0];

  const botQuestions = [
    { id: 0, text: "To help me find the perfect match, are there any <span class='text-indigo-400 font-bold italic uppercase tracking-tighter'>extra skills</span> or specific traits you're keeping an eye out for?", field: "hiddenSkills" },
    { id: 1, text: "I want to make sure the experience level is just right. Should we open the doors for <span class='text-indigo-400 font-bold italic uppercase tracking-tighter'>high-potential freshers</span>, or are you looking for a pro?", field: "accommodateFresher" },
    { id: 2, text: "Just so I can manage the pipeline effectively, how many <span class='text-indigo-400 font-bold italic uppercase tracking-tighter'>positions</span> are we aiming to fill for this specific role?", field: "maxPositions" }
  ];

  const handleDeploy = async () => {
    if (!isBotComplete) {
      alert("Strategy Sync is required before deployment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: jobData.title,
        description: editorRef.current?.innerHTML,
        skills: jobData.skills,
        categories: jobData.categories,
        experience: jobData.experience,
        workModel: jobData.type,
        workType: jobData.workType,
        location: jobData.location,
        stipend: jobData.stipend,
        closingDate: jobData.closingDate,
        aiWeightage: {
          hiddenSkills: aiWeightage.hiddenSkills,
          accommodateFresher: aiWeightage.accommodateFresher,
          maxPositions: Number(aiWeightage.maxPositions)
        }
      };

      const response = await fetch(`${BACKEND_URL}/api/recruiter/newJob`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to deploy.");

      await refreshJobs(true);
      alert("Requisition Indexed Successfully!");
      router.push("/api/recruiter/openings");

    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormat = (cmd) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, null);
    }
  };

  const addCategory = (cat) => {
    if (!jobData.categories.includes(cat)) {
      setJobData({ ...jobData, categories: [...jobData.categories, cat] });
    }
    setCategorySearch("");
    setShowCategoryResults(false);
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

  return (
    <div className="w-full min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="relative flex min-h-screen">
        
        <main className={`flex-1 transition-all duration-700 ease-in-out p-6 lg:p-12 ${showAiBot ? 'mr-[480px]' : ''}`}>
          
          <header className="max-w-[1100px] mx-auto mb-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl">
                    <Briefcase size={28} className="text-indigo-500"/>
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
                    New<span className="text-indigo-500">.Opening</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium italic opacity-70">Complete facts to unlock the Strategy Engine.</p>
                </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-2xl p-4 rounded-2xl border border-slate-800/50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <BrainCircuit size={20} />
                </div>
                <div className="pr-2">
                    <p className="text-[9px] uppercase font-black tracking-widest text-slate-600 mb-1 leading-none">Sync Status</p>
                    <p className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 leading-none">
                    Waiting for data... <Sparkles size={12} />
                    </p>
                </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 min-h-[40px]">
                <AnimatePresence>
                    {jobData.categories.map(cat => (
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            key={cat} 
                            className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.1em] flex items-center gap-2 group transition-all"
                        >
                            <Tag size={10} /> {cat}
                            <X size={12} className="cursor-pointer hover:text-white" onClick={() => setJobData({...jobData, categories: jobData.categories.filter(c => c !== cat)})}/>
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>
          </header>

          <div className="max-w-[1100px] mx-auto space-y-6 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Job Title</label>
                <input className="w-full h-14 bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800" placeholder="e.g. Senior Backend Engineer" value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} />
              </section>

              <section className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Role Categories</label>
                <div className="relative h-14 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                    <input className="w-full h-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800" placeholder="Search categories..." value={categorySearch} onFocus={() => setShowCategoryResults(true)} onBlur={() => setTimeout(() => setShowCategoryResults(false), 200)} onChange={(e) => setCategorySearch(e.target.value)} />
                </div>
                <AnimatePresence>
                  {showCategoryResults && categorySearch && (
                    <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="absolute top-[100%] left-0 w-full bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden z-50 max-h-[220px] overflow-y-auto shadow-2xl backdrop-blur-xl">
                      {JOB_CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                        <div key={cat} onClick={() => addCategory(cat)} className="px-6 py-4 hover:bg-indigo-600 text-[11px] font-black uppercase tracking-widest cursor-pointer border-b border-white/5 last:border-0 transition-colors">{cat}</div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            <section className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Tech Stack Requirements</label>
                <div className="flex gap-3 h-14">
                  <input className="flex-1 bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 text-sm font-bold outline-none focus:border-indigo-500/50" placeholder="e.g. Next.js, FastAPI" value={jobData.newSkill} onChange={e => setJobData({...jobData, newSkill: e.target.value})} onKeyPress={e => e.key === 'Enter' && (setJobData({...jobData, skills: [...jobData.skills, jobData.newSkill], newSkill: ""}))} />
                  <button onClick={() => setJobData({...jobData, skills: [...jobData.skills, jobData.newSkill], newSkill: ""})} className="bg-indigo-600 px-8 rounded-2xl hover:bg-indigo-500 transition-all font-black text-xs uppercase text-white shadow-xl shadow-indigo-600/20">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {jobData.skills.map(s => (
                    <span key={s} className="px-4 py-2 bg-slate-900 border border-slate-800/40 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 transition-colors hover:border-indigo-500/30">
                      {s} <X size={14} className="cursor-pointer hover:text-white" onClick={() => setJobData({...jobData, skills: jobData.skills.filter(sk => sk !== s)})}/>
                    </span>
                  ))}
                </div>
            </section>

            <section className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Job Briefing</label>
                <div className="border-2 border-slate-800/50 rounded-[2rem] bg-slate-950 overflow-hidden focus-within:border-indigo-500/40 transition-all">
                  <div className="flex gap-2 p-3 border-b border-slate-800 bg-slate-900/40">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><Bold size={16}/></button>
                  </div>
                  {/* Using onBlur to catch content changes for the observer */}
                  <div ref={editorRef} contentEditable onBlur={() => setJobData({...jobData})} className="p-8 min-h-[200px] text-base font-medium text-slate-400 outline-none leading-relaxed prose prose-invert max-w-none" />
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Experience" icon={<Clock size={16}/>} placeholder="e.g. 3+ Years" value={jobData.experience} onChange={e => setJobData({...jobData, experience: e.target.value})} />
              
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Work Model</label>
                <div onClick={() => setTypeDropdown(!typeDropdown)} className="h-14 bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 text-sm font-bold flex justify-between items-center cursor-pointer hover:border-indigo-500/40 transition-all">
                  {jobData.type} <ChevronDown size={18} className={typeDropdown ? 'rotate-180 text-indigo-500 transition-transform' : 'text-slate-700 transition-transform'}/>
                </div>
                {typeDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden z-20 shadow-2xl backdrop-blur-xl">
                    {['Remote', 'Hybrid', 'Onsite'].map(opt => <div key={opt} onClick={() => {setJobData({...jobData, type: opt}); setTypeDropdown(false)}} className="px-6 py-4 hover:bg-indigo-600 text-[11px] font-black uppercase cursor-pointer border-b border-white/5 last:border-0">{opt}</div>)}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Work Type</label>
                <div onClick={() => setWorkTypeDropdown(!workTypeDropdown)} className="h-14 bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 text-sm font-bold flex justify-between items-center cursor-pointer hover:border-indigo-500/40 transition-all">
                  {jobData.workType} <ChevronDown size={18} className={workTypeDropdown ? 'rotate-180 text-indigo-500 transition-transform' : 'text-slate-700 transition-transform'}/>
                </div>
                {workTypeDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden z-20 shadow-2xl backdrop-blur-xl">
                    {['Full-time', 'Internship', 'Part-time'].map(opt => <div key={opt} onClick={() => {setJobData({...jobData, workType: opt}); setWorkTypeDropdown(false)}} className="px-6 py-4 hover:bg-indigo-600 text-[11px] font-black uppercase cursor-pointer border-b border-white/5 last:border-0">{opt}</div>)}
                  </div>
                )}
              </div>

              <Field label="Salary Range" icon={<DollarSign size={16}/>} placeholder="e.g. 20k-40k" value={jobData.stipend} onChange={e => setJobData({...jobData, stipend: e.target.value})} />
              <Field label="Location" icon={<MapPin size={16}/>} placeholder="e.g. Kochi" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} />
              
              <div className="space-y-2 relative group">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Deadline</label>
                <div onClick={() => dateInputRef.current.showPicker()} className="h-14 bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 text-sm font-bold flex justify-between items-center cursor-pointer hover:border-indigo-500/40 transition-all">
                  <span className={jobData.closingDate ? "text-white" : "text-slate-700"}>{jobData.closingDate || "YYYY-MM-DD"}</span>
                  <CalendarIcon size={18} className="text-slate-600"/>
                </div>
                {/* Triggering bot only through useEffect now */}
                <input ref={dateInputRef} type="date" min={today} className="absolute opacity-0 pointer-events-none" onChange={(e) => setJobData({...jobData, closingDate: e.target.value})} />
              </div>
            </div>

            <AnimatePresence>
                {!showAiBot && isBotComplete && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex justify-end pt-12">
                        <button onClick={handleDeploy} className="h-20 px-16 rounded-3xl bg-indigo-600 text-white font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4">
                            {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Target size={24}/> Deploy opening</>}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
            {!showAiBot && botHasBeenOpened && (
                <motion.button initial={{ x: 100 }} animate={{ x: 0 }} exit={{ x: 100 }} onClick={() => setShowAiBot(true)} className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-900 border-l-2 border-y-2 border-slate-800 p-4 rounded-l-3xl shadow-2xl z-40 group flex flex-col items-center gap-3 hover:bg-slate-800 transition-all">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40" />
                        <BrainCircuit size={24} className="text-indigo-400 relative" />
                    </div>
                    <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-indigo-400 transition-colors py-2">Strategy</span>
                    <PanelRightOpen size={18} className="text-slate-700" />
                </motion.button>
            )}
        </AnimatePresence>

        <AnimatePresence>
          {showAiBot && (
            <motion.aside initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 w-[480px] h-full bg-[#020617] border-l-2 border-slate-800 shadow-[-30px_0_60px_rgba(0,0,0,0.8)] z-50 flex flex-col backdrop-blur-3xl">
              <div className="p-10 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 flex items-center justify-center bg-indigo-500/10 rounded-2xl border-2 border-indigo-500/30">
                        <BrainCircuit size={28} className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white tracking-widest uppercase italic leading-none">Decision<span className="text-indigo-500">.Engine</span></h3>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Matching Active</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowAiBot(false)} className="p-2 hover:bg-slate-900 rounded-xl transition-colors"><X size={20} className="text-slate-600" /></button>
              </div>

              <div className="flex-1 p-10 overflow-y-auto space-y-12">
                <AnimatePresence mode="wait">
                  {!isBotComplete ? (
                    <motion.div key={botStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                      <div className="relative">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block opacity-70">Requirement {botStep + 1}</span>
                        <p className="text-2xl text-white leading-tight font-bold tracking-tight pr-4" dangerouslySetInnerHTML={{ __html: botQuestions[botStep]?.text }} />
                      </div>
                      <div className="space-y-6">
                        {botStep === 0 && (
                          <div className="space-y-4">
                            <div className="relative">
                              <input className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-indigo-500/50" placeholder="eg.Problem Solving" value={aiWeightage.newHiddenSkill} onChange={(e) => setAiWeightage({...aiWeightage, newHiddenSkill: e.target.value})} onKeyPress={e => e.key === 'Enter' && addHiddenSkill()} />
                              <button onClick={addHiddenSkill} className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 p-3 rounded-xl text-white"><ArrowRight size={18}/></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {aiWeightage.hiddenSkills.map(s => <span key={s} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">{s} <X size={12} className="cursor-pointer hover:text-white" onClick={() => setAiWeightage({...aiWeightage, hiddenSkills: aiWeightage.hiddenSkills.filter(h => h !== s)})}/></span>)}
                            </div>
                          </div>
                        )}
                        {botStep === 1 && (
                          <div className="grid grid-cols-1 gap-3">
                            {['Yes, open it', 'Prefer Pro'].map(opt => <button key={opt} onClick={() => {setAiWeightage({...aiWeightage, accommodateFresher: opt}); setBotStep(2)}} className="w-full py-5 rounded-2xl border-2 border-slate-800 text-[10px] font-black hover:border-indigo-500 hover:bg-indigo-600 transition-all text-slate-500 hover:text-white uppercase tracking-widest text-left px-8">{opt}</button>)}
                          </div>
                        )}
                        {botStep === 2 && <input type="number" min={0} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-indigo-500/50" placeholder="Positions..." value={aiWeightage.maxPositions} onChange={(e) => setAiWeightage({...aiWeightage, maxPositions: e.target.value})} />}
                      </div>
                      <div className="pt-4"><button onClick={() => botStep < 2 ? setBotStep(botStep + 1) : setIsBotComplete(true)} className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95">Continue Analysis</button></div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center h-full space-y-6 pt-20">
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center text-emerald-400 border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]"><CheckCircle2 size={56}/></div>
                      <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Engine<span className="text-emerald-400">.Primed</span></h4>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-10 border-t-2 border-slate-800 bg-slate-950/50">
                <button disabled={!isBotComplete || isSubmitting} onClick={handleDeploy} className={`w-full py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] flex items-center justify-center gap-3 transition-all ${isBotComplete ? "bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500" : "bg-slate-900 text-slate-800 border-2 border-slate-800 cursor-not-allowed"}`}>{isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Target size={22}/> Deploy Opening</>}</button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, icon, placeholder, type = "text", value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2 flex items-center gap-2"><span className="text-indigo-500/60">{icon}</span> {label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full h-14 bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800" />
    </div>
  );
}