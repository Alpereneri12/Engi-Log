# ENGI-LOG — Deployment Notes

Quick summary:

- This project is an Express + Socket.IO app that requires a Node server and a MongoDB connection.
- Vercel is optimized for serverless functions and static sites; it does not natively host long-running Express servers with WebSocket support.

Recommended (easy, works with current code): Render or Railway

- Connect your GitHub repo: https://github.com/Alpereneri12/Engi-Log
- In Render (or Railway) create a new Web Service, link the repo and branch.
- Build Command: leave empty or `npm install`
- Start Command: `npm start`
- Environment variables to set in the service settings:
  - `PORT` (optional; Render provides one)
  - `MONGO_URI` or your Mongo connection string used by `config/db.js`
  - Any other secrets like `SESSION_SECRET` or API keys
- After deploy, Render will give you a public URL where Socket.IO and Express will work.

If you still want Vercel (possible but requires refactor or Docker):

1. Option A — Refactor to Serverless functions (non-trivial)

   - Move route handlers into `api/` serverless functions and adapt Socket.IO to use a managed real-time provider (e.g., Pusher, Ably) because Vercel serverless functions are short-lived.
   - This requires significant changes.

2. Option B — Docker (if you have a paid/advanced Vercel plan)
   - Create a `Dockerfile` that runs `node app.js` and expose the port.
   - Configure Vercel to deploy the container image (Enterprise/Pro features may be required).

Quick local fixes already applied (in this repo):

- `package.json` updated: `start` -> `node app.js`, `dev` -> `nodemon app.js`, `engines.node` >=18.
- `app.js` uses `process.env.PORT || 3000` and binds to `0.0.0.0`.
- `.gitignore` added and `node_modules` removed from Git index.

How to deploy to Render (step-by-step):

1. Create a free Render account and connect your GitHub.
2. Click "New +" → "Web Service" → choose GitHub repo `Engi-Log`.
3. Branch: `master` (or appropriate branch).
4. Environment: `Node`.
5. Start Command: `npm start` (Render will run `npm install` automatically).
6. Add environment variables in the Render dashboard (e.g., `MONGO_URI`).
7. Click Deploy — Render will build and run your app and provide a public URL.

Environment variable examples to configure in any hosting dashboard:

- `MONGO_URI` = mongodb+srv://user:pass@cluster/... (from your MongoDB)
- `SESSION_SECRET` = a secure random string
- Any other API keys used by your app

If you want, I can:

- Prepare a `Dockerfile` for container deployment, or
- Convert the repo into a Render-ready setup and push those commits, or
- Walk you through connecting the repo to your Vercel account step-by-step.

Tell me which of the three you prefer and I will proceed.
