// "use client";
// import { createContext, useContext, useState, useEffect } from "react";
// import { useAuth } from "./AuthContext";

// const CandidateJobContext = createContext(null);

// export const CandidateJobContextProvider = ({ children }) => {
//     const [jobs, setJobs] = useState([]);
//     const [appliedJobs, setAppliedJobs] = useState([]); // <--- NEW STATE
//     const [loading, setLoading] = useState(false);
//     const {user} = useAuth()
//     const BACKEND_URL = "http://localhost:8001";

//     // --- 1. FETCH ALL MARKETPLACE JOBS ---
//     const fetchAllJobs = async () => {
//         try {
//             setLoading(true);
//             const response = await fetch(`${BACKEND_URL}/api/candidate/allJobs`, {
//                 method: "GET",
//                 credentials: "include"
//             });
//             const data = await response.json();
//             if (data.success) setJobs(data.jobs);
//         } catch (error) {
//             console.error("Marketplace Fetch Error:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- 2. FETCH APPLIED JOBS (THE SYNC) ---
//     const fetchAppliedJobs = async (candidateId) => {
//         if (!candidateId) return;
//         try {
//             const response = await fetch(`${BACKEND_URL}/api/candidate/my-applications/${candidateId}`, {
//                 method: "GET",
//                 credentials: "include"
//             });
//             const data = await response.json();
//             console.log(data);
//             if (data.success) {
//                 setAppliedJobs(data.applications);
//             }
//         } catch (error) {
//             console.error("Neural Sync Error:", error);
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         fetchAllJobs();
//         fetchAppliedJobs(user?.profile?._id);
//     }, []);

//     const value = {
//         jobs,
//         appliedJobs, // Expose applied jobs
//         loading,
//         refreshJobs: fetchAllJobs,
//         refreshApplied: fetchAppliedJobs // Expose refresh function
//     };

//     return (
//         <CandidateJobContext.Provider value={value}>
//             {children}
//         </CandidateJobContext.Provider>
//     );
// };

// export const useCandidateJob = () => {
//     const context = useContext(CandidateJobContext);
//     if (!context) {
//         throw new Error("useCandidateJob must be used within a CandidateJobContextProvider");
//     }
//     return context;
// };

"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CandidateJobContext = createContext(null);

export const CandidateJobContextProvider = ({ children }) => {
    const [jobs, setJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [notifications, setNotifications] = useState([]); // <--- NEW: Notification Matrix
    const [unreadCount, setUnreadCount] = useState(0);      // <--- NEW: Badge Counter
    const [loading, setLoading] = useState(false);
    
    const { user } = useAuth();
    const BACKEND_URL = "http://localhost:8001";

    // --- 1. FETCH ALL MARKETPLACE JOBS ---
    const fetchAllJobs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/candidate/allJobs`, {
                method: "GET",
                credentials: "include"
            });
            const data = await response.json();
            if (data.success) setJobs(data.jobs);
        } catch (error) {
            console.error("Marketplace Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. FETCH APPLIED JOBS (THE SYNC) ---
    const fetchAppliedJobs = async (candidateId) => {
        if (!candidateId) return;
        try {
            const response = await fetch(`${BACKEND_URL}/api/candidate/my-applications/${candidateId}`, {
                method: "GET",
                credentials: "include"
            });
            const data = await response.json();
            if (data.success) setAppliedJobs(data.applications);
        } catch (error) {
            console.error("Neural Sync Error:", error);
        }
    };

    // --- 3. FETCH NOTIFICATIONS ---
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${BACKEND_URL}/api/candidate/my-notifications`, {
                method: "GET",
                credentials: "include"
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
                // Calculate unread nodes
                const unread = data.notifications.filter(n => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error("Notification Sync Error:", error);
        }
    };

    // --- 4. MARK NOTIFICATION AS READ ---
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/candidate/mark-read/${notificationId}`, {
                method: "PATCH",
                credentials: "include"
            });
            const data = await response.json();
            if (data.success) {
                // Update local state without full refetch
                setNotifications(prev => prev.map(n => 
                    n._id === notificationId ? { ...n, read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Handshake Error:", error);
        }
    };

    // --- INITIAL SYNC ---
    useEffect(() => {
        fetchAllJobs();
        if (user?.profile?._id) {
            fetchAppliedJobs(user.profile._id);
            fetchNotifications();
        }
    }, [user]);

    const value = {
        jobs,
        appliedJobs,
        notifications,    // Expose for UI lists
        unreadCount,      // Expose for Nav badges
        loading,
        refreshJobs: fetchAllJobs,
        refreshApplied: fetchAppliedJobs,
        refreshNotifications: fetchNotifications,
        markAsRead        // Function to clear alerts
    };

    return (
        <CandidateJobContext.Provider value={value}>
            {children}
        </CandidateJobContext.Provider>
    );
};

export const useCandidateJob = () => {
    const context = useContext(CandidateJobContext);
    if (!context) {
        throw new Error("useCandidateJob must be used within a CandidateJobContextProvider");
    }
    return context;
};