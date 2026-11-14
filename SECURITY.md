# Security Policy

## Secret & Environment Handling

- All `.env` and `.env.*` files (except the secret-free `.env.example` template) are excluded via `.gitignore`.
- `GEMINI_API_KEY` is read strictly on the server inside `server.ts` and is never exposed in `VITE_*` client environment variables or frontend bundles.
- Client-side Firebase configuration (`firebase-applet-config.json`) contains only public project identifiers, while all user data and leaderboard writes are enforced server-side by `firestore.rules`.

## Firestore Security Controls

See `security_spec.md` and `firestore.rules` for full data invariants, identity isolation (`/users/{userId}`), verified email checks, and schema validation rules.

## Reporting a Vulnerability

If you discover a security issue in NeuroQuest AI Academy, please avoid opening a public issue with exploit details or credentials. Report it privately to the repository maintainer with reproduction steps and impact notes.
