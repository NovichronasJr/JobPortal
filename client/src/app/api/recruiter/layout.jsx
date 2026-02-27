import RecruiterSidebar from "@/components/RecruiterSidebar";

export default function RecruiterLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#020617]">
      <RecruiterSidebar />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
