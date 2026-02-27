# BodyLog — Context & MVP Roadmap (Updated: Feb 2026)

---

## 1. Apa Ini

BodyLog adalah app minimalis untuk tracking gym workout dan berat badan. Tool personal — single user per instance, password-based, data di SQLite, deploy via Docker di VPS.

Sedang di-convert menjadi produk yang bisa dijual ke orang lain sebagai **self-hosted app** lewat marketplace hosting.

---

## 2. Business Model — Self-Hosted Marketplace

Model **self-hosted script marketplace** (persis CodeCanyon / Softaculous):
- Setiap customer dapat instance terpisah di server mereka sendiri
- Jagoan Hosting handle provisioning, billing, dan sebagian support
- Developer dapat bagi hasil dari setiap langganan
- Developer tidak perlu kelola infra customer

Partnership: http://jagoanhosting.app/ — **⚠️ Terms belum dikonfirmasi secara tertulis.**
Sebelum push ke production, klarifikasi: revenue split, customer relationship, exclusivity, minimum payout.

---

## 3. Target Market

**Primary:** Gym-goers Indonesia yang serius — sudah tahu progressive overload, frustrasi dengan spreadsheet, budget-conscious (Rp 20–30k/bulan).

**Secondary:** Calisthenics practitioners yang ngejar skill (planche, L-sit).

**Differentiator:** Brutalist design, AI Coach context-aware, dual mode (Gym + Calist), data di server sendiri.

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 4 (Vue 3) |
| Styling | Tailwind CSS v4 |
| Backend/DB | SQLite via `better-sqlite3` |
| Auth | Cookie-based, username+password, server-side sessions |
| Deployment | Docker + docker-compose, single-stage (node_modules harus ada di disk) |
| Runtime | Node 20 Alpine (Docker), Bun locally |

**Critical:** `nitro.rollupConfig.external: ["better-sqlite3"]` di `nuxt.config.ts` — JANGAN UBAH ke `externals.inline`.

---

## 5. STATUS MVP — APA YANG SUDAH SELESAI ✅

### 5.1 Infrastructure & Deploy
- [x] SQLite database — 5 tabel: `users`, `sessions`, `bulk_entries`, `gym_sessions`, `calist_sessions`, `program_config`
- [x] Docker single-stage Dockerfile + `docker-compose.yml`
- [x] `nitro.rollupConfig.external: ["better-sqlite3"]` — fix critical Docker build crash
- [x] `.env.example` minimalis — sudah tidak butuh Google credentials

### 5.2 Authentication System
- [x] First-run setup: `GET /api/auth/status` + `POST /api/auth/setup` — saat DB kosong, login.vue menjadi "Claim Server" page
- [x] Login: `POST /api/auth/login` — username + password, returns session token
- [x] Session verification: `GET /api/auth/me` — validate session via cookie
- [x] `requireAuth(event)` server-side guard di semua write endpoints
- [x] 7-day session expiry, auto-cleanup expired sessions
- [x] `secureFetch` wrapper di `useAuth.ts` composable

### 5.3 Mode System
- [x] `useMode()` composable — mode, intensity, frequency, persisted di cookie
- [x] 3-step setup wizard di `index.vue` (mode → intensity → training days)
- [x] Quick mode switch modal di navbar — **FIX: sekarang preserve intensity/frequency**
- [x] Mode-aware routing (navbar, coach page, export)

### 5.4 Gym Tracking
- [x] 5 hari program (SENIN/SELASA/RABU/JUMAT/SABTU)
- [x] Variant system (`"Lat Pulldown / Pull-Up"` → radio buttons)
- [x] Last week data reference (progressive overload cue)
- [x] Set input (kg × reps)
- [x] Per-exercise notes + session notes
- [x] Completed checkbox
- [x] Upsert by (week, day, exercise_name)
- [x] Load current session (restore data on page refresh)

