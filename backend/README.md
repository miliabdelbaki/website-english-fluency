# PFE English Fluency Backend (Node.js + Express + MongoDB)

This backend implements the foundational APIs for the gamified English learning platform (Grades 4–6) with:

- Authentication (JWT)
- Student progress tracking
- Lesson & unit retrieval
- Group practice support
- Seed script to populate Tunisian curriculum structure (Units I–VI)

## Getting started

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start MongoDB locally (or use a hosted MongoDB) and set `MONGODB_URI` in `.env`.

4. Seed example curriculum data:

```bash
node scripts/seed.js
```

5. Start the server:

```bash
npm run dev
```

The server will attempt to listen on `http://localhost:4000` by default and will automatically try the next available port (up to 4010) if the port is already in use.

## Key API endpoints

- `POST /api/auth/signup` — create student account
- `POST /api/auth/login` — authenticate (returns JWT)
- `GET /api/grades` — list grades
- `GET /api/units/:grade` — list units for a grade
- `GET /api/lessons/:grade/:unitNumber` — list lessons
- `POST /api/progress/attempt` — submit an attempt and mark lesson complete (AI score stub if no score supplied)
- `GET /api/progress/unit/:grade/:unitNumber` — report unit progress & unlock state (unlock based on total lesson count)
- `GET /api/practice/next?grade={grade}&unitNumber={unit}` — get next lesson exercise to practice (with audio placeholder)
- `POST /api/groups` — create group
- `POST /api/groups/join` — join group with code
- `GET /api/groups/:code` — group details
- `POST /api/groups/:code/attempt` — submit group attempt

## Notes

- This backend uses MongoDB with Mongoose models.
- The seed script creates unit/lesson data focused on Unit V (Celebrations).
