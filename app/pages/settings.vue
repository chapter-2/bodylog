<template>
    <div class="min-h-screen bg-background">
        <!-- ─── HEADER ─── -->
        <div class="inner border-x bg-white py-16 border-b border-separator relative overflow-hidden">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                <span class="text-[15rem] font-black font-sans text-primary">SET</span>
            </div>
            <div class="relative z-10 text-center">
                <span class="font-handwriting text-xl text-primary mb-2 block rotate-1">Customisasi Programmu</span>
                <h1 class="text-5xl md:text-7xl font-black uppercase text-foreground-primary">
                    Settings
                </h1>
                <p class="font-mono text-sm mt-4 text-foreground-text opacity-70">
                    Edit program, backup data.
                </p>
            </div>
        </div>

        <!-- ─── CONTENT ─── -->
        <div class="inner border-x border-separator bg-white">

            <!-- ── SECTION 1: PROGRAM EDITOR ── -->
            <div class="p-8 md:p-12 border-b border-separator">
                <div class="flex items-center gap-3 mb-2">
                    <ListChecks class="w-6 h-6 text-primary" />
                    <h2 class="text-2xl font-black uppercase tracking-tight">Program Editor</h2>
                </div>
                <p class="font-mono text-xs text-foreground-text opacity-60 mb-8">
                    Ubah nama exercise per hari. Nama yang disimpan di sini akan dipakai di form log.
                    Reset ke default jika ingin kembali ke program bawaan.
                </p>

                <!-- Mode tabs -->
                <div class="flex gap-2 mb-8">
                    <button
                        @click="activeTab = 'gym'"
                        :class="['px-6 py-2 font-bold text-sm uppercase tracking-wider border-2 transition-all', activeTab === 'gym' ? 'bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-foreground-primary border-separator hover:border-foreground-primary']"
                    >
                        <Dumbbell class="w-4 h-4 inline mr-2" />Gym
                    </button>
                    <button
                        @click="activeTab = 'calist'"
                        :class="['px-6 py-2 font-bold text-sm uppercase tracking-wider border-2 transition-all', activeTab === 'calist' ? 'bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-foreground-primary border-separator hover:border-foreground-primary']"
                    >
                        <Activity class="w-4 h-4 inline mr-2" />Calist
                    </button>
                </div>

                <!-- Loading skeleton -->
                <div v-if="loadingProgram" class="space-y-4">
                    <div v-for="i in 5" :key="i" class="border border-separator p-4 animate-pulse">
                        <div class="h-5 w-32 bg-separator mb-3"></div>
                        <div class="space-y-2">
                            <div v-for="j in 4" :key="j" class="h-10 bg-separator/50"></div>
                        </div>
                    </div>
                </div>

                <!-- Gym editor -->
                <div v-else-if="activeTab === 'gym'" class="space-y-6">
                    <div
                        v-for="(day, dayKey) in gymEditor"
                        :key="dayKey"
                        class="border border-separator rounded-xl overflow-hidden"
                    >
                        <div class="flex items-center gap-3 p-4 bg-background border-b border-separator">
                            <span class="font-black text-lg uppercase text-foreground-primary">{{ day.name }}</span>
                            <span class="font-mono text-xs text-foreground-text opacity-60">{{ day.focus }}</span>
                        </div>
                        <div class="p-4 space-y-3">
                            <div
                                v-for="(ex, exIdx) in day.exercises"
                                :key="exIdx"
                                class="flex items-center gap-3"
                            >
                                <span class="font-mono text-xs text-primary w-5 shrink-0">{{ exIdx + 1 }}</span>
                                <input
                                    v-model="day.exercises[exIdx]"
                                    type="text"
                                    class="flex-1 bg-transparent border-b border-separator py-2 font-bold text-sm text-foreground-primary focus:outline-none focus:border-primary transition-colors placeholder:text-separator placeholder:font-normal"
                                    :placeholder="`Exercise ${exIdx + 1}`"
                                />
                                <span
                                    v-if="ex.includes(' / ')"
                                    class="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0"
                                >VARIANT</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                        <p class="font-mono text-xs text-yellow-800 leading-relaxed">
                            <strong>Catatan:</strong> Nama dengan " / " (spasi-slash-spasi) akan menjadi variant yang bisa dipilih via radio button di form log.
                            Contoh: "Lat Pulldown / Cable Row" → user pilih salah satu.
                        </p>
                    </div>
                </div>

                <!-- Calist editor -->
                <div v-else-if="activeTab === 'calist'" class="space-y-6">
                    <div
                        v-for="(day, dayKey) in calistEditor"
                        :key="dayKey"
                        class="border border-separator rounded-xl overflow-hidden"
                    >
                        <div class="flex items-center gap-3 p-4 bg-background border-b border-separator">
                            <span class="font-black text-lg uppercase text-foreground-primary">{{ day.name }}</span>
                            <span class="font-mono text-xs text-foreground-text opacity-60">{{ day.focus }}</span>
                        </div>
                        <div class="p-4 space-y-3">
                            <div
                                v-for="(ex, exIdx) in day.exercises"
                                :key="exIdx"
                                class="flex items-center gap-3"
                            >
                                <span class="font-mono text-xs text-primary w-5 shrink-0">{{ exIdx + 1 }}</span>
                                <input
                                    v-model="day.exercises[exIdx].name"
                                    type="text"
                                    class="flex-1 bg-transparent border-b border-separator py-2 font-bold text-sm text-foreground-primary focus:outline-none focus:border-primary transition-colors placeholder:text-separator placeholder:font-normal"
                                    :placeholder="`Exercise ${exIdx + 1}`"
                                />
                                <span
                                    :class="['text-[10px] font-mono px-2 py-0.5 rounded shrink-0 border', ex.type === 'hold' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-blue-50 border-blue-200 text-blue-700']"
                                >{{ ex.type === 'hold' ? 'HOLD' : 'REPS' }}</span>
                                <span class="font-mono text-[10px] text-foreground-text opacity-50 shrink-0">{{ ex.setCount }}×</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                        <p class="font-mono text-xs text-yellow-800 leading-relaxed">
                            <strong>Catatan:</strong> Type (HOLD/REPS) dan jumlah set tidak bisa diubah di sini karena mempengaruhi cara data disimpan.
                            Hanya nama exercise yang bisa diubah.
                        </p>
                    </div>
                </div>

                <!-- Action buttons -->
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-8 pt-6 border-t border-separator">
                    <button
                        @click="resetToDefaults"
                        class="flex items-center gap-2 px-4 py-2 border border-separator text-foreground-text font-bold text-sm uppercase hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                        <RotateCcw class="w-4 h-4" />
                        Reset Tab Ini ke Default
                    </button>

                    <button
                        @click="saveProgram"
                        :disabled="savingProgram"
                        class="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold uppercase tracking-wider hover:bg-foreground-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Save v-if="!savingProgram" class="w-4 h-4" />
                        <Loader2 v-else class="w-4 h-4 animate-spin" />
                        {{ savingProgram ? 'Menyimpan...' : 'Simpan Program' }}
                    </button>
                </div>

                <!-- Save feedback -->
                <transition name="fade">
                    <div
                        v-if="saveMsg"
                        :class="['mt-4 p-3 rounded font-mono text-sm text-center font-bold border', saveMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600']"
                    >
                        {{ saveMsg.text }}
                    </div>
                </transition>
            </div>

            <!-- ── SECTION 2: DATA BACKUP ── -->
            <div class="p-8 md:p-12">
                <div class="flex items-center gap-3 mb-2">
                    <Download class="w-6 h-6 text-primary" />
                    <h2 class="text-2xl font-black uppercase tracking-tight">Data Backup</h2>
                </div>
                <p class="font-mono text-xs text-foreground-text opacity-60 mb-8">
                    Export semua data kamu (gym logs, calist logs, weigh-in) sebagai file JSON.
                    Simpan ini sebagai backup sebelum update atau migrasi server.
                </p>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="border-2 border-dashed border-separator rounded-xl p-6">
                        <Database class="w-8 h-8 text-primary mb-3" />
                        <h3 class="font-bold text-lg mb-1">Full JSON Backup</h3>
                        <p class="font-mono text-xs text-foreground-text opacity-60 mb-4">
                            Semua data: gym sessions, calist sessions, dan bulk entries dalam satu file JSON.
                        </p>
                        <button
                            @click="downloadBackup"
                            :disabled="downloadingBackup"
                            class="flex items-center gap-2 px-6 py-3 bg-foreground-primary text-white font-bold uppercase text-sm hover:bg-primary transition-colors disabled:opacity-60"
                        >
                            <Download v-if="!downloadingBackup" class="w-4 h-4" />
                            <Loader2 v-else class="w-4 h-4 animate-spin" />
                            {{ downloadingBackup ? 'Menyiapkan...' : 'Download Backup' }}
                        </button>
                    </div>

                    <div class="border-2 border-dashed border-separator rounded-xl p-6 bg-[#fcfbf7]">
                        <ShieldCheck class="w-8 h-8 text-primary mb-3" />
                        <h3 class="font-bold text-lg mb-1">Data Lo, Kontrol Lo</h3>
                        <p class="font-mono text-xs text-foreground-text opacity-60 leading-relaxed">
                            Tidak ada data yang dikirim ke server third-party.
                            Semua tersimpan di SQLite database di server kamu sendiri
                            di <code class="bg-white px-1 py-0.5 border border-separator rounded">/data/bodylog.db</code>.
                        </p>
                    </div>
                </div>

                <!-- Download success message -->
                <transition name="fade">
                    <div
                        v-if="backupMsg"
                        class="mt-4 p-3 rounded font-mono text-sm text-center font-bold border bg-green-50 border-green-200 text-green-700"
                    >
                        {{ backupMsg }}
                    </div>
                </transition>
            </div>
        </div>

        <div class="inner border-x border-separator h-12 bg-background border-b"></div>

        <!-- ─── RESET CONFIRM MODAL ─── -->
        <transition name="fade">
            <div
                v-if="showResetModal"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
                <div class="w-full max-w-sm bg-white border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center animate-bounce-in">
                    <div class="mx-auto w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center mb-6">
                        <RotateCcw class="w-8 h-8 text-red-500" />
                    </div>
                    <h3 class="text-2xl font-black uppercase mb-2">Reset Program?</h3>
                    <p class="font-mono text-sm mb-8 text-foreground-text leading-relaxed">
                        Tab <strong>{{ activeTab.toUpperCase() }}</strong> akan kembali ke program default bawaan.
                        Perubahan yang belum disimpan akan hilang.
                    </p>
                    <div class="flex flex-col gap-3">
                        <button
                            @click="confirmReset"
                            class="w-full py-3 bg-red-500 text-white font-bold uppercase hover:bg-red-600 transition-colors"
                        >
                            Ya, Reset
                        </button>
                        <button
                            @click="showResetModal = false"
                            class="w-full py-3 border-2 border-separator text-foreground-text font-bold uppercase hover:border-foreground-primary transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import {
    ListChecks,
    Dumbbell,
    Activity,
    RotateCcw,
    Save,
    Loader2,
    Download,
    Database,
    ShieldCheck,
} from "lucide-vue-next";