### 5.5 Calisthenics Tracking
- [x] 5 hari program (REST: Selasa + Kamis)
- [x] Type system (reps vs hold detik)
- [x] Substitution radio buttons
- [x] Last week reference
- [x] Per-exercise notes + session notes
- [x] Planche milestone tracker widget
- [x] Logging rules modal (konteks reps vs hold)

### 5.6 Weigh-In / Bulk Tracker
- [x] Weekly weight logging
- [x] Progress log (start, current, gained)
- [x] Cardio reminder section (visual only, tidak di-save)

### 5.7 AI Coach Export
- [x] Mode-aware (Gym vs Calist path)
- [x] CSV export (TYPE, WEEK, DAY, DATE, EXERCISE, SET1-4, COMPLETED, NOTES, SESSION_NOTE)
- [x] Context block builder (baca semua notes → kirim ke AI sebagai konteks)
- [x] Mode-specific Gemini prompt (gym vs calist)
- [x] Auto-copy prompt ke clipboard + auto-open Gemini setelah 3 detik

### 5.8 Settings & Customization (Baru Ditambahkan)
- [x] Program Editor di `/settings` — rename exercise per hari (Gym + Calist)
- [x] Custom program disimpan di `program_config` table (SQLite)
- [x] `GymWorkoutForm` + `CalistWorkoutForm` load custom names dari API, fallback ke defaults
- [x] Reset to defaults per tab
- [x] Data Backup: `GET /api/export/all` — full JSON export semua tabel
- [x] Download backup button di settings page

### 5.9 UX Polish
- [x] Loading skeleton states
- [x] Guest preview banner (yellow) saat tidak login
- [x] Day completion indicator (green checkmark)
- [x] Week progress counter
- [x] Brutalist design system (fonts, shadows, colors)
- [x] Mobile responsive navbar dengan hamburger menu
- [x] Error page (`error.vue`)
- [x] YouTube tutorial links per exercise (hover)

---

## 6. BUGS & ISSUES YANG DIKETAHUI 🐛

### 6.1 Kritis (Blocking untuk Production)

**[BUG-01] `APP_PASSWORD` env var adalah dead code**
- Sebelumnya: auth pakai single password dari env
- Sekarang: auth pakai username + password + sessions table
- Problem: `nuxt.config.ts` masih punya `runtimeConfig.appPassword`, `verify.post.ts` masih ada, `docker-compose.yml` masih pass `NUXT_APP_PASSWORD`, `.env.example` masih show `APP_PASSWORD=...`
- Fix: Hapus semua referensi APP_PASSWORD. Update `.env.example` jadi hanya butuh `DB_PATH`. Update `docker-compose.yml`.

**[BUG-02] `BulkWeightForm.vue` — week selalu mulai dari 1**
- `week = ref(1)` — tidak baca last saved week dari DB on mount
- User harus manual ketik week number yang benar setiap buka halaman
- Fix: Load `/api/bulk/get` on mount di `BulkWeightForm.vue`, set `week` ke `lastEntry.week + 1`

**[BUG-03] `workoutHistory` di `gym.vue`/`calist.vue` menampilkan exercise-level rows, bukan session-level**
- API returns satu row per exercise per session
- 5 exercises di hari Senin = 5 baris identik di "Recent Logs" (semua SENIN, tanggal sama)
- Fix: Deduplicate history berdasarkan (week, day) sebelum render ke tabel

**[BUG-04] Program start date hardcoded ke tanggal pribadi developer**
- Gym: `PROGRAM_START_DATE = new Date("2026-01-12")` di `gym.vue`
- Calist: `CALIST_START_DATE = new Date("2026-02-19")` di `calist.vue`
- Ini dipakai untuk hitung week otomatis. Customer baru akan dapat week yang salah.
- Fix: Simpan start date di settings / `program_config` table. Default ke tanggal hari ini saat pertama kali setup.

### 6.2 Medium (UX Issues, Tidak Blocking)

