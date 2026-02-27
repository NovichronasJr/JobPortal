"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, User as UserIcon, Briefcase } from "lucide-react";

export default function Greet({ cookie_value }) {
  const { user } = useAuth();

  
  const BACKEND_URL = "http://localhost:8001";

  
  const isCandidate = user?.role === 'candidate' || cookie_value?.role === 'candidate';
  
  const displayName = isCandidate 
    ? (user?.profile?.firstName || cookie_value?.name || "Candidate")
    : (user?.profile?.organizationName || cookie_value?.name || "Recruiter");

  const displayEmail = user?.email || cookie_value?.email || "";

  const rawImagePath = isCandidate 
    ? user?.profile?.profilePhoto 
    : user?.profile?.organizationLogo;

  const imageUrl = rawImagePath 
    ? (rawImagePath.startsWith('http') ? rawImagePath : `${BACKEND_URL}/${rawImagePath}`)
    : `${BACKEND_URL}/default_pics/${isCandidate ? 'candidate.jpg' : 'recruiter.jpg'}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center gap-4 mb-6">
        {/* Profile Image Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-colors" />
          <img 
            src={imageUrl} 
            alt={displayName}
            className="relative w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-lg"
            onError={(e) => {
                
                e.target.src = "https://ui-avatars.com/api/?name=" + displayName;
            }}
          />
          <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            {isCandidate ? <UserIcon className="w-3 h-3 text-blue-400" /> : <Briefcase className="w-3 h-3 text-emerald-400" />}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Welcome back, {displayName}
          </h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isCandidate ? 'bg-blue-500' : 'bg-emerald-500'}`} />
            {displayEmail}
          </p>
        </div>
      </div>

      <Link 
        href={isCandidate ? "/api/candidate" : "/api/recruiter"} 
        prefetch={false}
        className="group flex items-center justify-between w-full p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300"
      >
        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
          {isCandidate ? "Explore Job Market" : "Manage Job Postings"}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
      </Link>
    </motion.div>
  );
}