"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
   Video, Lock, BrainCircuit, 
  User, CheckCircle2, ShieldCheck,
  Calendar, Loader2
} from "lucide-react";

// --- 1. DYNAMIC AGORA IMPORT ---
// Prevents SSR issues with the Agora SDK
const AgoraSync = dynamic(() => import("@/components/AgoraSync"), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center">
       <Loader2 className="animate-spin text-indigo-500" size={40} />
    </div>
  )
});

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  
  const BACKEND_URL = "http://localhost:8001";

  // --- 2. FETCH INTERVIEW MATRIX ---
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/candidate/my-interviews`, {
          method: 'GET',
          credentials: 'include' 
        });
        const result = await res.json();
        if (result.success) {
          setInterviews(result.interviews);
        }
      } catch (err) { 
        console.error("Matrix Sync Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchInterviews();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
      <BrainCircuit className="animate-pulse text-indigo-500 mb-4" size={40} />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Interview Matrix</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-12 bg-[#020617] min-h-screen text-slate-200">
      
      {/* --- HEADER --- */}
      <header className="border-b border-white/5 pb-10">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
          Interview<span className="text-indigo-500">.Matrix</span>
        </h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Verified Neural Sync Sessions</p>
      </header>

      {/* --- INTERVIEW NODES LIST --- */}
      <div className="grid gap-6">
        {interviews.length > 0 ? interviews.map((node) => {
          // Logic: Within 10 mins of start time
          const isTimeReady = new Date() >= new Date(new Date(node.scheduledTime).getTime() - 10 * 60000);
          
          // Logic: Node must not be marked 'Completed' by Recruiter
          const isNodeActive = node.status === "Scheduled";

          return (
            <motion.div 
              key={node._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 transition-all duration-500 border ${
                node.status === "Completed" 
                ? "bg-slate-900/40 border-emerald-500/20 opacity-80" 
                : "bg-slate-950 border-slate-800"
              }`}
            >
              {/* LEFT: JOB & RECRUITER INFO */}
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors ${
                  node.status === "Completed" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                }`}>
                  {node.status === "Completed" ? <CheckCircle2 size={24} /> : <Video size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase italic leading-none mb-2">
                    {node.jobId?.title || "Position Sync"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Recruiter: {node.recruiterId?.firstName} {node.recruiterId?.lastName}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: TIME & ACTION ACTION */}
              <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">
                    {node.status === "Completed" ? "Sync Verdict" : "Scheduled Time"}
                  </p>
                  <p className={`text-sm font-bold uppercase ${node.status === "Completed" ? "text-emerald-400" : "text-white"}`}>
                    {node.status === "Completed" 
                      ? "Session Successfully Finalized" 
                      : new Date(node.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                {/* DYNAMIC ACTION HANDLER */}
                {node.status === "Completed" ? (
                  /* STATE: FINISHED */
                  <div className="px-10 py-4 bg-slate-900 border border-emerald-500/30 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/5">
                    <ShieldCheck size={14} /> Sync Finalized
                  </div>
                ) : isTimeReady ? (
                  /* STATE: READY TO JOIN */
                  <button 
                    onClick={() => setActiveSession({ channel: node.agoraChannel, title: node.title })}
                    className="px-10 py-4 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse hover:bg-white transition-all w-full md:w-auto shadow-xl shadow-emerald-500/20"
                  >
                    Enter Room
                  </button>
                ) : (
                  /* STATE: UPCOMING BUT LOCKED */
                  <div className="px-10 py-4 bg-slate-900 border border-slate-800 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Lock size={14} /> Node Locked
                  </div>
                )}
              </div>
            </motion.div>
          );
        }) : (
          /* EMPTY STATE */
          <div className="py-24 text-center bg-slate-900/20 border border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center gap-4">
            <Calendar className="text-slate-800" size={40} />
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">No active sync nodes detected in your matrix.</p>
          </div>
        )}
      </div>

      {/* --- AGORA LIVE OVERLAY --- */}
      <AnimatePresence>
        {activeSession && (
          <motion.div 
            className="fixed inset-0 z-[100]" 
            initial={{ opacity: 0, scale: 1.1 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <AgoraSync 
              channel={activeSession.channel} 
              title={activeSession.title} 
              onClose={() => setActiveSession(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}