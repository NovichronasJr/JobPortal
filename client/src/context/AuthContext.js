"use client";
import { useContext, createContext, useEffect, useState, useCallback } from "react";
import { cookieGetter, deleteCookie, checkCookie } from "@/lib/cookiesetter";
import { usePathname, useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    // --- 1. EXTRACTED REFRESH LOGIC ---
    // We use useCallback so this function doesn't change on every render
    const checkUser = useCallback(async () => {
        try {
            const session = await cookieGetter();
            
            if (!session?.token) {
                if (pathname !== "/auth/login" && pathname !== "/auth/signup") {
                    router.replace("/auth/login");
                }
                setUser(null); // Ensure user is null if no session
                return;
            }

            const res = await fetch("http://localhost:8001/auth/me", {
                // Ensure credentials: "include" if using cookies, 
                // but your current setup uses headers:
                headers: { Authorization: `Bearer ${session.token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                console.log(data.user);
                return data.user; // Return data for potential immediate use
            } else {
                // Only logout if it's a 401/403 (expired/invalid)
                if (res.status === 401) await Logout();
            }
        } catch (err) {
            console.error("Hydration failed", err);
        } finally {
            setLoading(false);
        }
    }, [pathname, router]);

    // Initial Hydration on Path Change
    useEffect(() => {
        checkUser();
    }, [checkUser]);

    // Heartbeat Session Sync
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
        // --- 2. ADD checkUser TO THE PROVIDER ---
        <AuthContext.Provider value={{ user, setUser, Logout, loading, checkUser }}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);