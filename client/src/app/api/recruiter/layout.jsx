import RecruiterSidebar from "@/components/RecruiterSidebar";
import { RecruiterJobContextProvider } from "@/context/RecruiterJobContext";
export default function RecruiterLayout({ children }) {
  return (
    <RecruiterJobContextProvider>
    <div className="flex min-h-screen bg-[#020617]">
      <RecruiterSidebar />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
    </RecruiterJobContextProvider>
  );
}
