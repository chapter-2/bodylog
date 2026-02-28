<template>
    <div class="min-h-screen bg-background pb-20">
        <div class="inner py-10 md:py-16">

            <div class="mb-12 border-b-2 border-foreground-primary pb-6 text-center md:text-left">
                <span class="font-handwriting text-xl text-primary mb-1 block">Instance Management</span>
                <h1 class="text-4xl md:text-6xl font-black uppercase text-foreground-primary tracking-tighter">
                    Profile & Settings
                </h1>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">

                <div class="space-y-8">
                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
                        <div class="w-20 h-20 bg-primary flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_#27272a] mb-5">
                            <UserIcon class="w-10 h-10 text-white" />
                        </div>
                        <h2 class="text-3xl font-black uppercase tracking-tight text-foreground-primary">
                            {{ user?.username || 'Loading...' }}
                        </h2>
                        <p v-if="user?.created_at" class="font-mono text-xs text-foreground-text mt-2 uppercase tracking-widest border-t border-separator pt-3 w-full">
                            Claimed: <span class="text-primary font-bold">{{ new Date(user.created_at).toLocaleDateString('id-ID') }}</span>
                        </p>
                    </div>

                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="font-black uppercase text-xl mb-4 flex items-center gap-2 pb-4 border-b border-separator">
                            <DatabaseBackup class="w-5 h-5 text-primary" />
                            Data Export
                        </h2>
                        <p class="font-mono text-sm text-foreground-text mb-6 leading-relaxed">
                            Export semua data (gym, calist, bulk) sebagai JSON untuk keperluan backup atau migrasi ke instance lain.
                        </p>
                        <button @click="downloadBackup" :disabled="isDownloading" class="w-full py-4 border-2 border-foreground-primary text-foreground-primary font-bold text-sm uppercase tracking-wider hover:bg-foreground-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                            <Download class="w-5 h-5" />
                            {{ isDownloading ? 'Exporting...' : 'Download JSON Backup' }}
                        </button>
                    </div>

                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8">
    <h2 class="font-black uppercase text-xl mb-4 flex items-center gap-2 pb-4 border-b border-separator">
        <Eye class="w-5 h-5 text-primary" />
        Preferences
    </h2>
    <p class="font-mono text-sm text-foreground-text mb-6 leading-relaxed">
        Ingin melihat kembali panduan awal penggunaan aplikasi? Reset UI onboarding di sini.
    </p>
    <button @click="handleResetTour" class="w-full py-4 border-2 border-separator text-foreground-primary font-bold text-sm uppercase tracking-wider hover:bg-[#fcfbf7] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
        <RefreshCw class="w-5 h-5" />
        Replay Onboarding Tour
    </button>
</div>
                </div>

                <div class="space-y-8">
                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="font-black uppercase text-xl mb-4 flex items-center gap-2 pb-4 border-b border-separator">
                            <Lock class="w-5 h-5 text-primary" />
                            Security
                        </h2>

                        <form @submit.prevent="changePassword" class="space-y-5">
                            <div class="group">
                                <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">
                                    Current Password
                                </label>
                                <input v-model="passForm.old" type="password" class="input-pow py-2 w-full text-base font-mono" placeholder="••••••••" required />
                            </div>
                            <div class="group">
                                <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">
                                    New Password
                                </label>
                                <input v-model="passForm.new" type="password" class="input-pow py-2 w-full text-base font-mono" placeholder="••••••••" required />
                            </div>

                            <div v-if="passMsg" :class="passStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="text-sm font-bold border p-3 rounded">
                                {{ passMsg }}
                            </div>

                            <button type="submit" :disabled="isChangingPass" class="w-full mt-2 py-3 bg-foreground-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-50">
                                {{ isChangingPass ? 'Updating...' : 'Update Password' }}
                            </button>
                        </form>
                    </div>

                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="font-black uppercase text-xl mb-4 flex items-center gap-2 pb-4 border-b border-separator">
                            <CalendarDays class="w-5 h-5 text-primary" />
                            Program Start Dates
                        </h2>
                        <p class="font-mono text-xs text-foreground-text mb-6 leading-relaxed">
                            Week number dihitung otomatis dari tanggal ini. <span class="text-primary font-bold">Jangan ganti jika program sudah berjalan</span>.
                        </p>

                        <div class="space-y-5">
                            <div>
                                <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">
                                    🏋️ Gym Program Start
                                </label>
                                <input
                                    v-model="gymStartDate"
                                    type="date"
                                    class="w-full bg-transparent border-b-2 border-separator py-2 font-mono text-lg text-foreground-primary outline-none focus:border-primary transition-colors"
                                />
                                <div v-if="gymStartSaved" class="mt-1 text-xs text-green-600 font-bold">✓ Saved</div>
                            </div>

                            <div>
                                <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">
                                    🤸 Calist Program Start
                                </label>
                                <input
                                    v-model="calistStartDate"
                                    type="date"
                                    class="w-full bg-transparent border-b-2 border-separator py-2 font-mono text-lg text-foreground-primary outline-none focus:border-primary transition-colors"
                                />
                                <div v-if="calistStartSaved" class="mt-1 text-xs text-green-600 font-bold">✓ Saved</div>
                            </div>
                        </div>

                        <button
                            @click="saveStartDates"
                            :disabled="isSavingDates"
                            class="mt-8 w-full py-3 bg-foreground-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save class="w-4 h-4" />
                            {{ isSavingDates ? 'Saving...' : 'Save Dates' }}
                        </button>

                        <div v-if="dateMsg" :class="dateStatus === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'" class="mt-4 text-sm font-bold border p-3 rounded">
                            {{ dateMsg }}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User as UserIcon, Download, Lock, DatabaseBackup, CalendarDays, Save, Eye, RefreshCw } from "lucide-vue-next";

const { secureFetch, isAuthenticated, checkAuth, user } = useAuth();

const { resetTour } = useMode();

function handleResetTour() {
    resetTour();
    // Redirect ke home agar tour langsung terlihat dari awal
    navigateTo('/'); 
}

// ─── Auth guard ───
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

// ─── Start Dates ───
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
        dateMsg.value = '✓ Start dates saved successfully.';
    } catch (e: any) {
        dateStatus.value = 'error';
        dateMsg.value = e.data?.message || 'Failed to save start dates.';
    } finally {
        isSavingDates.value = false;
    }
}

async function loadSettings() {
    try {
        const gymRes = await secureFetch('/api/program/get?mode=gym').catch(() => ({})) as any;
        if (gymRes?.start_date) gymStartDate.value = gymRes.start_date;

        const calistRes = await secureFetch('/api/program/get?mode=calist').catch(() => ({})) as any;
        if (calistRes?.start_date) calistStartDate.value = calistRes.start_date;
    } catch (e) {
        console.error("Failed to load settings:", e);
    }
}
</script>
