# SRM PYQ Web App

React + TypeScript + Tailwind app for browsing SRM previous year question papers via the public SRM PYQ API.

## Features

- Course search and cursor-based pagination
- Course paper listing with optional year/term filters
- Paper file listing with fresh download URL fetch per click
- No authentication

## Use Case

This platform helps students quickly find and access Previous Year Questions (PYQs) across 5000+ subjects/courses through a single, user-friendly interface.

In typical exam preparation, PYQs are often scattered across class groups, shared drives, and personal folders, making revision slow and inconsistent. Students can use this platform to search their course, browse available papers by year or term, and open relevant files in a few steps—without manually chasing links from multiple sources.

Common workflows include building a last-week revision plan by collecting recent papers for each enrolled subject, practicing topic-wise by comparing question patterns across years, and doing timed mock sessions using past papers before internals or end-semester exams. By reducing search friction and centralizing access, the platform helps students spend more time practicing and less time finding material.

## API

- Development uses Vite proxy (`/api`) to avoid browser CORS issues.
- Production default base URL: `https://srm-pyq-api.onrender.com`
- Optional production override with environment variable:

```bash
VITE_API_BASE_URL=https://srm-pyq-api.onrender.com
# Optional: override the dev/preview proxy target
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8000
# Optional: public R2 base URL for permanent PDF links when API public_url is null
VITE_R2_PUBLIC_BASE_URL=
```

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

If `npm run dev` was already running, restart it after config changes so the proxy is applied.

## Build and Lint

```bash
npm run lint
npm run build
```

## Testing and DevOps

- `npm run test` / `npm run test:coverage` — Vitest unit tests with V8 coverage
- `npm run typecheck` — TypeScript project check
- `npm run lint` — ESLint
- `docker build -t srm-pyq-web .` — production nginx image
- Full stack: `docker compose up --build` from the workspace root
- CI: `.github/workflows/ci.yml` runs lint, typecheck, tests, build, Docker build, and a Trivy image scan
- Security: CodeQL (weekly) and Dependabot (weekly)

See the workspace root `README.md` for the full DevOps guide.

## Routes

- `/` — course search/list
- `/courses/:courseCode` — papers for a course
- `/papers/:paperId` — files for a paper + download action

## Notes

- `courseCode` is URL-encoded when used in API path segments.
- Download links are fetched on demand using `/v1/files/{file_id}/download` because signed URLs may expire.
- If `public_url` is available (or `VITE_R2_PUBLIC_BASE_URL` is configured), viewer prefers permanent public URLs.
