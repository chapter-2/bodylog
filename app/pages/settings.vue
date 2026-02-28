<template>
    <div class="min-h-screen bg-background pb-20">
        <div class="inner py-10 md:py-16">

            <!-- ─── HEADER ─── -->
            <div class="mb-12 border-b-2 border-foreground-primary pb-6">
                <span class="font-handwriting text-xl text-primary mb-1 block">Instance Management</span>
                <h1 class="text-4xl md:text-6xl font-black uppercase text-foreground-primary tracking-tighter">
                    Settings
                </h1>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                <!-- ─── LEFT SIDEBAR ─── -->
                <div class="space-y-6">

                    <!-- Security -->
                    <div class="bg-white border-2 border-separator p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="font-black uppercase text-lg mb-5 flex items-center gap-2 pb-3 border-b border-separator">
                            <Lock class="w-4 h-4 text-primary" />
                            Security
                        </h2>

                        <form @submit.prevent="changePassword" class="space-y-4">
                            <div class="group">
                                <label class="block font-mono text-[10px] uppercase tracking-widest text-foreground-text mb-1">
                                    Current Password
                                </label>
                                <input v-model="passForm.old" type="password" class="input-pow py-2 text-sm" placeholder="••••••••" required />
                            </div>
                            <div class="group">
                                <label class="block font-mono text-[10px] uppercase tracking-widest text-foreground-text mb-1">
                                    New Password
                                </label>
                                <input v-model="passForm.new" type="password" class="input-pow py-2 text-sm" placeholder="••••••••" required />
                            </div>

                            <div v-if="passMsg" :class="passStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="text-xs font-bold border p-2 rounded">
                                {{ passMsg }}
                            </div>

                            <button type="submit" :disabled="isChangingPass" class="w-full py-2 bg-foreground-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-50">
                                {{ isChangingPass ? 'Updating...' : 'Update Password' }}
                            </button>
                        </form>
                    </div>

                    <!-- Data Backup -->
                    <div class="bg-white border-2 border-separator p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="font-black uppercase text-lg mb-5 flex items-center gap-2 pb-3 border-b border-separator">
                            <DatabaseBackup class="w-4 h-4 text-primary" />
                            Data
                        </h2>
                        <p class="font-mono text-xs text-foreground-text mb-4 leading-relaxed">
                            Export semua data (gym, calist, bulk) sebagai JSON untuk backup atau migrasi.
                        </p>
                        <button @click="downloadBackup" :disabled="isDownloading" class="w-full py-3 border-2 border-separator text-foreground-primary font-bold text-xs uppercase tracking-wider hover:bg-[#fcfbf7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            <Download class="w-4 h-4" />
                            {{ isDownloading ? 'Exporting...' : 'Download JSON Backup' }}
                        </button>
                    </div>

                </div>

                <!-- ─── RIGHT: PROGRAM EDITOR ─── -->
                <div class="md:col-span-2 space-y-6">

                    <!-- Program Start Dates — GAP-02 FIX -->
                    <div class="bg-white border-2 border-separator p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="font-black uppercase text-xl mb-2 flex items-center gap-2">
                            <CalendarDays class="w-5 h-5 text-primary" />
                            Program Start Dates
                        </h2>
                        <p class="font-mono text-xs text-foreground-text mb-6 leading-relaxed">
                            Week number dihitung otomatis dari tanggal ini. Set ke hari pertama kamu mulai program.
                            <span class="text-primary font-bold">Jangan ganti kalau sudah mulai</span> — week history akan bergeser.
                        </p>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Gym Start Date -->
                            <div>
                                <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">
                                    🏋️ Gym Program Start
                                </label>
                                <input
                                    v-model="gymStartDate"
                                    type="date"
                                    class="w-full bg-transparent border-b-2 border-separator py-2 font-mono text-base text-foreground-primary outline-none focus:border-primary transition-colors"
                                />
                                <div v-if="gymStartSaved" class="mt-1 text-xs text-green-600 font-bold">✓ Saved</div>
                            </div>

                            <!-- Calist Start Date -->
                            <div>
                                <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">
                                    🤸 Calist Program Start
                                </label>
                                <input
                                    v-model="calistStartDate"
                                    type="date"
                                    class="w-full bg-transparent border-b-2 border-separator py-2 font-mono text-base text-foreground-primary outline-none focus:border-primary transition-colors"
                                />
                                <div v-if="calistStartSaved" class="mt-1 text-xs text-green-600 font-bold">✓ Saved</div>
                            </div>
                        </div>

                        <button
                            @click="saveStartDates"
                            :disabled="isSavingDates"
                            class="mt-6 w-full py-3 bg-foreground-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save class="w-4 h-4" />
                            {{ isSavingDates ? 'Saving...' : 'Save Start Dates' }}
                        </button>

                        <div v-if="dateMsg" :class="dateStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="mt-3 text-xs font-bold border p-2 rounded">
                            {{ dateMsg }}
                        </div>
                    </div>

                    <!-- Program Editor — rename exercises per day -->
                    <div class="bg-white border-2 border-separator p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="font-black uppercase text-xl mb-2 flex items-center gap-2">
                            <Pencil class="w-5 h-5 text-primary" />
                            Program Editor
                        </h2>
                        <p class="font-mono text-xs text-foreground-text mb-6 leading-relaxed">
                            Rename exercise per hari sesuai alat atau nama yang kamu pakai.
                            Struktur program (hari, jumlah set) tidak berubah — hanya nama.
                        </p>

                        <!-- Mode Tabs -->
                        <div class="flex border-b-2 border-separator mb-6">
                            <button
                                v-for="tab in ['gym', 'calist']"
                                :key="tab"
                                @click="activeTab = tab"
                                :class="[
                                    'px-6 py-3 font-bold uppercase text-sm tracking-widest transition-colors border-b-2 -mb-[2px]',
                                    activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-foreground-text hover:text-foreground-primary',
                                ]"
                            >
                                {{ tab === 'gym' ? '🏋️ Gym' : '🤸 Calist' }}
                            </button>
                        </div>

                        <!-- Loading state -->
                        <div v-if="isLoadingProgram" class="space-y-4 py-4">
                            <div v-for="i in 3" :key="i" class="h-24 bg-separator/30 animate-pulse rounded"></div>
                        </div>

                        <!-- GYM EDITOR -->
                        <div v-else-if="activeTab === 'gym'" class="space-y-6">
                            <div
                                v-for="(day, dayKey) in gymProgram"
                                :key="dayKey"
                                class="border border-separator rounded-xl overflow-hidden"
                            >
                                <div class="px-5 py-3 bg-[#fcfbf7] border-b border-separator flex items-center justify-between">
                                    <div>
                                        <span class="font-black uppercase text-sm text-foreground-primary">{{ day.label }}</span>
                                        <span class="font-mono text-xs text-foreground-text ml-3 opacity-60">{{ day.focus }}</span>
                                    </div>
                                    <span class="font-mono text-[10px] text-foreground-text opacity-40 uppercase tracking-widest">
                                        {{ day.exercises.length }} exercises
                                    </span>
                                </div>

                                <div class="divide-y divide-separator">
                                    <div v-for="(ex, exIdx) in day.exercises" :key="exIdx" class="flex items-center gap-3 px-5 py-3 hover:bg-[#fcfbf7] transition-colors">
                                        <span class="font-mono text-xs text-primary w-6 shrink-0 font-bold">{{ exIdx + 1 }}</span>
                                        <input
                                            v-model="day.exercises[exIdx]"
                                            type="text"
                                            class="flex-1 bg-transparent border-b border-separator py-1 text-sm font-bold text-foreground-primary focus:outline-none focus:border-primary transition-colors placeholder:text-separator"
                                            :placeholder="gymDefaults[dayKey]?.exercises[exIdx] || 'Exercise name'"
                                        />
                                        <button
                                            v-if="day.exercises[exIdx] !== (gymDefaults[dayKey]?.exercises[exIdx] || '')"
                                            @click="day.exercises[exIdx] = gymDefaults[dayKey]?.exercises[exIdx] || ''"
                                            class="text-xs font-mono text-foreground-text/40 hover:text-red-500 transition-colors shrink-0"
                                            title="Reset ke default"
                                        >
                                            ↺
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <button @click="saveGymProgram" :disabled="isSavingGym" class="flex-1 py-3 bg-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-foreground-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Save class="w-4 h-4" />
                                    {{ isSavingGym ? 'Saving...' : 'Save Gym Program' }}
                                </button>
                                <button @click="resetGymProgram" class="px-4 py-3 border-2 border-separator text-foreground-text font-bold text-xs uppercase hover:border-red-300 hover:text-red-500 transition-colors">
                                    Reset All
                                </button>
                            </div>

                            <div v-if="gymMsg" :class="gymMsgStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="text-xs font-bold border p-2 rounded">
                                {{ gymMsg }}
                            </div>
                        </div>

                        <!-- CALIST EDITOR -->
                        <div v-else class="space-y-6">
                            <div
                                v-for="(day, dayKey) in calistProgram"
                                :key="dayKey"
                                class="border border-separator rounded-xl overflow-hidden"
                            >
                                <div class="px-5 py-3 bg-[#fcfbf7] border-b border-separator flex items-center justify-between">
                                    <div>
                                        <span class="font-black uppercase text-sm text-foreground-primary">{{ day.label }}</span>
                                        <span class="font-mono text-xs text-foreground-text ml-3 opacity-60">{{ day.focus }}</span>
                                    </div>
                                    <span class="font-mono text-[10px] text-foreground-text opacity-40 uppercase tracking-widest">
                                        {{ day.exercises.length }} exercises
                                    </span>
                                </div>

                                <div class="divide-y divide-separator">
                                    <div v-for="(ex, exIdx) in day.exercises" :key="exIdx" class="flex items-center gap-3 px-5 py-3 hover:bg-[#fcfbf7] transition-colors">
                                        <span class="font-mono text-xs text-primary w-6 shrink-0 font-bold">{{ exIdx + 1 }}</span>
                                        <input
                                            v-model="day.exercises[exIdx].name"
                                            type="text"
                                            class="flex-1 bg-transparent border-b border-separator py-1 text-sm font-bold text-foreground-primary focus:outline-none focus:border-primary transition-colors placeholder:text-separator"
                                            :placeholder="calistDefaults[dayKey]?.exercises[exIdx]?.name || 'Exercise name'"
                                        />
                                        <span
                                            :class="ex.type === 'hold' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-blue-50 border-blue-200 text-blue-600'"
                                            class="text-[10px] font-mono font-bold border px-2 py-0.5 rounded shrink-0"
                                        >
                                            {{ ex.type === 'hold' ? 'HOLD' : 'REPS' }}
                                        </span>
                                        <button
                                            v-if="ex.name !== (calistDefaults[dayKey]?.exercises[exIdx]?.name || '')"
                                            @click="day.exercises[exIdx].name = calistDefaults[dayKey]?.exercises[exIdx]?.name || ''"
                                            class="text-xs font-mono text-foreground-text/40 hover:text-red-500 transition-colors shrink-0"
                                            title="Reset ke default"
                                        >
                                            ↺
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <button @click="saveCalistProgram" :disabled="isSavingCalist" class="flex-1 py-3 bg-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-foreground-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Save class="w-4 h-4" />
                                    {{ isSavingCalist ? 'Saving...' : 'Save Calist Program' }}
                                </button>
                                <button @click="resetCalistProgram" class="px-4 py-3 border-2 border-separator text-foreground-text font-bold text-xs uppercase hover:border-red-300 hover:text-red-500 transition-colors">
                                    Reset All
                                </button>
                            </div>

                            <div v-if="calistMsg" :class="calistMsgStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="text-xs font-bold border p-2 rounded">
                                {{ calistMsg }}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Lock, DatabaseBackup, Download, CalendarDays, Save, Pencil } from "lucide-vue-next";

