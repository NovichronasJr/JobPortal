# Research Log

This file tracks all research, search queries, and AI interactions used throughout the development of the Decision Companion System.

## Day 1: Problem Definition & Tech Stack Selection

| Date | Topic / Query | Source | Outcome / Decision |
| :--- | :--- | :--- | :--- |
| Feb 22, 2026 | "What is a Decision Companion System vs Decision Support System?" | Google Search / Gemini | Learned that a "Companion" system is more proactive and collaborative than a traditional DSS, focusing on "What-If" scenarios. |
| Feb 22, 2026 | "Next.js 1 vs React for enterprise dashboards" | Next.js Docs / YouTube | Decided to use **Next.js**. The App Router and Server Components will make the dashboard faster and more SEO-friendly for a portal. |
| Feb 22, 2026 | "Node.js vs Python for real-time data processing" | Stack Overflow | Chose **Node.js** to maintain a unified JavaScript ecosystem (MERN stack), which is better for rapid prototyping of the companion logic. |
| Feb 22, 2026 | "Best tools for system architecture diagrams 2026" | Product Hunt | Discovered **Eraser.io**. Chose it for its clean UI and ability to handle both flowcharts and architectural layouts effectively. |
| Feb 22, 2026 | "Designing a recruitment platform database schema" | MongoDB Blog | Decided on **MongoDB** due to the unstructured nature of job requirements and candidate skills. |

### Research Summary & Alternatives
- **Alternative Considered:** Building a simple CLI tool for laptop comparison.
- **Why Rejected:** A web-based Job Portal allows for more complex "Human-in-the-loop" decision-making, which better fulfills the Vonnue assignment's "Real-World Decision" criteria.
- **Tools Accepted:** Next.js, Express, MongoDB, Eraser.io.

