<template>
    <div class="min-h-screen bg-background pb-20">
        <div class="inner py-10 md:py-16">

            <div class="mb-12 border-b-2 border-foreground-primary pb-6 text-center md:text-left">
                <span class="font-handwriting text-xl text-primary mb-1 block">Instance Management</span>
                <h1 class="text-4xl md:text-6xl font-black uppercase text-foreground-primary tracking-tighter">
                    Settings
                </h1>
            </div>

            <div class="max-w-5xl mx-auto space-y-16">

                <section>
                    <div class="flex items-center gap-3 mb-6 border-b-2 border-separator pb-2">
                        <UserIcon class="w-6 h-6 text-primary" />
                        <h2 class="text-2xl font-black uppercase tracking-widest text-foreground-primary">Account & Security</h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                        <div class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center h-full">
                            <div class="w-20 h-20 bg-primary flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_#27272a] mb-5">
                                <UserIcon class="w-10 h-10 text-white" />
                            </div>
                            <h3 class="text-3xl font-black uppercase tracking-tight text-foreground-primary">
                                {{ user?.username || 'Loading...' }}
                            </h3>
                            <p v-if="user?.created_at" class="font-mono text-xs text-foreground-text mt-4 uppercase tracking-widest border-t border-separator pt-4 w-full">
                                Claimed: <span class="text-primary font-bold">{{ new Date(user.created_at).toLocaleDateString('id-ID') }}</span>
                            </p>
                        </div>

                        <div class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
                            <h3 class="font-black uppercase text-lg mb-6 flex items-center gap-2">
                                <Lock class="w-4 h-4 text-primary" /> Change Password
                            </h3>
                            <form @submit.prevent="changePassword" class="space-y-5 flex-1 flex flex-col">
                                <div class="group">
                                    <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">Current Password</label>
                                    <input v-model="passForm.old" type="password" class="input-pow py-2 w-full text-base font-mono" placeholder="••••••••" required />
                                </div>
                                <div class="group">
                                    <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">New Password</label>
                                    <input v-model="passForm.new" type="password" class="input-pow py-2 w-full text-base font-mono" placeholder="••••••••" required />
                                </div>
                                <div class="mt-auto pt-4">
                                    <div v-if="passMsg" :class="passStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="text-sm font-bold border p-3 rounded mb-3 text-center">
                                        {{ passMsg }}
                                    </div>
                                    <button type="submit" :disabled="isChangingPass" class="w-full py-3 bg-foreground-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-50">
                                        {{ isChangingPass ? 'Updating...' : 'Update Password' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="flex items-center gap-3 mb-6 border-b-2 border-separator pb-2">
                        <CalendarDays class="w-6 h-6 text-primary" />
                        <h2 class="text-2xl font-black uppercase tracking-widest text-foreground-primary">Protocol Configuration</h2>
                    </div>

                    <div class="grid grid-cols-1 gap-8">
                        <div class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <h3 class="font-black uppercase text-lg mb-2">Program Start Dates</h3>
                            <p class="font-mono text-xs text-foreground-text mb-6 leading-relaxed max-w-2xl">
                                Week number dihitung otomatis dari tanggal ini. <span class="text-primary font-bold">Jangan diubah jika program latihanmu sudah berjalan.</span>
                            </p>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">🏋️ Gym Program Start</label>
                                    <input v-model="gymStartDate" type="date" class="w-full bg-transparent border-b-2 border-separator py-2 font-mono text-lg text-foreground-primary outline-none focus:border-primary transition-colors" />
                                </div>
                                <div>
                                    <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">🤸 Calist Program Start</label>
                                    <input v-model="calistStartDate" type="date" class="w-full bg-transparent border-b-2 border-separator py-2 font-mono text-lg text-foreground-primary outline-none focus:border-primary transition-colors" />
                                </div>
                            </div>

                            <button @click="saveStartDates" :disabled="isSavingDates" class="mt-8 w-full py-4 border-2 border-foreground-primary text-foreground-primary font-bold text-sm uppercase tracking-wider hover:bg-foreground-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save class="w-4 h-4" />
                                {{ isSavingDates ? 'Saving Dates...' : 'Save Start Dates' }}
                            </button>
                            <div v-if="dateMsg" :class="dateStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="mt-4 text-sm font-bold border p-3 rounded text-center">
                                {{ dateMsg }}
                            </div>
                        </div>

                        <div class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <h3 class="font-black uppercase text-lg mb-2">Weekly Schedule Manager</h3>
                            <p class="font-mono text-sm text-foreground-text mb-6 leading-relaxed">
                                Atur hari latihan dan hari libur secara global. Ubah nama hari dan fokus otot di sini. Data latihan di Program Editor tidak akan hilang meskipun hari tersebut dimatikan.
                            </p>

                            <div class="flex gap-2 mb-6 border-b-2 border-separator pb-4">
                                <button @click="scheduleMode = 'gym'" :class="scheduleMode === 'gym' ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 border-primary' : 'bg-[#fcfbf7] text-foreground-primary border-separator hover:bg-gray-100'" class="px-6 py-2 border-2 font-bold uppercase text-sm transition-all tracking-widest">🏋️ Gym</button>
                                <button @click="scheduleMode = 'calist'" :class="scheduleMode === 'calist' ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 border-primary' : 'bg-[#fcfbf7] text-foreground-primary border-separator hover:bg-gray-100'" class="px-6 py-2 border-2 font-bold uppercase text-sm transition-all tracking-widest">🤸 Calist</button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div v-for="day in ALL_DAYS" :key="day" 
                                     class="border-2 p-5 transition-all relative overflow-hidden"
                                     :class="schedule[scheduleMode][day].isRest ? 'border-separator bg-gray-100 opacity-70' : 'border-foreground-primary bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'">
                                    
                                    <div class="flex justify-between items-center mb-5">
                                        <h4 class="font-black uppercase tracking-widest" :class="schedule[scheduleMode][day].isRest ? 'text-separator' : 'text-primary'">{{ day }}</h4>
                                        
                                        <label class="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" v-model="schedule[scheduleMode][day].isRest" class="sr-only peer" :true-value="false" :false-value="true">
                                            <div class="w-12 h-6 bg-gray-300 border-2 border-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary shadow-inner"></div>
                                        </label>
                                    </div>

                                    <div v-if="!schedule[scheduleMode][day].isRest" class="space-y-4">
                                        <div>
                                            <label class="block font-mono text-[10px] uppercase text-foreground-text opacity-70 mb-1">Session Title</label>
                                            <input v-model="schedule[scheduleMode][day].name" type="text" placeholder="e.g. SENIN / PUSH" class="w-full text-sm font-bold border-b-2 border-separator py-1 focus:border-primary outline-none bg-transparent uppercase transition-colors" />
                                        </div>
                                        <div>
                                            <label class="block font-mono text-[10px] uppercase text-foreground-text opacity-70 mb-1">Muscle Focus</label>
                                            <input v-model="schedule[scheduleMode][day].focus" type="text" placeholder="e.g. Chest & Triceps" class="w-full text-xs font-mono border-b-2 border-separator py-1 focus:border-primary outline-none bg-transparent transition-colors" />
                                        </div>
                                    </div>
                                    <div v-else class="py-6 text-center">
                                        <span class="font-mono text-xs font-bold text-foreground-text uppercase tracking-widest opacity-60 flex items-center justify-center gap-2">
                                            <span>💤 REST DAY</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button @click="saveSchedule" :disabled="isSavingSchedule" class="mt-8 w-full py-4 bg-primary text-white font-black text-sm uppercase tracking-wider hover:bg-foreground-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-1">
                                <Save class="w-5 h-5" />
                                {{ isSavingSchedule ? 'Saving Configuration...' : 'Save Global Schedule' }}
                            </button>
                            <div v-if="schedMsg" :class="schedStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="mt-4 text-sm font-bold border p-3 rounded text-center">
                                {{ schedMsg }}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="flex items-center gap-3 mb-6 border-b-2 border-separator pb-2">
                        <DatabaseBackup class="w-6 h-6 text-primary" />
                        <h2 class="text-2xl font-black uppercase tracking-widest text-foreground-primary">System & Data</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="bg-[#fcfbf7] border-2 border-separator p-8 flex flex-col justify-between hover:border-primary transition-colors group">
                            <div>
                                <h3 class="font-black uppercase text-lg mb-2">Data Export</h3>
                                <p class="font-mono text-sm text-foreground-text mb-6 leading-relaxed">
                                    Unduh seluruh history latihan dan berat badanmu (JSON format) untuk keperluan backup atau migrasi server.
                                </p>
                            </div>
                            <button @click="downloadBackup" :disabled="isDownloading" class="w-full py-3 bg-white border-2 border-foreground-primary text-foreground-primary font-bold text-sm uppercase tracking-wider hover:bg-foreground-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Download class="w-4 h-4" />
                                {{ isDownloading ? 'Exporting...' : 'Download JSON' }}
                            </button>
                        </div>

                        <div class="bg-[#fcfbf7] border-2 border-separator p-8 flex flex-col justify-between hover:border-primary transition-colors group">
                            <div>
                                <h3 class="font-black uppercase text-lg mb-2">Tutorial Preferences</h3>
                                <p class="font-mono text-sm text-foreground-text mb-6 leading-relaxed">
                                    Lupa cara menggunakan aplikasi ini? Tekan tombol di bawah untuk mengaktifkan ulang Onboarding Tour.
                                </p>
                            </div>
                            <button @click="handleResetTour" class="w-full py-3 bg-white border-2 border-foreground-primary text-foreground-primary font-bold text-sm uppercase tracking-wider hover:bg-foreground-primary hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <RefreshCw class="w-4 h-4" />
                                Replay Tour
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User as UserIcon, Download, Lock, DatabaseBackup, CalendarDays, Save, RefreshCw } from "lucide-vue-next";

const { secureFetch, isAuthenticated, checkAuth, user } = useAuth();
const { resetTour } = useMode();

function handleResetTour() {
    resetTour();
    navigateTo('/'); 
}

onMounted(async () => {
    await checkAuth();
    if (!isAuthenticated.value) navigateTo('/login');
    await loadSettings();
});

// ─── Security: Change Password ───
const passForm = ref({ old: '', new: '' });
const isChangingPass = ref(false);
const passMsg = ref('');
const passStatus = ref<'error' | 'success'>('success');

async function changePassword() {
    isChangingPass.value = true;
    passMsg.value = '';
    try {
        await secureFetch('/api/auth/password', { method: 'POST', body: { oldPassword: passForm.value.old, newPassword: passForm.value.new } });
        passStatus.value = 'success'; passMsg.value = '✓ Password updated successfully.'; passForm.value = { old: '', new: '' };
    } catch (e: any) {
        passStatus.value = 'error'; passMsg.value = e.data?.message || 'Failed to update password.';
    } finally { isChangingPass.value = false; }
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
    } catch { alert("Failed to download backup."); } finally { isDownloading.value = false; }
}

