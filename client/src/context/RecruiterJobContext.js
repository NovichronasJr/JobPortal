"use client"; // Critical for Next.js App Router
import { createContext, useContext, useEffect, useState } from "react";

const RecruiterJobContext = createContext(null);

export const RecruiterJobContextProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://localhost:8001";

  // 1. REUSABLE FETCH LOGIC
  // We put it in a function so we can call it again when a new job is posted!
  // inside your RecruiterJobContextProvider...

  const fetchRecruiterJobs = async (forceRefresh = false) => {
    try {
      setLoading(true);

      const fetchOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // NEXT.JS CACHE TRICK:
        // This tells the Next.js underlying fetch engine how to handle this request
        next: {
          revalidate: 60, // Consider data "fresh" for 60 seconds
          tags: ["recruiter-jobs"],
        },
      };

      // If we just posted a job, we bypass the cache entirely
      if (forceRefresh) {
        fetchOptions.cache = "no-store";
      }

      const response = await fetch(
        `${BACKEND_URL}/api/recruiter/addedjobs`,
        fetchOptions
      );
      const data = await response.json();
      console.log("jobs :: ",data);
      if (data.success) {
        setJobs(data.jobs);
        setCount(data.count);
      }
    } catch (error) {
      console.error("Cache Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. USEEFFECT FIX
  // useEffect cannot be async. We call our async function inside it.
  useEffect(() => {
    fetchRecruiterJobs();
  }, []);

  return (
    <RecruiterJobContext.Provider
      value={{ jobs, setJobs, count, loading, refreshJobs: fetchRecruiterJobs }}
    >
      {children}
    </RecruiterJobContext.Provider>
  );
};

// 3. EXPORT FIX
// Standard practice to name the hook useSomething
export const useRecruiterJob = () => {
  const context = useContext(RecruiterJobContext);
  if (!context) {
    throw new Error(
      "useRecruiterJob must be used within a RecruiterJobContextProvider"
    );
  }
  return context;
};
