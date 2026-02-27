"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
   Phone, MapPin, Code2, FileText, 
   Plus, X, Loader2, Camera, ShieldCheck, 
   GraduationCap, Briefcase
} from "lucide-react";

export default function ProfileEditor() {
  const { user, loading: authLoading, checkUser } = useAuth();
  const router = useRouter();
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null); 
  
  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    bio: "",
    phone: "",
    address: "",
    skills: [],
    experienceYears: 0,
    education: [],
    newSkill: "",
    newEdu: { institution: "", degree: "", year: "" } 
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // Hydrate Data from AuthContext
  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setFormData((prev) => ({
        ...prev,
        bio: p.bio || "",
        phone: p.phone || "",
        address: p.address || "",
        skills: p.skills || [],
        experienceYears: p.experienceYears || 0,
        education: p.education || [],
      }));
      const photoPath = p.profilePhoto || 'default_pics/candidate.jpg';
      setPhotoPreview(photoPath.startsWith('http') ? photoPath : `${BACKEND_URL}/${photoPath}`);
    }
  }, [user, BACKEND_URL]);

  // --- LOGIC HANDLERS ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, prev.newSkill.trim()], newSkill: "" }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const addEducation = () => {
    const { institution, degree, year } = formData.newEdu;
    if (institution && degree && year) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, prev.newEdu],
        newEdu: { institution: "", degree: "", year: "" }
      }));
    }
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
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
    data.append("experienceYears", formData.experienceYears);
    data.append("skills", JSON.stringify(formData.skills));
    data.append("education", JSON.stringify(formData.education));
    
    if (selectedPhoto) data.append("profilephoto", selectedPhoto);
    if (selectedResume) data.append("resume", selectedResume);

    try {
      const res = await fetch(`${BACKEND_URL}/api/candidate/update-profile`, {
        method: "PUT",
        credentials: "include",
        body: data,
      });

      if (res.ok) {
        if (checkUser) await checkUser(); 
        setStatus("success");
        setIsEditing(false);
        setSelectedPhoto(null);
        setSelectedResume(null);
        router.refresh(); 
        setTimeout(() => setStatus(null), 3000);
      } else { throw new Error(); }
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
    <div className="p-4 lg:p-12 max-w-7xl mx-auto space-y-10 bg-[#020617] min-h-screen text-slate-200">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800/60 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-indigo-500" size={24} />
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">Candidate<span className="text-indigo-500">.Profile</span></h1>
          </div>
          <p className="text-slate-500 font-medium tracking-tight">Managing Professional Identity & Industry Metrics.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {status && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {status === 'success' ? 'Sync Success' : 'Sync Error'}
              </motion.div>
            )}
          </AnimatePresence>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5">
              Edit Identity
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="bg-slate-900 border border-slate-800 text-slate-400 px-6 py-4 rounded-2xl font-bold hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleUpdate} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- LEFT COLUMN: IDENTITY & CONTACT --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900/40 border-2 border-indigo-500/20 shadow-2xl shadow-indigo-500/5 p-10 rounded-[3.5rem] flex flex-col items-center text-center relative overflow-hidden group">
            <div className="relative w-44 h-44 mb-8">
              <div className="w-full h-full rounded-[3rem] overflow-hidden border-2 border-slate-700 p-1 bg-slate-800 shadow-2xl transition-all group-hover:border-indigo-500/50">
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover rounded-[2.8rem]" />
              </div>
              {isEditing && (
                <button onClick={() => photoInputRef.current.click()} className="absolute inset-1 bg-black/60 backdrop-blur-md rounded-[2.8rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Camera className="text-white mb-2" size={28} />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Update</span>
                </button>
              )}
              <input type="file" ref={photoInputRef} hidden onChange={handlePhotoChange} accept="image/*" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{user?.name}</h2>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
                ID: {user?.id?.slice(-5).toUpperCase() || "NEW-CAND"}
              </p>
            </div>
          </div>

          <SectionCard title="Contact Framework">
            <InputField label="Phone" icon={<Phone size={16}/>} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} readOnly={!isEditing} />
            <InputField label="Location" icon={<MapPin size={16}/>} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} readOnly={!isEditing} />
          </SectionCard>
        </div>

        {/* --- RIGHT COLUMN: PROFESSIONAL ENGINE --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SENIORITY SLIDER */}
          <SectionCard title="Seniority Metric">
            <div className="p-8 bg-slate-950/40 border border-slate-800/60 rounded-[2.5rem] space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                    {formData.experienceYears === 0 ? "Fresher" : `${formData.experienceYears} Years`}
                  </h4>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <Briefcase size={12} /> Professional Experience
                  </p>
                </div>
              </div>
              {isEditing && (
                <div className="space-y-4">
                  <input 
                    type="range" min="0" max="60" value={formData.experienceYears}
                    onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <span>Fresher</span>
                    <span>30 Years</span>
                    <span>60 Years</span>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* DYNAMIC EDUCATION SECTION */}
          <SectionCard title="Academic Foundation">
            <div className="space-y-6">
              {isEditing && (
                <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white" placeholder="Institution" value={formData.newEdu.institution} onChange={e => setFormData({...formData, newEdu: {...formData.newEdu, institution: e.target.value}})} />
                    <input className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white" placeholder="Degree" value={formData.newEdu.degree} onChange={e => setFormData({...formData, newEdu: {...formData.newEdu, degree: e.target.value}})} />
                    <input type="number" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white" placeholder="Year" value={formData.newEdu.year} onChange={e => setFormData({...formData, newEdu: {...formData.newEdu, year: e.target.value}})} />
                  </div>
                  <button onClick={addEducation} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg">
                    Add Qualification
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="relative group p-6 bg-slate-950/40 border border-slate-800/60 rounded-3xl hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><GraduationCap size={20} /></div>
                      <div>
                        <h5 className="text-white font-bold text-sm tracking-tight">{edu.degree}</h5>
                        <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{edu.institution}</p>
                        <p className="text-slate-600 text-[10px] mt-1 font-bold italic">Class of {edu.year}</p>
                      </div>
                    </div>
                    {isEditing && <X size={16} className="absolute top-4 right-4 text-slate-800 hover:text-red-500 cursor-pointer" onClick={() => removeEducation(idx)} />}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* TECH STACK & ASSETS */}
          <SectionCard title="Verified Technical Skills">
            <div className="bg-slate-950/60 p-8 rounded-[2rem] border border-slate-800">
              {isEditing && (
                <div className="flex gap-3 mb-8">
                  <input type="text" className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-sm" placeholder="Add skill..." value={formData.newSkill} onChange={(e) => setFormData({...formData, newSkill: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                  <button onClick={addSkill} className="bg-indigo-600 text-white px-8 rounded-2xl"><Plus size={20} /></button>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {formData.skills.map((skill) => (
                  <span key={skill} className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {skill} {isEditing && <X size={14} className="ml-2 inline cursor-pointer hover:text-red-400" onClick={() => removeSkill(skill)} />}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Professional Summary">
            <textarea className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-8 text-sm text-slate-300 min-h-[150px] outline-none" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} readOnly={!isEditing} />
          </SectionCard>

          <SectionCard title="Decision Assets">
            <div className={`p-8 rounded-[2rem] border-2 border-dashed ${isEditing ? 'border-indigo-500/30' : 'border-slate-800'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <FileText className={hasResume ? "text-emerald-400" : "text-slate-700"} size={32} />
                  <div>
                    <h4 className="text-white font-bold">{hasResume ? "Resume Synced" : "No Resume"}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black">AI Auto-Extraction Enabled</p>
                  </div>
                </div>
                {isEditing ? (
                  <button onClick={() => resumeInputRef.current.click()} className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Update PDF</button>
                ) : (
                  hasResume && <a href={`${BACKEND_URL}/${user?.profile?.resumeUrl}`} target="_blank" className="text-slate-400 border border-slate-800 px-6 py-3 rounded-xl font-bold text-[10px] uppercase">Preview</a>
                )}
                <input type="file" ref={resumeInputRef} hidden onChange={(e) => setSelectedResume(e.target.files[0])} accept=".pdf" />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// --- SHARED COMPONENTS ---
function SectionCard({ title, children }) {
  return (
    <div className="bg-slate-900/20 border border-slate-800/60 hover:border-indigo-500/40 p-8 lg:p-10 rounded-[3rem] space-y-8 backdrop-blur-3xl shadow-xl transition-all duration-500">
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-slate-800/40 pb-5 flex items-center gap-3">
        <Code2 size={12} className="text-indigo-500" /> {title}
      </h3>
      {children}
    </div>
  );
}

function InputField({ label, icon, value, onChange, readOnly = false }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
      <div className={`flex items-center gap-5 bg-slate-950 border ${readOnly ? 'border-slate-800/40' : 'border-indigo-500/30'} rounded-2xl px-6 py-4 shadow-inner`}>
        <span className="text-slate-700">{icon}</span>
        <input className="bg-transparent text-sm text-slate-200 outline-none w-full" value={value} onChange={onChange} disabled={readOnly} />
      </div>
    </div>
  );
}