// ─── Start Dates ───
const gymStartDate = ref(''); const calistStartDate = ref('');
const isSavingDates = ref(false); const dateMsg = ref(''); const dateStatus = ref<'error' | 'success'>('success');

async function saveStartDates() {
    isSavingDates.value = true; dateMsg.value = '';
    try {
        const promises = [];
        if (gymStartDate.value) promises.push(secureFetch('/api/program/start-date', { method: 'POST', body: { mode: 'gym', date: gymStartDate.value } }));
        if (calistStartDate.value) promises.push(secureFetch('/api/program/start-date', { method: 'POST', body: { mode: 'calist', date: calistStartDate.value } }));
        await Promise.all(promises);
        dateStatus.value = 'success'; dateMsg.value = '✓ Start dates saved successfully.';
    } catch (e: any) {
        dateStatus.value = 'error'; dateMsg.value = e.data?.message || 'Failed to save start dates.';
    } finally { isSavingDates.value = false; }
}

// ─── WEEKLY SCHEDULE MANAGER ───
const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const scheduleMode = ref<'gym' | 'calist'>('gym');

const defaultSchedule = {
    gym: {
        monday:    { name: "FULL BODY A", focus: "Squat, Bench, Row", isRest: false },
        tuesday:   { name: "FULL BODY B", focus: "Deadlift, OHP, Pull-down", isRest: true },
        wednesday: { name: "FULL BODY C", focus: "Leg Press, Dips, Cable Row", isRest: false },
        thursday:  { name: "FULL BODY A", focus: "Squat, Bench, Row", isRest: true },
        friday:    { name: "FULL BODY B", focus: "Deadlift, OHP, Pull-down", isRest: false },
        saturday:  { name: "FULL BODY C", focus: "Leg Press, Dips, Cable Row", isRest: true },
        sunday:    { name: "FULL BODY D", focus: "Accessories & Core", isRest: true },
    },
    calist: {
        monday:    { name: "FULL BODY A", focus: "Pull-ups & Push-ups", isRest: false },
        tuesday:   { name: "FULL BODY B", focus: "Chin-ups & Dips", isRest: true },
        wednesday: { name: "FULL BODY C", focus: "Rows & Pike Push", isRest: false },
        thursday:  { name: "FULL BODY A", focus: "Pull-ups & Push-ups", isRest: true },
        friday:    { name: "FULL BODY B", focus: "Chin-ups & Dips", isRest: false },
        saturday:  { name: "FULL BODY C", focus: "Rows & Pike Push", isRest: true },
        sunday:    { name: "FULL BODY D", focus: "Skills & Core", isRest: true },
    }
};