const { secureFetch, isAuthenticated, checkAuth } = useAuth();

// ─── Auth guard ───
onMounted(async () => {
    await checkAuth();
    if (!isAuthenticated.value) navigateTo('/login');
    await loadAllSettings();
});

// ─── Security: Change Password (GAP-01 FIX) ───
const passForm = ref({ old: '', new: '' });
const isChangingPass = ref(false);
const passMsg = ref('');
const passStatus = ref<'error' | 'success'>('success');

async function changePassword() {
    isChangingPass.value = true;
    passMsg.value = '';
    try {
        await secureFetch('/api/auth/password', {
            method: 'POST',
            body: { oldPassword: passForm.value.old, newPassword: passForm.value.new },
        });
        passStatus.value = 'success';
        passMsg.value = '✓ Password updated successfully.';
        passForm.value = { old: '', new: '' };
    } catch (e: any) {
        passStatus.value = 'error';
        passMsg.value = e.data?.message || 'Failed to update password.';
    } finally {
        isChangingPass.value = false;
    }
}

// ─── Data: Backup ───
const isDownloading = ref(false);

async function downloadBackup() {
    isDownloading.value = true;
    try {
        const res = await secureFetch('/api/export/all');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
        const el = document.createElement('a');
        el.setAttribute("href", dataStr);
        el.setAttribute("download", `bodylog_backup_${new Date().toISOString().split('T')[0]}.json`);
        el.click();
    } catch {
        alert("Failed to download backup.");
    } finally {
        isDownloading.value = false;
    }
}

