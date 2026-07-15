# BodyLog

Single-user fitness tracker for gym, calisthenics, cardio, and custom workouts.
Log sets, track body weight over time, export data for AI analysis.
Built with Nuxt 4, Turso (libSQL), and scrypt-based authentication.

---

## Features

- **Workout logging** — gym (weight × reps), calisthenics (reps/holds), cardio, and custom programs
- **Weight tracking** — weekly weight entries with goal configuration and bulk/cut progress visualization
- **Program editor** — drag-and-drop exercise reordering, equipment palettes, custom day scheduling
- **AI Coach export** — compile workout and weight history to CSV, auto-copy a structured prompt for AI analysis
- **Rest timer** — in-workout timer with audio alarm, vibration, and browser notification
- **Onboarding tour** — guided first-run walkthrough for mode selection and feature discovery
- **PWA support** — installable as standalone app with offline-ready manifest

---

## Tech Stack

| Layer       | Technology                               |
| ----------- | ---------------------------------------- |
| Framework   | Nuxt 4 + Nitro (server engine)           |
| Language    | TypeScript                               |
| Runtime     | Bun (dev) / Node.js 20 (production)      |
| UI          | Nuxt UI v4, Tailwind CSS v4, Lucide      |
| Database    | Turso (libSQL)                           |
| Auth        | scrypt password hashing, cookie sessions |
| Drag & Drop | @formkit/drag-and-drop                   |
| Confetti    | canvas-confetti                          |

---

## Project Structure

```
bodylog-turso/
├── app/
│   ├── app.vue                    # Root layout
│   ├── error.vue                  # Error page
│   ├── assets/css/main.css        # Tailwind + custom theme tokens
│   ├── components/                # Vue components
│   │   ├── editor/                # Program editor (exercise list, palette)
│   │   ├── workout/               # Workout session (ExerciseCard, SaveFooter, timer)
│   │   └── profile/               # Settings sub-components
│   ├── composables/               # Shared state (useAuth, useMode, useTimer)
│   ├── pages/                     # Route pages
│   │   ├── index.vue              # Landing
│   │   ├── login.vue              # Login / account setup
│   │   ├── workout.vue            # Workout log
│   │   ├── weight.vue             # Weight tracker
│   │   ├── coach.vue              # AI Coach export
│   │   ├── profile.vue            # Settings
│   │   ├── forgot-password.vue
│   │   └── reset-password.vue
│   └── utils/                     # Tour config, workout defaults
├── server/
│   ├── utils/
│   │   ├── db.ts                  # Turso client, schema initialization (10 tables)
│   │   └── auth.ts                # scrypt hashing, requireAuth middleware
│   └── api/
│       ├── auth/                  # status, setup, login, me, forgot, reset, password
│       ├── workout/               # get, save
│       ├── weight/                # get, save, delete
│       ├── program/               # get, save, start-date
│       └── export/                # all data export
├── types/index.ts                 # Shared TypeScript interfaces
├── public/                        # Static assets (favicon, manifest, robots.txt)
├── nuxt.config.ts
├── Dockerfile
├── docker-compose.yml
├── shell.nix                      # Nix dev shell
└── package.json
```

---

## Prerequisites

- **Turso database** — a libSQL database URL and auth token (see [turso.tech](https://turso.tech))
- **Node.js 20+** or **Bun** (for local development)
- **Docker** (optional, for containerized deployment)

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd bodylog-turso

# Install dependencies
bun install
```

---

## Configuration

Copy the example env file and fill in your Turso credentials:

```bash
cp .env.example .env
```

Required environment variables:

| Variable             | Description                |
| -------------------- | -------------------------- |
| `TURSO_DATABASE_URL` | Turso libSQL database URL  |
| `TURSO_AUTH_TOKEN`   | Turso authentication token |

Optional — only needed for Docker with a local SQLite fallback:

| Variable  | Description                | Default |
| --------- | -------------------------- | ------- |
| `DB_PATH` | Local SQLite database path | `/data` |

---

## Usage

### Development

```bash
bun dev        # Start dev server at http://localhost:3000
```

### Production build

```bash
bun run build     # Build for production
bun run preview   # Preview production build
```

### Nix shell

```bash
direnv allow      # Or: nix-shell shell.nix
```

---

## Deployment

### Docker

```bash
docker compose up --build -d
```

The container exposes port `3000`. The `bodylog_data` volume persists the SQLite database when `DB_PATH` is used.

Make sure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in the environment before the container starts.

---

## Verification

After starting the dev server or container:

1. Open `http://localhost:3000`
2. Create an account via the setup flow
3. Select a training mode (gym, calisthenics, cardio, or custom)
4. Log a workout at `/workout` or record weight at `/weight`
5. Export data for AI analysis at `/coach`

---

## License

Proprietary. All rights reserved. See [LICENSE](LICENSE).
