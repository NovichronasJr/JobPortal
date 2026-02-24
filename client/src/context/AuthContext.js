
"use client";
import { useContext, createContext, useEffect, useState } from "react";
import { cookieGetter, deleteCookie, checkCookie } from "@/lib/cookiesetter";
import { usePathname, useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const hydrateUser = async () => {
            try {
                const session = await cookieGetter();
                
                if (!session?.token) {
                    if (pathname !== "/auth/login" && pathname !== "/auth/signup") {
                        router.replace("/auth/login");
                    }
                    return;
                }

                const res = await fetch("http://localhost:8001/auth/me", {
                    headers: { Authorization: `Bearer ${session.token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    await Logout();
                }
            } catch (err) {
                console.error("Hydration failed", err);
            } finally {
                setLoading(false);
            }
        };

        hydrateUser();
    }, [pathname]);

  
    useEffect(() => {
        const syncSession = async () => {
            const isLogged = await checkCookie();
            
            
            if (!isLogged && user !== null) {
                console.log("LOG: Session detected as dead via heartbeat.");
                setUser(null);
                
                if (pathname !== "/auth/login" && pathname !== "/auth/signup") {
                    
                    window.location.href = '/auth/login'; 
                }
            }
        };

        const interval = setInterval(syncSession, 2000);
        return () => clearInterval(interval);
    }, [user, pathname]); 

    const Logout = async () => {
        await deleteCookie();
        setUser(null);
        window.location.href = '/auth/login';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, Logout, loading }}>
            {/* We show children once we've checked the session initially */}
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);