// ─── Start Dates (GAP-02 FIX) ───
const gymStartDate = ref('');
const calistStartDate = ref('');
const isSavingDates = ref(false);
const gymStartSaved = ref(false);
const calistStartSaved = ref(false);
const dateMsg = ref('');
const dateStatus = ref<'error' | 'success'>('success');

async function saveStartDates() {
    if (!gymStartDate.value && !calistStartDate.value) {
        dateStatus.value = 'error';
        dateMsg.value = 'Enter at least one date.';
        return;
    }
    isSavingDates.value = true;
    dateMsg.value = '';
    gymStartSaved.value = false;
    calistStartSaved.value = false;
    try {
        const promises = [];
        if (gymStartDate.value) {
            promises.push(
                secureFetch('/api/program/start-date', {
                    method: 'POST',
                    body: { mode: 'gym', date: gymStartDate.value },
                }).then(() => { gymStartSaved.value = true; })
            );
        }
        if (calistStartDate.value) {
            promises.push(
                secureFetch('/api/program/start-date', {
                    method: 'POST',
                    body: { mode: 'calist', date: calistStartDate.value },
                }).then(() => { calistStartSaved.value = true; })
            );
        }
        await Promise.all(promises);
        dateStatus.value = 'success';
        dateMsg.value = '✓ Start dates saved. Week numbers will update on next page refresh.';
    } catch (e: any) {
        dateStatus.value = 'error';
        dateMsg.value = e.data?.message || 'Failed to save start dates.';
    } finally {
        isSavingDates.value = false;
    }
}

