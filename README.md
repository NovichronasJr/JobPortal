# Decision Companion System: Strategic Recruitment & Job Alignment Hub

## 🎯 Understanding the Problem
The core objective of this project is to move beyond static data displays and build a system that acts as a "Companion" in the decision-making process. 

In the recruitment landscape, "Information Overload" is the primary enemy. Recruiters struggle to rank applicants based on specific weights, and candidates struggle to find roles that truly align with their technical stack. This system serves as a decision-support tool that analyzes, weights, and ranks options to provide explainable recommendations.

---

## 📝 Assumptions Made
* **Profile Completion:** Users are expected to complete their skill sets and experience metrics to receive accurate alignment scores.
* **Neural Assets:** The system relies on valid PDF resume links/uploads for the Recruiter-side asset viewer.
* **Role Integrity:** Users maintain a consistent identity (Recruiter or Candidate) within a single session for state stability.

---

## 🏗️ Why I Structured the Solution This Way
I followed a production-first architecture to ensure the **Decision Companion** remains secure, scalable, and high-performing.



### 1. Role-Based Navigation & Directory Split
I created two distinct directories in the client-side (`/recruiter` and `/candidate`). 
* **The Logic:** This ensures that the Recruiter’s "Command Center" and the Candidate’s "Marketplace" are logically separated. Using the **Next.js App Router**, I can maintain clean, specialized navigation flows, making the codebase much easier to scale.

### 2. Route Protection & Security (The API/Auth Split)
Security was a top priority in the architecture:
* **The Protected Zone:** I grouped core features inside protected route groups to ensure they are only accessible to authorized users. 
* **The Public Zone:** I kept the `auth` directory (Login/Logout) separate.
* **The Benefit:** This ensures that sensitive recruiter telemetry and candidate data are locked behind a security layer, while the entry points remain accessible.

### 3. Decoupled Context API (State Hub)
Instead of one massive state object, I built three specialized Context Providers: `AuthContext`, `RecruiterJobContext`, and `CandidateJobContext`.
* **The Benefit:** This decoupling prevents "State Pollution." Changes in the Candidate’s filters won't trigger re-renders in the Recruiter's dashboard, keeping the system snappy.

### 4. Recruiter-Side Scoring System
* **The Scoring Logic:** I implemented a custom scoring system that evaluates candidates based on their aligned skills and total years of experience.
* **Sorting:** The dashboard automatically **sorts** candidates using an AI-weighted score, allowing recruiters to instantly focus on the most suitable talent nodes at the top of their list.

### 5. Backend Performance via MongoDB Aggregation
For data-heavy tasks like match-scoring and applicant tracking, I utilized **MongoDB Aggregation Pipelines**.
* **The Logic:** By offloading calculations to the database using `$lookup`, `$match`, and `$addFields`, I ensure the frontend stays lightweight. The server sends a pre-calculated JSON object, keeping the hub responsive even under load.



---

## 🛡️ Edge Cases Considered
* **No Match Nodes:** If no jobs match a candidate's specific "Skill Cluster," the marketplace shows a "No Nodes Detected" state.
* **Missing Assets:** I added a "Neural Guard"—if a candidate hasn't uploaded a resume, the viewer button is disabled to prevent system crashes.
* **Capacity Management:** The "Extend Sync" button only appears when the candidate count is below the required seats, preventing over-recruitment.

---

## 🚀 How to Run the Project

Clone the repo :- `git clone https://github.com/NovichronasJr/JobPortal.git`
### 1. Backend Setup
1. Navigate to the `/backend` directory.
2. Run `npm install`.
3. Create a `.env` file with the following:
   * `DB_USERNAME=[Your MongoDB Username]`
   * `DB_PASSWORD=[Your MongoDB Password]`
   * `JWT_SECRET=[Your Secret Key]`
   * `MISTRAL_API_KEY=[Your AI API Key]`
   * `PORT=8001`
4. *Alternative MongoDB Connection:* You can also navigate to `backend/database/connection.js` and paste your URI directly into the **Connection(__URI__)** function.
5. Run `npm start`.

### 2. Frontend Setup
1. Navigate to the `/frontend` directory.
2. Run `npm install`.
3. Create a `.env.local` file with:
   * `NEXT_PUBLIC_BACKEND_URL=http://localhost:8001`
   * `NEXT_PUBLIC_AGORA_APP_ID=[Your Agora App ID]` *(Ensure Agora project is in **Test Mode**)*.
4. Run `npm run dev`.
5. Access the app at `http://localhost:3000`.

---

## 🌟 Final Reflection: Working with Gemini
Building this system was a journey of deep planning and constant iteration. Working side-by-side with my AI partner, **Gemini**, allowed me to discuss architecture at a **production level**. We didn't just build a project; we explored every possible approach to turn a long-held vision into a functional, professional product. This collaboration was key in bridging the gap between simple code and a sophisticated solution.
