<template>
    <div class="inner py-10 md:py-20">
        <div class="mb-10">
            <h1 class="text-4xl md:text-5xl font-black uppercase text-foreground-primary tracking-tighter mb-2">
                SYSTEM SETTINGS
            </h1>
            <p class="font-mono text-sm text-foreground-text uppercase tracking-widest">
                Configure your instance
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1 space-y-8">
                <div class="bg-white border-2 border-separator p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 class="font-black uppercase text-xl mb-4 flex items-center gap-2">
                        <Lock class="w-5 h-5 text-primary" /> Security
                    </h2>
                    
                    <form @submit.prevent="changePassword" class="space-y-4">
                        <div class="group">
                            <label class="block font-mono text-[10px] uppercase tracking-widest text-foreground-text mb-1">Current Password</label>
                            <input v-model="passForm.old" type="password" class="input-pow py-2 text-sm" required />
                        </div>
                        <div class="group">
                            <label class="block font-mono text-[10px] uppercase tracking-widest text-foreground-text mb-1">New Password</label>
                            <input v-model="passForm.new" type="password" class="input-pow py-2 text-sm" required />
                        </div>
                        
                        <div v-if="passMsg" :class="passStatus === 'error' ? 'text-red-500' : 'text-green-600'" class="font-bold text-xs">
                            {{ passMsg }}
                        </div>
                        
                        <button type="submit" :disabled="isChangingPass" class="w-full py-2 bg-foreground-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-50">
                            {{ isChangingPass ? 'Updating...' : 'Update Password' }}
                        </button>
                    </form>
                </div>

                <div class="bg-white border-2 border-separator p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 class="font-black uppercase text-xl mb-4 flex items-center gap-2">
                        <DatabaseBackup class="w-5 h-5 text-primary" /> Data
                    </h2>
                    <button @click="downloadBackup" class="w-full py-3 border-2 border-separator text-foreground-primary font-bold text-xs uppercase tracking-wider hover:bg-[#fcfbf7] transition-colors flex items-center justify-center gap-2">
                        <Download class="w-4 h-4" /> Download SQLite Backup
                    </button>
                </div>
            </div>

            <div class="md:col-span-2">
                <div class="bg-white border-2 border-separator p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 class="font-black uppercase text-2xl mb-2">Program Editor (Legacy)</h2>
                    <p class="font-mono text-xs text-foreground-text mb-8">Rename exercises for Gym and Calisthenics base modes.</p>

                    <div class="p-8 border border-dashed border-separator text-center bg-[#fcfbf7]">
                        <p class="font-mono text-sm text-foreground-text opacity-70">Legacy Program Editor loaded successfully.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Lock, DatabaseBackup, Download } from "lucide-vue-next";
import { ref } from 'vue';

const { secureFetch, isAuthenticated, checkAuth } = useAuth();

const passForm = ref({ old: '', new: '' });
const isChangingPass = ref(false);
const passMsg = ref('');
const passStatus = ref<'error' | 'success'>('success');

onMounted(async () => {
    await checkAuth();
    if (!isAuthenticated.value) navigateTo('/login');
});

async function changePassword() {
    isChangingPass.value = true;
    passMsg.value = '';
    
    try {
        await secureFetch('/api/auth/password', {
            method: 'POST',
            body: { oldPassword: passForm.value.old, newPassword: passForm.value.new }
        });
        passStatus.value = 'success';
        passMsg.value = 'Password updated successfully.';
        passForm.value = { old: '', new: '' };
    } catch (e: any) {
        passStatus.value = 'error';
        passMsg.value = e.data?.message || 'Failed to update password.';
    } finally {
        isChangingPass.value = false;
    }
}

async function downloadBackup() {
    try {
        const res = await secureFetch('/api/export/all');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `bodylog_backup_${new Date().toISOString().split('T')[0]}.json`);
        dlAnchorElem.click();
    } catch (e) {
        alert("Failed to download backup");
    }
}
</script>
