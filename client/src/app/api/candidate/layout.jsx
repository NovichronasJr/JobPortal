import CandidateSidebar from "@/components/CandidateSidebar";
import { CandidateJobContextProvider } from "@/context/CandidateJobContext";
export default function CandidateLayout({ children }) {
  return (
    <CandidateJobContextProvider>
    <div className="flex min-h-screen bg-[#020617]">
      <CandidateSidebar /> 
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
    </CandidateJobContextProvider>
  );
}