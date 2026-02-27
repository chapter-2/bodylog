# BodyLog — Context & MVP Roadmap

---

## 1. Apa Ini

BodyLog adalah app minimalis untuk tracking gym workout dan berat badan. Awalnya dibuat sebagai tool personal — single user, password-based, data di Google Sheets, deploy di Vercel.

Sekarang sedang di-convert menjadi produk yang bisa dijual ke orang lain sebagai **self-hosted app** lewat marketplace hosting.

---

## 2. Business Model — Self-Hosted Marketplace (Bukan SaaS)

### Yang Dimaksud

Ini **bukan SaaS tradisional** (satu instance, banyak tenant). Ini model **self-hosted script marketplace** — persis seperti CodeCanyon atau Softaculous:

- Setiap customer dapat **instance terpisah** di server mereka sendiri
- Jagoan Hosting yang handle provisioning, billing, dan sebagian support
- Developer (lo) dapat **bagi hasil** dari setiap langganan
- Lo tidak perlu kelola infra customer sama sekali

### Kenapa Model Ini Cocok

Arsitektur BodyLog yang single-user + password-based sudah **perfect** untuk model ini. Tidak perlu rebuild auth, tidak perlu multi-tenancy, tidak perlu shared database. Yang perlu ganti cuma database backend-nya.

| | SaaS Sejati | Self-Hosted Marketplace |
|---|---|---|
| Database | Satu DB, banyak tenant | Satu DB per customer |
| Auth | Multi-user system | Single-user (sudah ada ✓) |
| Update | Deploy sekali | Update tiap instance |
| Dev effort | Besar (rebuild from scratch) | **Kecil (refactor)** |
| Infrastructure | Lo yang kelola | Jagoan Hosting yang kelola |

### Partnership: Jagoan Hosting

Platform: http://jagoanhosting.app/

Mereka yang approach duluan setelah melihat project. Feedback mereka ke project awal:

> *"Kemudahan Setup: konfigurasi melalui .env dan Google Project ID tidak user-friendly untuk pengguna awam. Kami rekomendasikan database yang bisa diinstall di dalam server."*

Ini feedback valid. Mereka bersedia:
- Menyiapkan server untuk setiap customer
- Otomasi instalasi database dan penulisan konfigurasi ke `.env`
- Kemungkinan bagi hasil (terms belum final)

**⚠️ Terms belum dikonfirmasi secara tertulis.** Sebelum push ke production, klarifikasi:
1. Revenue split berapa persen?
2. Siapa yang pegang customer relationship?
3. Apakah ada exclusivity? (kalau iya = red flag)
4. Minimum payout threshold?

---

## 3. Target Market

**Primary:** Gym-goers Indonesia yang serius dengan program — bukan casual lifter.

Karakteristik:
- Sudah tahu apa itu progressive overload
- Frustrasi dengan spreadsheet tapi tidak mau app yang bloated
- Senang dengan estetika yang berbeda dari Fitbod/Strong yang generik
- Budget-conscious — Rp 20–30k/bulan acceptable kalau value clear

**Secondary:** Calisthenics practitioners yang ngejar skill (planche, L-sit) — currently underserved di market tracker

**Ukuran market Indonesia:** Estimasi 50–100k user potensial di segmen ini. Target realistis tahun pertama: 200–500 paying users.

**Differentiator:**
- Design brutalist yang tidak mirip kompetitor manapun
- AI Coach yang context-aware (baca notes, tidak flag injury sebagai regression)
- Dua mode: Gym dan Calisthenics dalam satu app
- Data di server sendiri = privacy

---

## 4. Status Sekarang — Apa yang Sudah Selesai

### Technical Foundation ✅
- Database migrasi dari Google Sheets → **SQLite** (`better-sqlite3`)
- Tiga tabel: `bulk_entries`, `gym_sessions`, `calist_sessions`
- Semua API endpoints ditulis ulang, response format dipertahankan (frontend tidak perlu diubah)
- **Docker deployment** — single-stage Dockerfile, volume mount untuk `/data`
- `docker-compose.yml` dengan volume persistence yang benar

### Feature Parity ✅
- Gym tracking (5 hari/minggu, progressive overload, variant system)
- Calisthenics tracking (reps + hold exercises, substitution system, planche progression)
- Weigh-in / bulk tracker
- AI Coach export (mode-aware CSV + prompt untuk Gemini)
- Mode switcher (Gym ↔ Calisthenics) persisted di cookie

### Config Simplification ✅
- Hapus semua Google API keys dari `.env`
- `.env` sekarang cuma butuh dua variabel: `APP_PASSWORD` dan `DB_PATH`
- Jagoan Hosting bisa auto-generate ini saat provisioning

---

## 5. MVP Gap — Yang Belum Ada

Ini yang masih **blocking** sebelum app layak dijual ke non-developer:

### 🔴 Blocker: First-Run Setup Page

**Problem:** Saat ini `APP_PASSWORD` diset di `.env`. User harus masuk ke server untuk ganti password. Ini tidak acceptable untuk non-developer.

**Solution yang dibutuhkan:** Halaman setup saat pertama kali buka app (ketika `APP_PASSWORD` belum di-set atau app belum dikonfigurasi). User bisa set password mereka sendiri dari browser. Setelah setup selesai, halaman ini tidak bisa diakses lagi.