### Resource Links
- **Architecture Workspace:** [Eraser.io - DCS Job Portal](https://app.eraser.io/)
- **Documentation:** [Next.js Installation Guide](https://nextjs.org/docs/getting-started/installation)

# 📚 Research & Learning Log: Day 2

| Date | Topic / Query | Source | Outcome / Decision |
| :--- | :--- | :--- | :--- |
| Feb 23, 2026 | "Next.js Middleware not logging or triggering" | Troubleshooting / Next.js Docs | **Doubt Resolution:** Realized that placing `middleware.ts` inside the `/app` folder caused it to be ignored. Relocated to the root directory and performed a server restart. |
| Feb 23, 2026 | HTTP-Only Cookie Security | MDN Web Docs | Implemented `httpOnly: true` in Server Actions to prevent client-side script access, significantly reducing XSS (Cross-Site Scripting) attack surface. |
| Feb 23, 2026 | "Real-time redirect after manual cookie deletion" | User Query / Architecture | **Doubt Resolution:** Middleware only runs on requests. To handle manual browser-tab deletions, I implemented a client-side "Heartbeat Watcher" in the AuthContext. |
| Feb 23, 2026 | Node.js Backend Architecture | Piyush Garg (Tutorial Series) | Reviewed Express.js routing and middleware patterns. Chose a modular "Controller-Route" pattern for the backend to maintain clean code. |
| Feb 23, 2026 | "Why use initialUser in the Root Layout?" | User Query / Hydration | **Doubt Resolution:** Explained the concept of "Hydration." Using server-side cookies to populate client-side context prevents the "flash of unauthenticated content" on refresh. |
| Feb 23, 2026 | "JSON.parse error: undefined is not valid JSON" | Debugging / Stack Overflow | **Doubt Resolution:** Identified that `JSON.stringify(undefined)` creates a corrupt string. Implemented a "Nuclear Option" with `try-catch` blocks and defensive parsing. |
| Feb 23, 2026 | MongoDB Schema Modeling | Piyush Garg (Mongoose Guide) | Decided to use Mongoose to enforce data integrity. Planned a `User` schema with Enum-based roles to distinguish between Candidates and Recruiters. |
| Feb 23, 2026 | RESTful API Conventions | REST API Tutorial | Established a standard for the Decision Companion API endpoints using plural nouns and proper HTTP verbs (e.g., `POST /api/jobs`). |

### Resource Links
- **YouTube Tutorials:** [Piyush Garg - Node.js Series](https://www.youtube.com/watch?v=ohIAiuHMKMI&list=PLinedj3B30sDby4Al-i13hQJGQoRQDfPo)
- **Database Guide:** [Piyush Garg - MongoDB & Mongoose](https://www.youtube.com/watch?v=xrglM8U0Zv8&list=PLinedj3B30sDby4Al-i13hQJGQoRQDfPo&index=19)

# 📚 Research & Learning Log: Day 3

| Date | Topic / Query | Source | Outcome / Decision |
| :--- | :--- | :--- | :--- |
| Feb 24, 2026 | Modular Express Routing | Express.js Documentation | **Decision:** Implemented a modular `auth_route.js` using `express.Router()` to decouple authentication logic from the main server entry point, ensuring scalability as the Decision Companion grows. |
| Feb 24, 2026 | "Multer: Dynamic storage based on fieldname" | Multer Storage Engine Docs | **Doubt Resolution:** Configured `diskStorage` with conditional logic to route files into role-specific directories: Resumes to `/candidate/resume` and Logos to `/recruiter/logo`. |
| Feb 24, 2026 | LangChain & AI Parsing Research | LangChain / Self-Experimentation | **Research Note:** Successfully tested `pdf-parse` and `RecursiveCharacterTextSplitter`. Verified that in-memory vector stores and prompts can handle job-matching before full database implementation. |
| Feb 24, 2026 | "TypeError: next is not a function" in Mongoose | Troubleshooting / Mongoose Docs | **Doubt Resolution:** Identified that `async` functions in Mongoose `pre-save` hooks handle promise resolution natively. Removed the `next()` call to fix the 500 Internal Server Error. |
| Feb 24, 2026 | Cross-Origin Resource Sharing (CORS) | MDN Web Docs | Resolved port mismatch blocks (3000 vs 8001) by whitelisting the Next.js origin and enabling `credentials: true` for secure cookie transmission. |
| Feb 24, 2026 | Git Monorepo Consolidation | Git Documentation | **Doubt Resolution:** Used `git rm -r --cached` to remove nested `.git` submodules. Successfully unified the project into a single repository without losing historical commit data. |
| Feb 24, 2026 | Static Asset Serving in Express | Express Middleware Guide | Implemented `express.static` for the `/public` directory. Established a fallback logic for `default_pics` to ensure a consistent UI for new Candidate and Recruiter profiles. |
| Feb 24, 2026 | Multipart Form Data Handling | Web API / Fetch Docs | **Decision:** Transitioned the frontend signup logic from JSON to `FormData` to allow the parallel transmission of profile metadata and physical files (Resumes/Logos). |

### Resource Links
- **Middleware Mechanics:** [Multer Disk Storage Engine](https://github.com/expressjs/multer#diskstorage)
- **AI Foundations:** [LangChain JS](https://js.langchain.com/docs/modules/data_connection/document_transformers/)
- **Mongoose Hooks:** [Async/Await in Middleware](https://mongoosejs.com/docs/middleware.html#pre)


# 📚 Research & Learning Log: Day 4

| Date | Topic / Query | Source | Outcome / Decision |
| :--- | :--- | :--- | :--- |
| Feb 25, 2026 | Industry UX Analysis (LinkedIn/Indeed) | Competitive Research | **Research Note:** Analyzed LinkedIn's filtering architecture. **Decision:** Implemented a "Marketplace" feel where filters are secondary to the "Match Score," prioritizing AI-driven discovery over manual searching. |
| Feb 25, 2026 | Layout Orchestration in Next.js | Next.js Docs | **Outcome:** Mastered the use of `layout.jsx` to maintain persistent UI elements (Sidebars) across route changes, ensuring a smooth, single-page application (SPA) experience. |
| Feb 25, 2026 | Dummy Data Architecture | Prototype Development | **Decision:** Built a robust `dummyJobs` array to simulate production environments. Used this to stress-test the UI for various roles (MERN, Cybersec, Data Science) before full backend implementation. |
| Feb 25, 2026 | Dynamic Filter Logic & Importance | Logic Experimentation | **Outcome:** Successfully implemented state-driven filtering. Verified that the platform can handle complex intersections (e.g., finding jobs that require *both* React and Node.js) in real-time. |
| Feb 25, 2026 | Defensive JSON Handling | Debugging Session | **Bug Fix:** Resolved a race condition where `JSON.parse` crashed on empty cookies during logout re-renders. Implemented string-validation checks to ensure 100% stability during session transitions. |

### Resource Links
- **Routing Patterns:** [Next.js Persistent Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- **Competitive Design:** [LinkedIn Job Search](https://www.linkedin.com/jobs/)
- **JavaScript Safety:** [Defensive JSON Parsing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)


# 📚 Research & Learning Log: Day 5

| Date | Topic / Query | Source | Outcome / Decision |
| :--- | :--- | :--- | :--- |
| Aug 26, 2026 | Cross-Origin Asset Pipeline | System Design | **Challenge:** Managing file replacement on a remote server from a local frontend. **Fix:** Implemented `path.resolve` and `fs.unlinkSync` to purge old assets from disk upon new uploads, preventing storage bloat. |
| Aug 26, 2026 | The Browser as a Middleware | Network Architecture | **Insight:** Analyzed how the Browser acts as a "Courier" between a local Host (Next.js) and Cloud Backend (Express) regardless of physical distance. **Decision:** Enforced `credentials: 'include'` and CORS `credentials: true` to allow automatic cookie delivery across different origins. |
| Aug 26, 2026 | Middleware Authorization Guard | Backend Security | **Outcome:** Developed a custom `protect` middleware to intercept requests, extract JWTs from nested cookie objects, and hydrate `req.user` before reaching sensitive routes. |
| Aug 26, 2026 | Auth Context Hydration | React State Mgmt | **Challenge:** Stale resume previews after updates (404 errors) due to frontend not knowing the new file path. **Fix:** Exposed a global `checkUser` function in `AuthContext` to trigger a silent re-fetch of the user profile immediately after a successful PUT request. |
| Aug 26, 2026 | Multer Field Normalization | Debugging Session | **Bug Fix:** Resolved `MulterError: Unexpected field` by synchronizing casing (lowercase `profilephoto`) between Frontend `FormData` and Backend `upload.fields` middleware. |

### 🛠️ Challenges & Technical Solutions
* **The "JWT Malformed" Ghost:** We discovered that storing the token inside a stringified JSON cookie caused the backend to fail during parsing. We fixed this by teaching the middleware to `JSON.parse` the cookie before verification.
* **Distributed Cookie Handshake:** Learned that even if the backend is in the cloud and the frontend is local, the **Browser** manages the session delivery automatically, provided the security gates (CORS/Credentials) are unlocked.

### 🔗 Resource Links
* **Routing & Logic:** [Next.js App Router Documentation](https://nextjs.org/docs)
* **Session Management:** [npm: cookie-parser](https://www.npmjs.com/package/cookie-parser)
* **File Streaming:** [Multer Field Documentation](https://www.npmjs.com/package/multer#fieldsfields)
* **Security Standards:** [MDN: Using HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)


# 📚 Research & Learning Log: Day 6

| Date | Topic / Query | Source | Outcome / Decision |
| :--- | :--- | :--- | :--- |
| Feb 27, 2026 | LLM Resume Extraction (Mistral/Gemini) | AI Implementation | **Research Note:** Analyzed the efficiency of zero-shot prompting for entity extraction. **Decision:** Integrated an LLM-based parser to translate raw PDF text into structured JSON arrays for tech-stacks, significantly reducing user manual entry. |
| Feb 27, 2026 | Conversational AI Agent Persona | UX Strategy | **Outcome:** Designed the "Gemini Intelligence" persona. **Decision:** Shifted from dry, corporate labeling to "Peaceful AI" dialogue (e.g., "secret sauce," "gut check") to lower recruiter friction and encourage higher-quality data input. |
| Feb 27, 2026 | Trigger-Based Agent Activation | UX Engineering | **Outcome:** Implemented a contextual trigger on the 'Location' field. **Decision:** The AI agent only appears after public data is entered, preventing "Information Overload" and ensuring the recruiter is in a "Strategic State" before asking for hidden weightage. |
| Feb 27, 2026 | Agentic Workflow Optimization | Model Interaction | **Decision:** Implemented a multi-step "Chatbot" flow for job weightage. **Outcome:** Verified that breaking down AI parameters into single, bite-sized questions increases completion rates compared to long-form configuration menus. |
| Feb 27, 2026 | JSON-in-FormData Serialization | Debugging Session | **Bug Fix:** Resolved data-loss issue where Nested Objects (Education/Experience) were lost during file uploads. **Decision:** Implemented client-side `JSON.stringify` and server-side `JSON.parse` to preserve complex metadata structures across the API. |

### Resource Links
- **Prompt Engineering:** [Conversational Design Patterns for LLMs](https://www.nngroup.com/articles/ai-conversational-ui/)
- **UI Interaction:** [Framer Motion AnimatePresence Documentation](https://www.framer.com/motion/animate-presence/)
- **Data Integrity:** [Handling Nested Objects in Multipart Form-Data](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects)