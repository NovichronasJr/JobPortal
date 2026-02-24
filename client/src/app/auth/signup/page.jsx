"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, ArrowLeft, Upload, ShieldCheck, LogIn, Loader2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const progress = (step / 2) * 100;

  const handleBackToLogin = () => {
    router.replace('/auth/login'); 
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-500/30">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl z-10">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-3"
          >
            Create your account
          </motion.h1>
          <p className="text-slate-400">
            Step {step} of 2: {step === 1 ? "Choose your path" : `Complete ${role} profile`}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-sm rounded-full h-1" />
          <div className="w-full bg-slate-800/50 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="bg-gradient-to-r from-blue-600 to-indigo-400 h-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>

        {/* Global Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="selection-step"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RoleOption 
                  title="Candidate"
                  icon={<User className="w-8 h-8" />}
                  description="Explore job opportunities and AI career insights."
                  onClick={() => { setRole('candidate'); setStep(2); setError(""); }}
                  activeColor="border-blue-500/50 bg-blue-500/5"
                />
                <RoleOption 
                  title="Recruiter"
                  icon={<Briefcase className="w-8 h-8" />}
                  description="Post positions and manage decision pipelines."
                  onClick={() => { setRole('recruiter'); setStep(2); setError(""); }}
                  activeColor="border-indigo-500/50 bg-indigo-500/5"
                />
              </div>

              <button 
                onClick={handleBackToLogin}
                className="group flex items-center justify-center gap-2 py-4 text-slate-500 hover:text-white transition-all text-sm font-medium border border-dashed border-slate-800 rounded-2xl hover:border-slate-600 hover:bg-slate-900/40"
              >
                <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                Already have an account? Sign in here
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="form-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-8 rounded-3xl shadow-2xl shadow-black/50"
            >
              <button 
                onClick={() => { setStep(1); setError(""); }}
                disabled={isLoading}
                className="group mb-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to role selection
              </button>

              {role === 'candidate' ? (
                <CandidateForm isLoading={isLoading} setIsLoading={setIsLoading} setError={setError} />
              ) : (
                <RecruiterForm isLoading={isLoading} setIsLoading={setIsLoading} setError={setError} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* LOGIC COMPONENTS */

function CandidateForm({ isLoading, setIsLoading, setError }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "", address: ""
  });
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append("role", "candidate");
    if (file) data.append("resume", file);

    try {
      const res = await fetch("http://localhost:8001/auth/signup", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Signup failed");
      router.push("/auth/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="First Name" required onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
        <InputField label="Last Name" required onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
      </div>
      <InputField label="Email Address" type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
      <InputField label="Password" type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
      <InputField label="Phone Number" type="tel" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      
      <div className="relative p-6 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-800/20 hover:bg-slate-800/40 transition-all cursor-pointer text-center group">
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
        <Upload className="w-6 h-6 mx-auto mb-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
        <p className="text-sm font-medium">{file ? file.name : "Click to upload Resume"}</p>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">PDF or DOCX (Max 5MB)</p>
      </div>
      <SubmitButton isLoading={isLoading} color="bg-blue-600" />
    </form>
  );
}

function RecruiterForm({ isLoading, setIsLoading, setError }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", organizationName: "", organizationWebsite: ""
  });
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append("role", "recruiter");
    if (file) data.append("logo", file);

    try {
      const res = await fetch("http://localhost:8001/auth/signup", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Signup failed");
      router.push("/auth/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField label="Full Name" required onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
      <InputField label="Email Address" type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
      <InputField label="Password" type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
      <InputField label="Organization Name" required onChange={(e) => setFormData({...formData, organizationName: e.target.value})} />
      
      <div className="relative p-6 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-800/20 hover:bg-slate-800/40 transition-all cursor-pointer text-center group">
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <ShieldCheck className="w-6 h-6 mx-auto mb-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        <p className="text-sm font-medium">{file ? file.name : "Organization Logo"}</p>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">PNG or JPG (Square preferred)</p>
      </div>
      <SubmitButton isLoading={isLoading} color="bg-indigo-600" />
    </form>
  );
}

/*  UI HELPERS  */

function RoleOption({ title, icon, description, onClick, activeColor }) {
  return (
    <button onClick={onClick} className={`relative group text-left p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${activeColor}`}>
      <div className="mb-6 inline-flex p-3 rounded-2xl bg-slate-800 border border-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </button>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 ml-1">{label}</label>
      <input {...props} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 text-slate-200" />
    </div>
  );
}

function SubmitButton({ color, isLoading }) {
  return (
    <button disabled={isLoading} className={`w-full ${color} py-4 rounded-xl font-bold text-white shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed`}>
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        "Complete Registration"
      )}
    </button>
  );
}