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
