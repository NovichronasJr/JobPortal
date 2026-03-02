"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar,Clock,  
  BrainCircuit,
  X, Video, Lock, Loader2,CheckCircle2,
} from "lucide-react";

// --- 1. DYNAMIC AGORA IMPORT ---
const AgoraSync = dynamic(() => import("@/components/AgoraSync"), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center">
       <Loader2 className="animate-spin text-indigo-500" size={40} />
    </div>
  )
});

export default function PipelineHub() {
  const [pipeline, setPipeline] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [form, setForm] = useState({ title: "Technical Sync: Round 1", date: "", time: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BACKEND_URL = "http://localhost:8001";

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        const [pipelineRes, interviewRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/recruiter/pipeline`, { credentials: 'include' }),
          fetch(`${BACKEND_URL}/api/recruiter/my-interviews`, { credentials: 'include' })
        ]);
        
        const pResult = await pipelineRes.json();
        const iResult = await interviewRes.json();

        if (pResult.success) setPipeline(pResult.pipeline);
        if (iResult.success) setInterviews(iResult.interviews);
      } catch (err) { console.error("Matrix Sync Error:", err); }
      finally { setLoading(false); }
    };
    fetchMatrixData();
  }, []);

  // --- LOGIC: MARK INTERVIEW AS COMPLETED ---
  const handleMarkComplete = async (interviewId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/recruiter/interviews/complete/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        // Update local state to reflect completion immediately
        setInterviews(prev => prev.map(i => i._id === interviewId ? { ...i, status: 'Completed' } : i));
      }
    } catch (err) { console.error("Completion Error:", err); }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const scheduledTime = new Date(`${form.date}T${form.time}`);

    try {
      const res = await fetch(`${BACKEND_URL}/api/recruiter/interviews/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: schedulingApp._id,
          title: form.title,
          scheduledTime
        }),
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        setInterviews([...interviews, result.interview]);
        setSchedulingApp(null);
      }
    } catch (err) { console.error("Scheduling Failure:", err); }
    finally { setIsSubmitting(false); }
  };

  const groupedData = pipeline.reduce((acc, app) => {
    const jobTitle = app.jobId.title;
    if (!acc[jobTitle]) acc[jobTitle] = [];
    acc[jobTitle].push(app);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
      <BrainCircuit className="animate-pulse text-indigo-500 mb-4" size={40} />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Calibrating Matrix Nodes</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto space-y-12 bg-[#020617] min-h-screen text-slate-200">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
            Interview<span className="text-indigo-500">.Matrix</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest italic">
            Synchronizing <span className="text-white">{pipeline.length}</span> verified candidates.
          </p>
        </div>
      </header>

      {/* --- PIPELINE GRID --- */}
      <div className="space-y-20">
        {Object.keys(groupedData).map((jobTitle, idx) => (
          <section key={idx} className="space-y-8">
            <div className="flex items-center gap-4">
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{jobTitle}</h2>
               <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {groupedData[jobTitle].map((app) => {
                const interviewNode = interviews.find(i => i.applicationId === app._id);
                
                // Readiness logic: Status must be 'Scheduled' and within the 10-min window
                const isReady = interviewNode && 
                                interviewNode.status === "Scheduled" && 
                                new Date() >= new Date(new Date(interviewNode.scheduledTime).getTime() - 10 * 60000);

                return (
                  <motion.div key={app._id} className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] relative group">
                    <div className="flex items-center gap-4 mb-8">
                      <img 
                        src={`${BACKEND_URL}/${app.candidateId.profilePhoto}`} 
                        className="w-14 h-14 rounded-2xl border-2 border-slate-800 object-cover" 
                        onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=" + app.candidateId.firstName}
                      />
                      <div>
                        <h4 className="font-bold text-white uppercase italic">{app.candidateId.firstName}</h4>
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">AI Match: {app.aiScore}%</span>
                      </div>
                    </div>

                    {interviewNode ? (
                      <div className="space-y-4">
                        {/* TIME & STATUS BADGE */}
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-2 text-indigo-400">
                             <Clock size={14} />
                             <span className="text-[10px] font-black uppercase">
                               {interviewNode.status === 'Completed' ? 'Session Finalized' : 
                                `${new Date(interviewNode.scheduledTime).toLocaleDateString()} @ ${new Date(interviewNode.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                             </span>
                           </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        {interviewNode.status === 'Completed' ? (
                          <div className="w-full py-4 bg-slate-900 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 italic">
                            Node Synchronized <CheckCircle2 size={14} />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {isReady ? (
                              <button 
                                onClick={() => setActiveSession({ 
                                  channel: interviewNode.agoraChannel, 
                                  title: interviewNode.title 
                                })}
                                className="py-4 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 animate-pulse"
                              >
                                Join <Video size={14} />
                              </button>
                            ) : (
                              <button disabled className="py-4 bg-slate-900 border border-slate-800 text-slate-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 cursor-not-allowed">
                                Locked <Lock size={12} />
                              </button>
                            )}

                            <button 
                              onClick={() => handleMarkComplete(interviewNode._id)}
                              className="py-4 bg-slate-800 border border-slate-700 text-white rounded-xl text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all"
                            >
                              Complete
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSchedulingApp(app)}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/10"
                      >
                        <Calendar size={16} /> Schedule Sync
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* --- AGORA LIVE OVERLAY --- */}
      <AnimatePresence>
        {activeSession && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <AgoraSync 
              channel={activeSession.channel} 
              title={activeSession.title}
              onClose={() => setActiveSession(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SCHEDULING MODAL --- */}
      <AnimatePresence>
        {schedulingApp && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSchedulingApp(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-0 m-auto w-full max-w-md h-fit bg-[#020617] border border-white/10 rounded-[3rem] p-10 z-[70] shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">New.Sync</h3>
                <button onClick={() => setSchedulingApp(null)} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              
              <form onSubmit={handleScheduleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Interview Title</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Date</label>
                    <input type="date" required onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Time</label>
                    <input type="time" required onChange={e => setForm({...form, time: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none" />
                  </div>
                </div>
                <button disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-600/20">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Establish Sync Node"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}