const { secureFetch, isAuthenticated, checkAuth } = useAuth();

// ─── Auth guard ───
onMounted(async () => {
    await checkAuth();
    if (!isAuthenticated.value) {
        navigateTo("/login");
        return;
    }
    await loadPrograms();
});

// ─── State ───
const activeTab = ref<'gym' | 'calist'>('gym');
const loadingProgram = ref(true);
const savingProgram = ref(false);
const downloadingBackup = ref(false);
const showResetModal = ref(false);
const saveMsg = ref<{ type: 'success' | 'error'; text: string } | null>(null);
const backupMsg = ref("");

// ─── GYM Default Templates ───
const GYM_DEFAULTS: Record<string, { name: string; focus: string; exercises: string[] }> = {
    monday:    { name: "SENIN",   focus: "Back Width",           exercises: ["Weighted Pull-Up / Lat Pulldown", "Lat Pulldown (Close Grip)", "Straight Arm Pulldown", "Rear Delt Fly", "Hanging Leg Raise"] },
    tuesday:   { name: "SELASA",  focus: "Push (Chest/Shoulders)", exercises: ["Barbell Bench Press", "Overhead Press", "Incline Dumbbell Press", "Lateral Raise", "Tricep Pushdown", "Tricep Overhead Extension"] },
    wednesday: { name: "RABU",    focus: "Legs",                 exercises: ["Leg Press / Squat", "Leg Curl", "Leg Extension", "Calf Raise", "Hanging Leg Raise"] },
    friday:    { name: "JUMAT",   focus: "Back Thickness",       exercises: ["Pull-Up", "T-Bar Row / Barbell Row", "Seated Cable Row (Wide)", "Straight Arm Pulldown", "Lateral Raise", "Hammer Curl"] },
    saturday:  { name: "SABTU",   focus: "Shoulders + Arms",     exercises: ["Lateral Raise", "Face Pull", "Barbell Curl", "Skull Crushers", "Hanging Knee Raise"] },
};