**[BUG-05] Setup wizard di `index.vue` adalah cosmetic**
- Wizard collect mode, intensity, frequency
- Tapi `GymWorkoutForm` dan `CalistWorkoutForm` ignore `intensity` dan `frequency` sepenuhnya
- Program yang ditampilkan selalu sama regardless of intensity (beginner/advanced dapat program yang sama)
- `app/utils/templates.ts` exists tapi tidak pernah dipakai di mana pun
- Untuk MVP: acceptable. Tapi jangan advertise "intensity selector" sebagai fitur aktif.

**[BUG-06] `OnboardingTour.vue` arrows tidak menunjuk ke elemen yang benar**
- Step 1 arrow: `absolute top-24 right-10` + `rotate-12` — menunjuk ke sudut kanan atas
- Di mobile, tidak ada elemen BULK di sana (ada di hamburger menu)
- Tour terasa broken, mungkin lebih baik dihapus untuk sementara

**[BUG-07] Quick mode switch bypass setup wizard**
- User yang switch via modal langsung set `intensity='intermediate', frequency=5` (hardcoded fallback)
- Mereka skip wizard, tapi index.vue menampilkan "GYM - 5 DAYS" seolah-olah mereka sudah setup
- Minor UX inconsistency, bukan bug fatal

### 6.3 Low Priority

**[BUG-08] `/api/bulk/save.post.ts` tidak punya `requireAuth`**
- Dokumentasi CLAUDE.md: "intentional"
- Tapi untuk produk komersial ini aneh — siapa pun bisa POST ke endpoint ini tanpa login
- Reconsider untuk v1.0

**[BUG-09] `/api/program/get.get.ts` tidak punya auth guard**
- Intentional supaya preview mode bisa load template
- Side effect: jika user punya custom program, guest bisa lihat nama exercise mereka
- Low risk (nama exercise bukan data sensitif)

---

## 7. FITUR YANG MASIH KURANG (Gap Analysis) 🔴

### 7.1 Fitur Missing — Langsung Blocking User

**[GAP-01] Tidak ada cara ganti password dari UI**
- User lupa password atau mau ganti = harus SSH ke server dan hapus DB
- Non-developer customer tidak bisa lakukan ini
- Fix: Tambah form "Change Password" di Settings (verifikasi password lama → set password baru)

**[GAP-02] Tidak ada cara set program start date**
- Week number dihitung otomatis dari start date hardcoded (developer punya)
- Customer baru akan dapat week 5, 6, 7... bukan week 1
- Fix: Tambah "Program Start Date" input di Settings, simpan di `program_config`

**[GAP-03] `README.md` masih menjelaskan Google Sheets + Vercel setup**
- Customer Jagoan Hosting atau user baru yang baca README akan sangat bingung
- Dokumentasi yang ada = untuk versi lama yang sudah tidak berlaku
- Fix: Tulis ulang README untuk self-hosted Docker flow

### 7.2 Fitur Missing — Penting untuk UX

**[GAP-04] Tidak ada cara tambah/hapus exercise dari Program Editor**
- Settings hanya bisa rename exercise, tidak bisa tambah exercise baru atau hapus
- User dengan program berbeda jumlah exercise tidak bisa customisasi fully
- Phase 2 target: add/remove exercise rows

**[GAP-05] `BulkWeightForm` tidak auto-detect week**
- User harus ketik manual week number setiap weigh-in
- High friction untuk fitur yang dipakai weekly

**[GAP-06] Tidak ada rest timer**
- Common request untuk gym tracking apps
- Phase 3 target

**[GAP-07] Tidak ada progress visualization**
- Tidak ada chart weight trend, tidak ada chart strength progress
- Phase 3 target

### 7.3 Business/Distribution

**[GAP-08] Partnership terms dengan Jagoan Hosting belum final**
- Revenue split? Exclusivity? Customer relationship? Payout threshold?
- Jangan invest waktu lebih sebelum ini dikonfirmasi tertulis

**[GAP-09] Tidak ada pricing page atau landing page publik**
- Untuk marketplace listing, perlu screenshots, feature list, demo video

---

## 8. USER WORKFLOW AUDIT — End to End

### 8.1 Alur Pertama Kali (First-Time User, Instance Baru)

