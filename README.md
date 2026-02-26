# Insight Board

Production-grade analytics dashboard built with React, TypeScript, Express, and Prisma.

Focused on performance, scalability, and real-world dashboard architecture — not just UI.

⸻

🚀 Key Highlights
• Server-side filtering & sorting
• Infinite scroll using useInfiniteQuery
• Row virtualization with @tanstack/react-virtual
• JWT authentication with session lifecycle handling
• Role-based access control (Admin / User)
• Audit logging system
• Optimistic updates with React Query
• UX hardening (skeletons, retry, slow network handling)

⸻

🧠 Architecture Overview

Frontend

- React + TypeScript
- React Router
- TanStack React Query
- TanStack React Virtual
- React Hook Form + Zod
- Tailwind CSS

Backend

- Express
- Prisma ORM
- SQLite (dev)
- JWT-based authentication
- Role-based middleware

⸻

⚡ Performance Design

- Virtualized table (renders only visible rows)
- Infinite server pagination
- Query caching with staleTime
- Scroll position preservation
- Memoized row rendering
- Prevent duplicate fetches

Handles large datasets smoothly (10k+ rows tested).

⸻

🔐 Authentication & Authorization

- Access token with expiry
- Auto logout on expiration
- Protected routes
- Role-based UI and API guards
- Audit logging for critical actions

⸻

📂 Project Structure

```
client/
  components/
  hooks/
  api/
  context/

server/
  routes/
  middleware/
  prisma/
```

⸻

▶ Run Locally

Backend

```
cd server
npm install
npx prisma migrate dev
npm run dev
```

Frontend

```
cd client
npm install
npm run dev
```

🛠 Future Improvements

- Refresh token flow
- SSO (Google OAuth)
- WebSocket real-time updates
- Postgres migration
- Full test suite

⸻

👨‍💻 Author

Ankit Jaishwal  
Frontend Engineer