// ─── CALIST Default Templates ───
interface CalistExDef { name: string; type: 'reps' | 'hold'; setCount: number; }
const CALIST_DEFAULTS: Record<string, { name: string; focus: string; exercises: CalistExDef[] }> = {
    monday:    { name: "SENIN",  focus: "Pull — Back Width", exercises: [
        { name: "Scapular Pull-up", type: "reps", setCount: 3 },
        { name: "Wide Grip Pull-up", type: "reps", setCount: 4 },
        { name: "Band Face Pull", type: "reps", setCount: 3 },
        { name: "Hollow Body Hold", type: "hold", setCount: 3 },
    ]},
    wednesday: { name: "RABU",   focus: "Push + Planche Foundation", exercises: [
        { name: "Planche Lean", type: "hold", setCount: 4 },
        { name: "Push-up (Parallettes)", type: "reps", setCount: 4 },
        { name: "Pike Push-up", type: "reps", setCount: 3 },
        { name: "Band Lateral Raise", type: "reps", setCount: 4 },
    ]},
    friday:    { name: "JUMAT",  focus: "Pull 2 + Planche Skill", exercises: [
        { name: "Tuck Planche Hold", type: "hold", setCount: 4 },
        { name: "Chin-up", type: "reps", setCount: 4 },
        { name: "L-sit", type: "hold", setCount: 3 },
        { name: "Band Hammer Curl", type: "reps", setCount: 3 },
    ]},
    saturday:  { name: "SABTU",  focus: "Legs + Core", exercises: [
        { name: "Pistol Squat", type: "reps", setCount: 4 },
        { name: "Nordic Curl", type: "reps", setCount: 3 },
        { name: "Single Leg Calf Raise", type: "reps", setCount: 3 },
        { name: "Planche Lean", type: "hold", setCount: 3 },
    ]},
    sunday:    { name: "MINGGU", focus: "Shoulders + Arms + Wrist Rehab", exercises: [
        { name: "Pike Push-up (Feet Elevated)", type: "reps", setCount: 4 },
        { name: "Band Lateral Raise", type: "reps", setCount: 4 },
        { name: "Band Curl", type: "reps", setCount: 3 },
        { name: "Wrist Conditioning", type: "hold", setCount: 3 },
    ]},
};