const schedule = ref(JSON.parse(JSON.stringify(defaultSchedule)));
const rawConfig = ref({ gym: {} as Record<string, any>, calist: {} as Record<string, any> });

const isSavingSchedule = ref(false);
const schedMsg = ref('');
const schedStatus = ref<'error' | 'success'>('success');

async function loadSettings() {
    try {
        const gymRes = await secureFetch('/api/program/get?mode=gym').catch(() => ({})) as any;
        if (gymRes?.start_date) gymStartDate.value = gymRes.start_date;
        if (gymRes?.config) {
            rawConfig.value.gym = gymRes.config;
            ALL_DAYS.forEach(day => {
                if (gymRes.config[day]) {
                    schedule.value.gym[day].name = gymRes.config[day].name || schedule.value.gym[day].name;
                    schedule.value.gym[day].focus = gymRes.config[day].focus || schedule.value.gym[day].focus;
                    schedule.value.gym[day].isRest = gymRes.config[day].isRest === true;
                }
            });
        }

        const calistRes = await secureFetch('/api/program/get?mode=calist').catch(() => ({})) as any;
        if (calistRes?.start_date) calistStartDate.value = calistRes.start_date;
        if (calistRes?.config) {
            rawConfig.value.calist = calistRes.config;
            ALL_DAYS.forEach(day => {
                if (calistRes.config[day]) {
                    schedule.value.calist[day].name = calistRes.config[day].name || schedule.value.calist[day].name;
                    schedule.value.calist[day].focus = calistRes.config[day].focus || schedule.value.calist[day].focus;
                    schedule.value.calist[day].isRest = calistRes.config[day].isRest === true;
                }
            });
        }
    } catch (e) {
        console.error("Failed to load settings:", e);
    }
}

async function saveSchedule() {
    isSavingSchedule.value = true;
    schedMsg.value = '';
    try {
        const mode = scheduleMode.value;
        const configToSave = { ...rawConfig.value[mode] }; 

        ALL_DAYS.forEach(day => {
            configToSave[day] = {
                ...(configToSave[day] || {}), 
                name: schedule.value[mode][day].name,
                focus: schedule.value[mode][day].focus,
                isRest: schedule.value[mode][day].isRest
            };
        });

        await secureFetch('/api/program/save', {
            method: 'POST',
            body: { mode, config: configToSave }
        });

        rawConfig.value[mode] = configToSave;
        schedStatus.value = 'success';
        schedMsg.value = `✓ Global Schedule for ${mode.toUpperCase()} saved.`;
    } catch (e: any) {
        schedStatus.value = 'error';
        schedMsg.value = e.data?.message || 'Failed to save schedule.';
    } finally {
        isSavingSchedule.value = false;
    }
}
</script>