Flow yang diinginkan:
1. Jagoan Hosting deploy instance → `APP_PASSWORD` kosong
2. Customer buka URL instance mereka → diarahkan ke `/setup`
3. Customer set password → tersimpan ke file config atau env
4. Redirect ke `/login` → selesai, app siap dipakai

### 🔴 Blocker: Program Builder / Flexible Templates

**Problem:** Program gym dan calisthenics hardcoded di `GymWorkoutForm.vue` dan `CalistWorkoutForm.vue`. User dengan program berbeda tidak bisa pakai app ini. Ini membatasi market secara signifikan.

**Solution yang dibutuhkan:** Minimal — UI untuk edit exercise names dan jumlah set. Idealnya — full program builder (tambah/hapus exercise, custom program name, pilih hari).

**Scope MVP:** Untuk launch awal, minimal bisa edit exercise names supaya user yang punya variasi program bisa menyesuaikan. Full program builder bisa jadi fitur V2.

### 🟡 Penting: Data Export / Backup

**Problem:** Tidak ada cara untuk user mengeksport semua data mereka sebagai backup.

**Solution:** Tombol "Export All Data" yang download `.json` atau `.csv` dari seluruh isi database.

**Kenapa penting:** Trust signal. User tidak akan bayar recurring fee kalau mereka takut kehilangan data. Ini juga diferensiasi dari cloud-only apps — "data lo, lo yang pegang."

### 🟡 Penting: In-App AI Coach (Long-term)

**Problem saat ini:** Flow AI Coach masih manual — download CSV → buka Gemini → paste prompt → upload file. Terlalu banyak langkah untuk user awam.

**Ideal:** AI Coach langsung di dalam app, tinggal klik "Analyze" dan dapat response.

**Scope MVP:** Flow manual yang sekarang masih acceptable untuk launch. In-app AI bisa jadi fitur V2 premium.

---

## 6. Technical Decisions — Kenapa Dibuat Begini

### Kenapa SQLite (bukan MySQL/PostgreSQL)

- **Zero config** untuk user — tidak perlu install database server terpisah
- File tunggal di `/data/bodylog.db` — mudah di-backup, mudah di-migrate
- Perfect untuk single-user app — tidak butuh concurrent write performance
- Jagoan Hosting bisa deploy tanpa setup database server

### Kenapa Docker Single-Stage (bukan Multi-Stage)

`better-sqlite3` adalah native addon (.node binary hasil compile C++). Tidak bisa di-bundle oleh Rollup/Nitro. `node_modules` harus tetap ada di disk saat runtime. Multi-stage yang copy hanya `.output` akan crash dengan `Cannot find package 'better-sqlite3'`.

Trade-off: image lebih besar (~600MB). Ini tidak bisa dihindari.

### Kenapa Self-Hosted (bukan Multi-Tenant SaaS)

- **Dev effort 10x lebih kecil** — tidak perlu re-architect auth, database isolation, billing system
- **Cocok dengan partnership Jagoan Hosting** — mereka yang handle per-instance provisioning
- **Data privacy** — setiap customer punya data mereka sendiri, tidak shared
- **Arsitektur existing sudah perfect** — single-user, single-password, tidak perlu diubah

---

## 7. Roadmap

### Phase 1 — Stabilize (Sekarang)
- [x] Migrasi database ke SQLite
- [x] Docker deployment working
- [ ] Fix Docker build error (`googleapis` / `sheets.ts`)
- [ ] End-to-end test: login → log workout → save → verify di DB

### Phase 2 — MVP Sellable
- [ ] First-run setup page (`/setup`)
- [ ] Minimal program editor (edit exercise names + set count)
- [ ] Data export / backup feature
- [ ] README yang jelas untuk Jagoan Hosting team (setup instructions)
- [ ] Klarifikasi terms partnership secara tertulis

### Phase 3 — Growth (Post-Launch)
- [ ] Full program builder (custom days, exercises, set schemes)
- [ ] In-app AI Coach (langsung ke Claude/Gemini API, tidak perlu export manual)
- [ ] Progress charts / visualization
- [ ] Rest timer
- [ ] Multi-language (EN + ID)

### Phase 4 — Validation Gate
Sebelum invest waktu di Phase 3, target:
- 50+ paying users di Jagoan Hosting marketplace
- Minimal 3 user yang aktif 4+ minggu
- Net Promoter Score positif dari survey sederhana

---

## 8. Catatan untuk AI Session Berikutnya

Kalau membuka conversation baru untuk lanjut develop, konteks yang paling penting:

1. **Model bisnis adalah self-hosted marketplace** — setiap customer = instance terpisah. Bukan multi-tenant.
2. **Database adalah SQLite** — `server/utils/db.ts`, tabel: `bulk_entries`, `gym_sessions`, `calist_sessions`
3. **Docker sudah running** — single-stage, `node_modules` harus tetap ada, jangan ubah ke multi-stage
4. **`server/utils/sheets.ts` sudah dihapus** — jangan recreate, Nitro akan crash kalau file itu ada
5. **`nuxt.config.ts` punya `nitro.rollupConfig.external: ["better-sqlite3"]`** — jangan ubah ke `externals.inline`
6. **Next priority adalah first-run setup page** — ini yang paling blocking untuk bisa dijual

Lihat `CLAUDE.md` untuk technical details lengkap.
