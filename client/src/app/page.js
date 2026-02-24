import { cookieGetter } from "@/lib/cookiesetter";
import Greet from "@/components/Greet";

export default async function Page() {
  
  const session = await cookieGetter();
  
  const user = session?.user || null;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-6 text-slate-200">
      <div className="p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl text-center">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-2">
          Server-Side Rendered
        </h1>
        
        {user ? (
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Hii {user.name || user.email.split('@')[0]}
            </h1>
            <p className="text-slate-400">Role: <span className="capitalize text-indigo-300 font-medium">{user.role}</span></p>
          </div>
        ) : (
          <h1 className="text-4xl font-bold text-white">Welcome, Guest</h1>
        )}
      </div>

      <Greet cookie_value={session}/>
    </div>
  );
}