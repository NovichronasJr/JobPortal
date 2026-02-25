import CandidateSidebar from "@/components/CandidateSidebar";

export default function CandidateLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#020617]">
      <CandidateSidebar /> 
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
}