```
1. Buka URL → landing di index.vue
   - hasMode = false → setup wizard muncul
   - Tapi user belum login! Wizard ini bisa diakses tanpa auth.
   - ✅ OK untuk UX (mode selection tidak butuh auth)

2. Setup Wizard (3 steps):
   Step 1: Pilih mode (gym/calist/cardio) → tempMode
   Step 2: Pilih intensity (beginner/intermediate/advanced) → tempIntensity
   Step 3: Pilih training days (3-7) → tempFreq
   → setMode() → cookie saved → hasMode = true
   ⚠️ WARNING: intensity dan frequency tidak berpengaruh ke actual program

3. Redirect ke Active Protocol dashboard (index.vue v2)
   - Tombol "Open Log" → navigasi ke /gym atau /calist
   - Tombol "Re-Initialize" → resetMode() → back ke wizard

4. Masuk ke /gym atau /calist
   - checkAuth() → isAuthenticated = false → preview mode banner kuning
   - Form workout tampil tapi disabled save button
   - ✅ UX ok, tapi user harus login untuk save

5. Login/Setup Account:
   - Klik Login di navbar → /login
   - checkAppStatus() → isSetup = false (DB masih kosong) → "Claim Server" mode
   - User set username + password → POST /api/auth/setup
   - Sukses → cookie auth_token set → redirect ke /
   ✅ Flow ini berjalan dengan baik

6. Kembali ke halaman log → sekarang isAuthenticated = true
   - Data bisa disave
   - ✅ OK
```

### 8.2 Alur Log Workout (Returning User, Sudah Login)

```
1. Buka app → checkAuth() → isAuthenticated = true
2. Navbar menampilkan mode (GYM/CALIST) badge
3. Navigasi ke /gym atau /calist
   - calculatedWeek = auto-calculated dari HARDCODED start date 🐛 BUG-04
   - todayDay = auto-detected
   - Hari ini auto-selected di day tabs
   - ⚠️ Kalau hari ini = rest day (KAMIS), gym.vue tidak ada logika khusus
     → user masih bisa klik KAMIS, form akan tampil (REST DAY display)
     → ✅ OK tapi bisa lebih smart

4. Exercise form load:
   - onMounted: load custom program from /api/program/get → merge dengan defaults
   - Load last week data (progressive overload reference)
   - Load current week's existing data (restore sebelumnya)
   - ✅ Flow lengkap

5. User isi sets → klik "Save Workout"
   - POST /api/gym/save → requireAuth → upsert ke SQLite
   - lastSaved timestamp muncul
   - ✅ OK

6. Pindah hari → klik day tab → form re-initialize
   - ✅ OK via watch(props.day)
```

### 8.3 Alur Weigh-In

```
1. Navigasi ke /bulk
2. Form muncul dengan week = 1 🐛 BUG-02
   → User harus ketik manual week yang benar setiap kali
3. Input weight → Save → emit('saved') → loadWeightData()
4. Progress log update (start, current, gained)
5. Cardio checklist (visual only, reset on refresh)
⚠️ Week auto-increment setelah save (week.value++) tapi hanya dalam session
```

### 8.4 Alur AI Coach

```
1. Navigasi ke /coach
2. Input tinggi badan (cm)
3. Klik "Summon AI Coach"
   - Fetch /api/gym/get (atau /api/calist/get) + /api/bulk/get
   - Build CSV (TYPE, WEEK, DAY, DATE, EXERCISE, SET1-4...)
   - Build AI prompt dengan context block (semua notes)
   - Download CSV file
   - Copy prompt ke clipboard
   - Auto-open Gemini setelah 3 detik
4. Di Gemini: paste prompt → attach CSV → submit
✅ Flow ini cukup baik untuk MVP meski masih manual
```

### 8.5 Alur Settings & Customization (Baru)

```
1. Navigasi ke /settings (harus login)
2. Tab GYM atau CALIST
3. Edit nama exercise per hari
4. Klik "Simpan Program" → POST /api/program/save
5. Refresh halaman log → form load nama baru
⚠️ Tidak ada notifikasi di form log bahwa program sudah di-customize
```

