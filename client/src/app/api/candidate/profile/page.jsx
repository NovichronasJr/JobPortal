"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // Added for routing if needed
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  User, Mail, Phone, MapPin, Code2, FileText, 
  Save, Plus, X, Loader2, ExternalLink, Camera, 
  Edit3, Ban, UploadCloud, Sparkles, ShieldCheck, AlertCircle
} from "lucide-react";

export default function ProfileEditor() {
  // --- ADDED checkUser FROM AUTH CONTEXT ---
  const { user, loading: authLoading, checkUser } = useAuth();
  const router = useRouter();
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null); 
  
  const [formData, setFormData] = useState({
    bio: "",
    phone: "",
    address: "",
    skills: [],
    newSkill: "" 
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // Hydrate Data
  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setFormData((prev) => ({
        ...prev,
        bio: p.bio || "",
        phone: p.phone || "",
        address: p.address || "",
        skills: p.skills || [],
      }));
      const photoPath = p.profilePhoto || 'default_pics/candidate.jpg';
      setPhotoPreview(photoPath.startsWith('http') ? photoPath : `${BACKEND_URL}/${photoPath}`);
    }
  }, [user, BACKEND_URL]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill)) {
      setFormData(prev => ({ 
        ...prev, 
        skills: [...prev.skills, prev.newSkill.trim()], 
        newSkill: "" 
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);
    
    const data = new FormData();
    data.append("bio", formData.bio);
    data.append("phone", formData.phone);
    data.append("address", formData.address);
    data.append("skills", JSON.stringify(formData.skills));
    
    if (selectedPhoto) data.append("profilephoto", selectedPhoto);
    if (selectedResume) data.append("resume", selectedResume);

    try {
      const res = await fetch(`${BACKEND_URL}/api/candidate/update-profile`, {
        method: "PUT",
        credentials: "include",
        body: data,
      });

      if (res.ok) {
        // --- KEY FIX START ---
        // 1. Re-fetch the user data to update AuthContext globally
        if (checkUser) await checkUser(); 
        
        // 2. Update local UI state
        setStatus("success");
        setIsEditing(false);
        setSelectedPhoto(null);
        setSelectedResume(null);
        
        // 3. (Optional) Force a Next.js soft refresh to clear any cached paths
        router.refresh(); 
        // --- KEY FIX END ---

        setTimeout(() => setStatus(null), 3000);
      } else { 
        throw new Error(); 
      }
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    } finally { setIsSaving(false); }
  };

  const hasResume = user?.profile?.resumeUrl || selectedResume;

  if (authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
      <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Syncing DNA...</p>
    </div>
  );

  return (
    <div className="p-4 lg:p-12 max-w-7xl mx-auto space-y-10 bg-[#020617] min-h-screen text-slate-200 selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800/60 pb-10 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-indigo-500" size={24} />
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">CANDIDATE<span className="text-indigo-500">.PROFILE</span></h1>
          </div>
          <p className="text-slate-500 font-medium">Manage your professional identity and AI matching parameters.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
          <AnimatePresence>
            {status && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {status === 'success' ? 'Cloud Sync Successful' : 'Sync Error'}
              </motion.div>
            )}
          </AnimatePresence>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-xl">
              <Edit3 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => {setIsEditing(false); setSelectedPhoto(null); setSelectedResume(null);}} className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">
                <Ban size={18} /> Cancel
              </button>
              <button onClick={handleUpdate} disabled={isSaving} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Submit Changes</>}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900/40 border border-slate-800/60 p-10 rounded-[3.5rem] flex flex-col items-center text-center relative overflow-hidden group">
            <div className="relative w-44 h-44 mb-8">
              <div className="w-full h-full rounded-[3rem] overflow-hidden border-2 border-slate-700 p-1 bg-slate-800 shadow-2xl transition-all group-hover:border-indigo-500/50">
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover rounded-[2.8rem]" />
              </div>
              {isEditing && (
                <button onClick={() => photoInputRef.current.click()} className="absolute inset-1 bg-black/60 backdrop-blur-md rounded-[2.8rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10">
                  <Camera className="text-white mb-2" size={28} />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Update Photo</span>
                </button>
              )}
              <input type="file" ref={photoInputRef} hidden onChange={handlePhotoChange} accept="image/*" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{user?.name}</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-3 italic">ID: {user?.id?.substring(0,8).toUpperCase()}</p>
          </div>

          <SectionCard title="Communication Framework">
            <InputField label="Primary Email" icon={<Mail size={16}/>} value={user?.email} readOnly />
            <InputField label="Contact Phone" icon={<Phone size={16}/>} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} readOnly={!isEditing} placeholder="+91 XXXXX XXXXX" />
          </SectionCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          <SectionCard title="Decision Assets & AI Extraction">
            <div className={`p-8 rounded-[2rem] border-2 border-dashed transition-all ${isEditing ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-slate-950/40 border-slate-800'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${hasResume ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>
                    <FileText size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{hasResume ? "Active Resume Indexed" : "No Resume Detected"}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{hasResume ? "AI-Powered skill extraction enabled." : "Upload a PDF to unlock your AI Technical Score."}</p>
                  </div>
                </div>

                {isEditing ? (
                  <button onClick={() => resumeInputRef.current.click()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg">
                    <UploadCloud size={16} /> {hasResume ? "Update PDF" : "Upload PDF"}
                  </button>
                ) : (
                  user?.profile?.resumeUrl && (
                    <a href={`${BACKEND_URL}/${user.profile.resumeUrl}`} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all border border-slate-800">
                      <ExternalLink size={16} /> Preview
                    </a>
                  )
                )}
                <input type="file" ref={resumeInputRef} hidden onChange={(e) => setSelectedResume(e.target.files[0])} accept=".pdf" />
              </div>
              {selectedResume && (
                <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-400 flex items-center gap-2">
                  <Sparkles size={12} /> Staged for analysis: {selectedResume.name}
                </div>
              )}
            </div>
          </SectionCard>

          {hasResume ? (
            <SectionCard title="Verified Technical Skills">
              <div className="relative bg-slate-950/60 p-8 rounded-[2rem] border border-slate-800 shadow-inner">
                {isEditing && (
                  <div className="flex gap-3 mb-8">
                    <input type="text" className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-indigo-500 outline-none transition-all" placeholder="Add skill (e.g. Next.js)..." value={formData.newSkill} onChange={(e) => setFormData({...formData, newSkill: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                    <button type="button" onClick={addSkill} className="bg-indigo-600 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-xs"><Plus size={20} /></button>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 hover:border-indigo-500/40 hover:text-indigo-300 transition-all cursor-default">
                      {skill}
                      {isEditing && <X size={14} className="cursor-pointer text-slate-700 hover:text-red-400" onClick={() => removeSkill(skill)} />}
                    </span>
                  ))}
                </div>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Professional Summary">
            <textarea className={`w-full bg-slate-950/50 border ${isEditing ? 'border-indigo-500/30 ring-1 ring-indigo-500/10' : 'border-slate-800'} rounded-3xl p-8 text-sm text-slate-300 outline-none transition-all min-h-[200px] leading-relaxed resize-none shadow-inner`} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} readOnly={!isEditing} />
          </SectionCard>

          <SectionCard title="Physical Base">
            <InputField label="City/Country" icon={<MapPin size={16}/>} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} readOnly={!isEditing} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// REUSABLE COMPONENTS
function SectionCard({ title, children }) {
  return (
    <div className="bg-slate-900/20 border border-slate-800/40 p-8 lg:p-10 rounded-[3rem] space-y-8 backdrop-blur-3xl shadow-2xl transition-all hover:border-slate-700/50">
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-slate-800/40 pb-5 flex items-center gap-3">
        <Code2 size={12} className="text-indigo-500" /> {title}
      </h3>
      {children}
    </div>
  );
}

function InputField({ label, icon, value, onChange, readOnly = false, placeholder = "" }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
      <div className={`flex items-center gap-5 bg-slate-950 border ${readOnly ? 'border-slate-800/40 opacity-70' : 'border-indigo-500/30 ring-1 ring-indigo-500/10'} rounded-2xl px-6 py-4.5 transition-all shadow-inner`}>
        <span className="text-slate-700">{icon}</span>
        <input className="bg-transparent text-sm text-slate-200 outline-none w-full placeholder:text-slate-900" value={value} onChange={onChange} disabled={readOnly} placeholder={placeholder} />
      </div>
    </div>
  );
}