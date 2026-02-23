"use client";
import { useContext, createContext, useEffect, useState } from "react";
import { checkCookie, deleteCookie } from "@/lib/cookiesetter";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export const AuthContextProvider = ({ children, initialUser }) => {
    const [user, setUser] = useState(initialUser);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      console.log("LOG: AuthGuard Effect Mounted"); 
  
      const syncSession = async () => {
          console.log("LOG: Heartbeat check at", new Date().toLocaleTimeString());
          try {
              const isLogged = await checkCookie();
              console.log("LOG: Server says isLogged =", isLogged);
  
              if (!isLogged && pathname !== "/auth/login") {
                  console.log("LOG: Redirecting... Session is dead.");
                  setUser(null);
                  window.location.href = '/auth/login';
              }
          } catch (err) {
              console.error("LOG: Error in syncSession:", err);
          }
      };
  
      const interval = setInterval(syncSession, 2000);
      
      return () => {
          console.log("LOG: AuthGuard Effect Unmounted");
          clearInterval(interval);
      };
  }, [pathname]); 
       

    const Logout = async () => {
        const result = await deleteCookie();
        if (result.message === "deleted cookie") {
            setUser(null);
            window.location.href = '/auth/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, Logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);