// ─── Program Editor ───
const activeTab = ref<'gym' | 'calist'>('gym');
const isLoadingProgram = ref(false);

// ── GYM DEFAULTS (source of truth for placeholder text and reset) ──
const gymDefaults: Record<string, { label: string; focus: string; exercises: string[] }> = {
    monday:    { label: "SENIN",  focus: "Back Width",          exercises: ["Weighted Pull-Up / Lat Pulldown", "Lat Pulldown (Close Grip)", "Straight Arm Pulldown", "Rear Delt Fly", "Hanging Leg Raise"] },
    tuesday:   { label: "SELASA", focus: "Push (Chest/Shoulder)", exercises: ["Barbell Bench Press", "Overhead Press", "Incline Dumbbell Press", "Lateral Raise", "Tricep Pushdown", "Tricep Overhead Extension"] },
    wednesday: { label: "RABU",   focus: "Legs",                exercises: ["Leg Press / Squat", "Leg Curl", "Leg Extension", "Calf Raise", "Hanging Leg Raise"] },
    friday:    { label: "JUMAT",  focus: "Back Thickness",      exercises: ["Pull-Up", "T-Bar Row / Barbell Row", "Seated Cable Row (Wide)", "Straight Arm Pulldown", "Lateral Raise", "Hammer Curl"] },
    saturday:  { label: "SABTU",  focus: "Shoulders + Arms",    exercises: ["Lateral Raise", "Face Pull", "Barbell Curl", "Skull Crushers", "Hanging Knee Raise"] },
};

// ── CALIST DEFAULTS ──
const calistDefaults: Record<string, { label: string; focus: string; exercises: { name: string; type: 'reps' | 'hold' }[] }> = {
    monday:    { label: "SENIN",  focus: "Pull — Back Width",       exercises: [{ name: "Scapular Pull-up", type: "reps" }, { name: "Wide Grip Pull-up", type: "reps" }, { name: "Band Face Pull", type: "reps" }, { name: "Hollow Body Hold", type: "hold" }] },
    wednesday: { label: "RABU",   focus: "Push + Planche Foundation", exercises: [{ name: "Planche Lean", type: "hold" }, { name: "Push-up (Parallettes)", type: "reps" }, { name: "Pike Push-up", type: "reps" }, { name: "Band Lateral Raise", type: "reps" }] },
    friday:    { label: "JUMAT",  focus: "Pull 2 + Planche Skill",  exercises: [{ name: "Tuck Planche Hold", type: "hold" }, { name: "Chin-up", type: "reps" }, { name: "L-sit", type: "hold" }, { name: "Band Hammer Curl", type: "reps" }] },
    saturday:  { label: "SABTU",  focus: "Legs + Core",             exercises: [{ name: "Pistol Squat", type: "reps" }, { name: "Nordic Curl", type: "reps" }, { name: "Single Leg Calf Raise", type: "reps" }, { name: "Planche Lean", type: "hold" }] },
    sunday:    { label: "MINGGU", focus: "Shoulders + Arms + Wrist", exercises: [{ name: "Pike Push-up (Feet Elevated)", type: "reps" }, { name: "Band Lateral Raise", type: "reps" }, { name: "Band Curl", type: "reps" }, { name: "Wrist Conditioning", type: "hold" }] },
};