// ─── Editor state (deep clones, so we can reset) ───
type GymEditorState = Record<string, { name: string; focus: string; exercises: string[] }>;
type CalistEditorState = Record<string, { name: string; focus: string; exercises: CalistExDef[] }>;

const gymEditor = ref<GymEditorState>(deepCloneGym());
const calistEditor = ref<CalistEditorState>(deepCloneCalist());

function deepCloneGym(): GymEditorState {
    return JSON.parse(JSON.stringify(GYM_DEFAULTS));
}
function deepCloneCalist(): CalistEditorState {
    return JSON.parse(JSON.stringify(CALIST_DEFAULTS));
}

// ─── Load custom programs from API and merge with defaults ───
async function loadPrograms() {
    loadingProgram.value = true;
    try {
        const [gymRes, calistRes] = await Promise.all([
            secureFetch('/api/program/get?mode=gym') as Promise<{ config: any }>,
            secureFetch('/api/program/get?mode=calist') as Promise<{ config: any }>,
        ]);

        // Merge custom gym into editor state
        if (gymRes.config) {
            const merged = deepCloneGym();
            for (const dayKey of Object.keys(merged)) {
                const custom = gymRes.config[dayKey];
                if (custom?.exercises) {
                    merged[dayKey].exercises = custom.exercises;
                }
            }
            gymEditor.value = merged;
        }

        // Merge custom calist into editor state (only names can change)
        if (calistRes.config) {
            const merged = deepCloneCalist();
            for (const dayKey of Object.keys(merged)) {
                const custom = calistRes.config[dayKey];
                if (custom?.exercises) {
                    custom.exercises.forEach((customEx: { name: string }, idx: number) => {
                        if (merged[dayKey].exercises[idx]) {
                            merged[dayKey].exercises[idx].name = customEx.name;
                        }
                    });
                }
            }
            calistEditor.value = merged;
        }
    } catch (error) {
        console.error("Failed to load programs:", error);
    } finally {
        loadingProgram.value = false;
    }
}