### 8.6 Alur Logout

```
1. Klik Logout di navbar
2. Confirm modal muncul
3. Klik "Yes, I'm Done" → clearCookie + navigateTo('/')
4. index.vue: isAuthenticated = false → layout tetap tapi save buttons disabled
✅ OK
```

---

## 9. PRIORITAS PERBAIKAN — Sebelum Launch

### P0 — Harus selesai sebelum bisa dijual

- [ ] **[BUG-01]** Hapus `APP_PASSWORD` dari semua file (nuxt.config, docker-compose, .env.example, verify.post.ts)
- [ ] **[BUG-02]** Fix `BulkWeightForm` auto-detect week dari last entry
- [ ] **[BUG-03]** Deduplicate `workoutHistory` di gym.vue + calist.vue (session-level, bukan exercise-level)
- [ ] **[BUG-04]** Program start date user-configurable (Settings + `program_config` table)
- [ ] **[GAP-01]** Change password form di Settings
- [ ] **[GAP-03]** Tulis ulang README.md untuk Docker self-hosted flow

### P1 — Penting untuk UX, fix sebelum bayar user complaint

- [ ] **[GAP-05]** `BulkWeightForm` auto-detect week (sudah covered di BUG-02)
- [ ] **[BUG-05]** Keluarkan intensity/frequency dari marketing — jangan advertise sebagai aktif
- [ ] **[BUG-06]** Hapus atau fix OnboardingTour.vue
- [ ] **[GAP-04]** Add/remove exercise rows di Program Editor (bukan hanya rename)

### P2 — Post-launch, growth phase

- [ ] Konfirmasi terms Jagoan Hosting secara tertulis
- [ ] Full program builder (custom days, exercises, set schemes)
- [ ] In-app AI Coach (tidak perlu export manual)
- [ ] Progress charts (weight trend, strength trend per exercise)
- [ ] Rest timer
- [ ] Landing page / pricing page

---

## 10. Database Architecture

Database file: `./data/bodylog.db` locally, `/data/bodylog.db` in Docker.

### Tables

**`users`** — id, username, password_hash, created_at
**`sessions`** — token, user_id, expires_at
**`bulk_entries`** — id, week (UNIQUE), date, weight, notes
**`gym_sessions`** — id, week, day, date, time, exercise_name, set1-4, completed, notes, session_note — UNIQUE(week, day, exercise_name)
**`calist_sessions`** — same schema as gym_sessions — UNIQUE(week, day, exercise_name)
**`program_config`** — key (PRIMARY KEY), value (JSON string) — keys: `program_gym`, `program_calist`, `start_date_gym`, `start_date_calist`

### API Response Format

All `get` endpoints return `{ data: any[][] }`.

**Gym/Calist column index:** [0] week, [1] day, [2] date, [3] time, [4] exercise_name, [5] set1, [6] set2, [7] set3, [8] set4, [9] completed, [10] notes, [11] session_note

**Bulk column index:** [0] week, [1] date, [2] weight, [3] notes

---

## 11. File Tree (Current)