// ── Reactive program state (editable copies) ──
type GymProgramState = Record<string, { label: string; focus: string; exercises: string[] }>;
type CalistProgramState = Record<string, { label: string; focus: string; exercises: { name: string; type: 'reps' | 'hold' }[] }>;

const gymProgram = ref<GymProgramState>({});
const calistProgram = ref<CalistProgramState>({});

// GYM save/reset
const isSavingGym = ref(false);
const gymMsg = ref('');
const gymMsgStatus = ref<'error' | 'success'>('success');

async function saveGymProgram() {
    isSavingGym.value = true;
    gymMsg.value = '';
    try {
        // Convert to format that GymWorkoutForm expects: { [day]: { exercises: string[] } }
        const config: Record<string, { exercises: string[] }> = {};
        for (const [day, data] of Object.entries(gymProgram.value)) {
            config[day] = { exercises: data.exercises };
        }
        await secureFetch('/api/program/save', {
            method: 'POST',
            body: { mode: 'gym', config },
        });
        gymMsgStatus.value = 'success';
        gymMsg.value = '✓ Gym program saved. Refresh log page to see changes.';
    } catch (e: any) {
        gymMsgStatus.value = 'error';
        gymMsg.value = e.data?.message || 'Failed to save gym program.';
    } finally {
        isSavingGym.value = false;
    }
}

function resetGymProgram() {
    for (const [day, data] of Object.entries(gymDefaults)) {
        gymProgram.value[day].exercises = [...data.exercises];
    }
    gymMsg.value = '';
}

// CALIST save/reset
const isSavingCalist = ref(false);
const calistMsg = ref('');
const calistMsgStatus = ref<'error' | 'success'>('success');

async function saveCalistProgram() {
    isSavingCalist.value = true;
    calistMsg.value = '';
    try {
        // Convert to format that CalistWorkoutForm expects: { [day]: { exercises: { name: string }[] } }
        const config: Record<string, { exercises: { name: string }[] }> = {};
        for (const [day, data] of Object.entries(calistProgram.value)) {
            config[day] = { exercises: data.exercises.map(ex => ({ name: ex.name })) };
        }
        await secureFetch('/api/program/save', {
            method: 'POST',
            body: { mode: 'calist', config },
        });
        calistMsgStatus.value = 'success';
        calistMsg.value = '✓ Calist program saved. Refresh log page to see changes.';
    } catch (e: any) {
        calistMsgStatus.value = 'error';
        calistMsg.value = e.data?.message || 'Failed to save calist program.';
    } finally {
        isSavingCalist.value = false;
    }
}

function resetCalistProgram() {
    for (const [day, data] of Object.entries(calistDefaults)) {
        calistProgram.value[day].exercises = data.exercises.map(ex => ({ ...ex }));
    }
    calistMsg.value = '';
}

// ─── Load all settings on mount ───
async function loadAllSettings() {
    isLoadingProgram.value = true;

    // Initialize with defaults first
    for (const [day, data] of Object.entries(gymDefaults)) {
        gymProgram.value[day] = { ...data, exercises: [...data.exercises] };
    }
    for (const [day, data] of Object.entries(calistDefaults)) {
        calistProgram.value[day] = { ...data, exercises: data.exercises.map(ex => ({ ...ex })) };
    }

    try {
        // Load gym config + start date
        const gymRes = await secureFetch('/api/program/get?mode=gym').catch(() => ({})) as any;
        if (gymRes?.config) {
            for (const [day, dayData] of Object.entries(gymRes.config as Record<string, { exercises: string[] }>)) {
                if (gymProgram.value[day] && dayData.exercises?.length > 0) {
                    gymProgram.value[day].exercises = [...dayData.exercises];
                }
            }
        }
        if (gymRes?.start_date) {
            gymStartDate.value = gymRes.start_date;
        }

        // Load calist config + start date
        const calistRes = await secureFetch('/api/program/get?mode=calist').catch(() => ({})) as any;
        if (calistRes?.config) {
            for (const [day, dayData] of Object.entries(calistRes.config as Record<string, { exercises: { name: string }[] }>)) {
                if (calistProgram.value[day] && dayData.exercises?.length > 0) {
                    dayData.exercises.forEach((ex, idx) => {
                        if (calistProgram.value[day]?.exercises[idx]) {
                            calistProgram.value[day].exercises[idx].name = ex.name;
                        }
                    });
                }
            }
        }
        if (calistRes?.start_date) {
            calistStartDate.value = calistRes.start_date;
        }
    } catch (e) {
        console.error("Failed to load settings:", e);
    } finally {
        isLoadingProgram.value = false;
    }
}
</script>