// ─── Save program ───
async function saveProgram() {
    savingProgram.value = true;
    saveMsg.value = null;

    try {
        if (activeTab.value === 'gym') {
            // Save only exercise arrays (names), not the full template structure
            const config: Record<string, { exercises: string[] }> = {};
            for (const [day, data] of Object.entries(gymEditor.value)) {
                config[day] = { exercises: data.exercises };
            }
            await secureFetch('/api/program/save', { method: 'POST', body: { mode: 'gym', config } });
        } else {
            // Save only names (type and setCount preserved from defaults)
            const config: Record<string, { exercises: { name: string }[] }> = {};
            for (const [day, data] of Object.entries(calistEditor.value)) {
                config[day] = { exercises: data.exercises.map(ex => ({ name: ex.name })) };
            }
            await secureFetch('/api/program/save', { method: 'POST', body: { mode: 'calist', config } });
        }

        saveMsg.value = { type: 'success', text: `Program ${activeTab.value.toUpperCase()} berhasil disimpan! Refresh halaman log untuk melihat perubahan.` };
        setTimeout(() => { saveMsg.value = null; }, 4000);
    } catch (error: any) {
        saveMsg.value = { type: 'error', text: error.message || 'Gagal menyimpan.' };
    } finally {
        savingProgram.value = false;
    }
}

// ─── Reset to defaults ───
function resetToDefaults() {
    showResetModal.value = true;
}

function confirmReset() {
    if (activeTab.value === 'gym') {
        gymEditor.value = deepCloneGym();
    } else {
        calistEditor.value = deepCloneCalist();
    }
    showResetModal.value = false;
    saveMsg.value = { type: 'success', text: 'Reset ke default. Klik "Simpan Program" untuk menyimpan perubahan ini.' };
    setTimeout(() => { saveMsg.value = null; }, 5000);
}

// ─── Download backup ───
async function downloadBackup() {
    downloadingBackup.value = true;
    backupMsg.value = "";

    try {
        const data = await secureFetch('/api/export/all') as any;
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        link.setAttribute('href', url);
        link.setAttribute('download', `bodylog_backup_${date}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        backupMsg.value = "Backup berhasil didownload!";
        setTimeout(() => { backupMsg.value = ""; }, 3000);
    } catch (error: any) {
        backupMsg.value = "Gagal download backup: " + (error.message || "Unknown error");
    } finally {
        downloadingBackup.value = false;
    }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes bounceIn {
    0% { transform: scale(0.9); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in { animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>
