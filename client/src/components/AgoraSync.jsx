"use client";
import dynamic from 'next/dynamic';
import { X, Zap } from "lucide-react";

// SSR: false is mandatory for Agora in Next.js
const AgoraUIKit = dynamic(() => import("agora-react-uikit"), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Zap size={40} className="text-indigo-500 animate-pulse" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Initializing Neural Link</p>
      </div>
    </div>
  )
});

export default function AgoraSync({ channel, title, onClose }) {
  // --- SYNC SAFETY ---
  // Ensures both sides always land in the same room regardless of input casing
  const safeChannel = channel?.toLowerCase().trim() || "default-sync";

  const rtcProps = {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID, 
    channel: safeChannel,
    token: null, // Valid for Testing Mode/App ID only projects
    role: 'host', // Required for two-way video/audio
    layout: 1     // Grid layout (Side-by-side)
  };

  const callbacks = {
    EndCall: () => onClose(),
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-200">
      {/* --- NEURAL HEADER --- */}
      <div className="h-20 px-8 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <Zap size={20} fill="currentColor" className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-widest text-white">{title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Node ID: {safeChannel}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 border border-red-500/20 active:scale-95"
        >
          Terminate Sync <X size={14} />
        </button>
      </div>

      {/* --- AGORA INTERFACE --- */}
      <div className="flex-1 relative overflow-hidden">
        <AgoraUIKit 
          rtcProps={rtcProps} 
          callbacks={callbacks} 
          styleProps={{
            localVideoContainer: { 
              border: '2px solid #6366f1', 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            },
            remoteVideoContainer: { 
              borderRadius: '24px', 
              overflow: 'hidden' 
            },
            UIKitContainer: { 
              height: '100%', 
              width: '100%', 
              background: '#020617',
              padding: '20px'
            }
          }}
        />
      </div>

      {/* --- FOOTER STATUS --- */}
      <div className="p-4 border-t border-white/5 bg-slate-950/50 flex justify-center">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Vonnue Intelligence Systems // Encrypted Neural Session</p>
      </div>
    </div>
  );
}