```
bodylog/
├── CLAUDE.md
├── nuxt.config.ts                  ← nitro.rollupConfig.external: ["better-sqlite3"] ← CRITICAL
├── tsconfig.json
├── package.json
├── .env.example                    ← ⚠️ Masih ada APP_PASSWORD — harus dihapus
├── Dockerfile
├── docker-compose.yml              ← ⚠️ Masih pass NUXT_APP_PASSWORD — harus dihapus
│
├── types/index.ts
│
├── app/
│   ├── app.vue                     ← Fix: selectMode() preserve intensity/frequency
│   ├── error.vue
│   ├── assets/css/main.css
│   ├── composables/
│   │   ├── useAuth.ts              ← ⚠️ Uses new /api/auth/login flow, verify.post.ts = dead
│   │   └── useMode.ts
│   ├── components/
│   │   ├── GymWorkoutForm.vue      ← Loads custom program from API
│   │   ├── CalistWorkoutForm.vue   ← Loads custom program names from API
│   │   ├── BulkWeightForm.vue      ← ⚠️ BUG-02: week starts at 1
│   │   └── OnboardingTour.vue      ← ⚠️ BUG-06: arrows broken, consider removing
│   ├── pages/
│   │   ├── index.vue               ← Setup wizard + active protocol dashboard
│   │   ├── login.vue               ← Doubles as first-run setup page
│   │   ├── gym.vue                 ← ⚠️ BUG-03: history shows exercise rows. BUG-04: hardcoded start date
│   │   ├── calist.vue              ← ⚠️ same as gym.vue
│   │   ├── bulk.vue
│   │   ├── coach.vue
│   │   ├── settings.vue            ← NEW: program editor + data backup
│   │   └── profile.vue             ← Exists but not in navbar (dead page)
│   └── utils/
│       └── templates.ts            ← ⚠️ Dead code: never consumed by any form
│
└── server/
    ├── utils/
    │   ├── auth.ts                 ← requireAuth(), hashPassword(), verifyPassword()
    │   └── db.ts                   ← getDb(), initializeTables(), + program_config table
    └── api/
        ├── auth/
        │   ├── status.get.ts       ← GET /api/auth/status — is DB claimed?
        │   ├── setup.post.ts       ← POST /api/auth/setup — first-run account creation
        │   ├── login.post.ts       ← POST /api/auth/login — returns session token
        │   ├── me.get.ts           ← GET /api/auth/me — validate current session
        │   └── verify.post.ts      ← ⚠️ DEAD CODE — old single-password auth, unused
        ├── bulk/
        │   ├── get.get.ts
        │   └── save.post.ts        ← ⚠️ No requireAuth (intentional per CLAUDE.md, but reconsider)
        ├── gym/
        │   ├── get.get.ts
        │   └── save.post.ts        ← requireAuth ✅
        ├── calist/
        │   ├── get.get.ts
        │   └── save.post.ts        ← requireAuth ✅
        ├── program/
        │   ├── get.get.ts          ← NEW: no auth (intentional for preview mode)
        │   └── save.post.ts        ← NEW: requireAuth ✅
        └── export/
            └── all.get.ts          ← NEW: requireAuth ✅
```

---

## 12. Environment Variables

**Sekarang yang dibutuhkan (setelah cleanup BUG-01):**
```env
DB_PATH=/data          # Directory untuk SQLite file
```

**Yang masih ada tapi sudah tidak dipakai (harus dihapus):**
```env
APP_PASSWORD=...       # Dead — auth sekarang pakai username+password dari DB
```

---

## 13. Docker Deployment

### Commands
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
docker logs bodylog -f
```

Data persists di Docker volume `bodylog_data` → `/data/bodylog.db`.

### Kenapa Single-Stage
`better-sqlite3` adalah native addon (.node binary). Multi-stage fails karena `.output` saja tidak cukup — `node_modules` harus ada di disk.

---

## 14. Catatan untuk AI Session Berikutnya

Konteks paling penting untuk dilanjutkan:

1. **Auth sudah pakai username+password** — bukan lagi single APP_PASSWORD. `verify.post.ts` = dead code.
2. **`APP_PASSWORD` harus dibersihkan** dari nuxt.config, docker-compose, .env.example, verify.post.ts
3. **3 bug utama sebelum launch:** week detection di bulk form (BUG-02), history dedup di gym/calist (BUG-03), start date hardcoded (BUG-04)
4. **Change password form** masih belum ada di settings.vue — GAP-01
5. **README.md harus ditulis ulang** — masih Google Sheets era
6. **Program editor** sudah bisa rename exercise, belum bisa add/remove
7. **`app/utils/templates.ts`** adalah dead code — generateProgram() tidak dipakai di mana pun

Lihat `CLAUDE.md` untuk technical details lengkap, coding conventions, dan output rules.
