# BodyLog

TBA

<!--
Minimalist gym & body weight tracker dengan AI coaching. Self-hosted. Data di server kamu sendiri.
-->

---

## Features

<!--
- **Gym Log** — 12-week barbell program, 5 hari/minggu. Progressive overload otomatis — data minggu lalu muncul sebagai referensi setiap session.
- **Calisthenics Log** — Home program menuju planche. Reps & hold time tracking, substitusi alat, planche milestone tracker.
- **Bulk Tracker** — Weekly weigh-in, progress log (start → current → gained), cardio reminder.
- **AI Coach** — Export semua data ke CSV + auto-generate prompt untuk Gemini. Context-aware: AI baca semua notes kamu sebelum analisis.
- **Dual Mode** — Switch antara Gym dan Calist kapan saja dari navbar.
- **Program Editor** — Rename exercise sesuai alat atau nama yang kamu pakai.
- **Self-Hosted** — Data tersimpan di SQLite lokal. Tidak ada cloud. Tidak ada langganan.
-->

---

## Tech Stack

<!--
- **Framework:** Nuxt 4 (Vue 3)
- **Styling:** Tailwind CSS v4
- **Database:** SQLite via `better-sqlite3`
- **Auth:** Cookie-based, username + password, server-side sessions
- **Deployment:** Docker + docker-compose
-->

---

## Deployment

### Prerequisites

<!--
- Docker dan docker-compose terinstall di server
-->

### 1. Clone Repository

```bash
git clone https://github.com/szuryuu/bodylog.git
cd bodylog
```

### 2. Configure Environment

```bash
cp .env.example .env
```

<!--
Isi `.env`:

```env
DB_PATH=/data
```

Itu saja. Tidak ada API key, tidak ada credential eksternal.
-->

### 3. Build & Run

```bash
docker compose up -d --build
```

<!--
App akan berjalan di `http://localhost:3000`.
-->

### 4. Claim Server (First Run)

<!--
1. Buka URL app di browser
2. Langsung masuk ke halaman login dengan mode **"CLAIM SERVER"**
3. Buat username dan password — ini mengunci instance ke akun kamu
4. Login selesai, mulai log

> **Catatan:** Kalau kamu tidak langsung klaim server setelah deploy, siapa pun yang mengakses URL bisa membuat akun. Klaim segera setelah deploy.
-->

### 5. Configure Start Dates (Penting)

<!--
Setelah login, buka **Settings → Program Start Dates** dan set tanggal mulai program.

Week number dihitung otomatis dari tanggal ini. Kalau tidak diset, default ke hari deploy (Week 1 = hari ini).
-->

---

## Update

```bash
git pull
docker compose down
docker compose up -d --build
```

<!--
Data di volume `bodylog_data` tidak akan hilang.
-->

---

## Common Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Rebuild (setelah update kode)
docker compose up -d --build

# View logs
docker logs bodylog -f

# Restart
docker compose restart
```

---

## Data Backup

<!--
Dari **Settings → Data → Download JSON Backup**.

Atau manual:

```bash
docker cp bodylog:/data/bodylog.db ./bodylog_backup.db
```
-->

---

## Local Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

<!--
Buka `http://localhost:3000`.

Database local: `./data/bodylog.db` (auto-created).
-->

---

## Environment Variables

<!--
| Variable | Default | Description |
|---|---|---|
| `DB_PATH` | `./data` | Directory untuk SQLite file |

Hanya ini yang dibutuhkan. Tidak ada Google credentials, tidak ada Sheets API, tidak ada external services.
-->

---

## License

MIT — lihat [LICENSE](LICENSE)
