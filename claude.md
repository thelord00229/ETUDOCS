# CLAUDE.md — Project Configuration

## 🌐 Language Rule — CRITICAL

**Always respond in French, no matter what language is used to write code, comments, or instructions.**
Even if the user writes in English, always reply in French.

---

## 👤 Developer Profile

- Full-stack JavaScript developer
- Frontend: React (hooks, context, router, component architecture)
- Backend: Node.js + Express (REST APIs, middleware, auth)
- Languages: JavaScript (ES6+), some TypeScript
- Tooling: npm/yarn, Git, VSCode

---

## 🧠 Behavior & Communication

- Always respond in **French**
- Be **direct and concise** — no unnecessary preambles
- Prefer **concrete code examples** over long explanations
- If something is ambiguous, ask a single clarifying question before proceeding
- When fixing a bug, always explain **why** the bug occurred, briefly
- Point out potential **side effects** or **regressions** when modifying existing code

---

## 📁 Project Structure Conventions

### React Frontend

```
src/
  components/       # Reusable UI components
  pages/            # Route-level components
  hooks/            # Custom React hooks
  context/          # React Context providers
  services/         # API call functions (axios/fetch wrappers)
  utils/            # Pure helper functions
  assets/           # Images, fonts, static files
  styles/           # Global CSS / Tailwind config
```

### Express Backend

```
src/
  routes/           # Express routers (one file per resource)
  controllers/      # Route handler logic
  middleware/        # Auth, validation, error handling
  models/           # DB models (Mongoose / Sequelize / Prisma)
  services/         # Business logic layer
  utils/            # Helpers, constants
  config/           # DB config, env config
server.js           # Entry point
```

---

## ⚙️ Code Style & Standards

### General

- Use **ES6+** syntax: arrow functions, destructuring, spread, async/await
- Prefer `const` over `let`, never use `var`
- Use **named exports** in most cases, default exports for pages/components
- Always handle **errors** in async functions with try/catch
- Never leave `console.log` in production code — use a logger (winston, morgan)
- Files and folders: **camelCase** for JS files, **PascalCase** for React components

### JavaScript

```js
// ✅ Good
const fetchUser = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    throw error;
  }
};

// ❌ Avoid
function fetchUser(id) {
  return User.findById(id)
    .then((user) => user)
    .catch((e) => console.log(e));
}
```

### React Components

- Use **functional components** with hooks only — no class components
- Keep components **small and focused** — one responsibility per component
- Extract logic into **custom hooks** when a component gets complex
- Use `useCallback` and `useMemo` only when there's a measurable perf issue
- Prop types: use **PropTypes** or **TypeScript interfaces**

```jsx
// ✅ Good component pattern
const UserCard = ({ user, onDelete }) => {
  const handleDelete = useCallback(() => {
    onDelete(user.id);
  }, [user.id, onDelete]);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={handleDelete}>Supprimer</button>
    </div>
  );
};

export default UserCard;
```

### Express Routes & Controllers

- Keep **routes thin** — delegate logic to controllers
- Keep **controllers thin** — delegate business logic to services
- Always use a **centralized error handler**

```js
// routes/users.js
router.get("/:id", authenticate, userController.getById);

// controllers/userController.js
const getById = async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error); // pass to global error handler
  }
};

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message });
};
```

---

## 🔐 Security Rules

- **Never hardcode secrets** — always use environment variables via `dotenv`
- Always validate and sanitize user input (use `express-validator` or `zod`)
- Use **JWT** for auth — store tokens in httpOnly cookies, not localStorage
- Always set appropriate **CORS** headers in Express
- Use **helmet.js** for HTTP security headers
- Hash passwords with **bcrypt** (min 10 salt rounds)

```js
// ✅ Auth middleware example
const authenticate = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
```

---

## 🗄️ Database

- Default ORM: **Prisma** (preferred), or Mongoose for MongoDB
- Always use **transactions** for multi-step DB operations
- Never expose raw DB errors to the client — log them server-side only
- Use **pagination** for any list endpoint (default limit: 20)

---

## 🧪 Testing

- Test framework: **Jest** + **React Testing Library** (frontend), **Supertest** (backend)
- Write tests for: all utility functions, all API endpoints, critical React components
- Test file naming: `*.test.js` or `*.spec.js` alongside the source file
- Aim for meaningful tests, not just coverage — test behavior, not implementation

```js
// ✅ Backend test example
describe("GET /api/users/:id", () => {
  it("should return 200 with a valid user", async () => {
    const res = await request(app)
      .get("/api/users/1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", 1);
  });
});
```

---

## 🚀 Git & Workflow

- Commit message format: `type(scope): short description`
  - Types: `feat`, `fix`, `refactor`, `style`, `test`, `chore`, `docs`
  - Example: `feat(auth): add JWT refresh token logic`
- Never commit directly to `main` — use feature branches
- Branch naming: `feature/`, `fix/`, `refactor/`
- Always run lint + tests before committing

---

## 📦 Preferred Libraries

| Need                   | Library                      |
| ---------------------- | ---------------------------- |
| HTTP client (frontend) | axios                        |
| Routing (React)        | react-router-dom v6          |
| State management       | Zustand or React Context     |
| Form handling          | React Hook Form              |
| Validation             | Zod                          |
| Styling                | Tailwind CSS or CSS Modules  |
| Auth                   | JWT + bcrypt                 |
| Logging                | Winston (backend)            |
| HTTP security          | Helmet                       |
| Env variables          | dotenv                       |
| Testing (back)         | Jest + Supertest             |
| Testing (front)        | Jest + React Testing Library |
| ORM                    | Prisma                       |

---

## 🚫 Things to Avoid

- Don't use `any` in TypeScript unless absolutely necessary
- Don't use `useEffect` for data fetching in new code — use React Query or SWR
- Don't mutate state directly in React
- Don't put business logic inside React components
- Don't use synchronous file I/O (`fs.readFileSync`) in Express routes
- Don't return stack traces or raw DB errors to API clients
- Don't use `*` for CORS in production

---

## 💡 When Generating Code

1. Respect the folder structure defined above
2. Include **error handling** by default
3. Add **brief JSDoc comments** on exported functions
4. Flag any **security concerns** you notice in existing code
5. If the task requires installing a new package, mention it explicitly
6. When refactoring, preserve existing behavior unless told otherwise
7. If you see an opportunity to improve something outside the task scope, mention it briefly but don't change it without asking
   8.You must NEVER modify any file without my explicit authorization.

Before making any change:
a. Show me exactly what will be modified (diff or updated code).
b. Clearly explain the changes.
c. Ask for confirmation with a YES/NO question.

Only apply the changes if I explicitly reply with "YES".
If I say anything else, do not modify anything.

---

_This file is read automatically by Claude Code at the start of every session._
