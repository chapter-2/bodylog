<template>
    <div class="inner py-10">
        <div class="mb-10">
            <h1 class="text-4xl md:text-5xl font-black uppercase text-foreground-primary tracking-tighter mb-2">
                USER PROFILE
            </h1>
            <p class="font-mono text-sm text-foreground-text uppercase tracking-widest">
                Manage your identity
            </p>
        </div>

        <div v-if="user" class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl">
            <div class="flex items-center gap-6 mb-8 pb-8 border-b border-separator">
                <div class="w-20 h-20 bg-primary flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_#27272a]">
                    <User class="w-10 h-10 text-white" />
                </div>
                <div>
                    <h2 class="text-3xl font-black uppercase tracking-tight text-foreground-primary">
                        {{ user.username }}
                    </h2>
                    <p class="font-mono text-xs text-foreground-text mt-1">
                        Instance Claimed: {{ new Date(user.created_at).toLocaleDateString('id-ID') }}
                    </p>
                </div>
            </div>

            <div class="space-y-6">
                <div>
                    <h3 class="font-mono text-xs uppercase tracking-widest text-foreground-text mb-4">
                        Account Actions
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            class="p-4 border-2 border-separator flex items-center justify-between hover:border-primary hover:text-primary transition-colors group"
                            disabled
                        >
                            <span class="font-bold uppercase tracking-wider text-sm">Export Data</span>
                            <Download class="w-5 h-5 group-hover:-translate-y-1 transition-transform opacity-50" />
                        </button>
                        
                        <button 
                            @click="handleLogout"
                            class="p-4 border-2 border-separator bg-red-50 text-red-600 flex items-center justify-between hover:bg-red-100 transition-colors group"
                        >
                            <span class="font-bold uppercase tracking-wider text-sm">Terminate Session</span>
                            <LogOut class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-20">
            <p class="font-mono text-foreground-text">Loading profile data...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User, LogOut, Download } from "lucide-vue-next";

const { user, checkAuth, logout } = useAuth();

onMounted(async () => {
    await checkAuth();
    if (!user.value) {
        navigateTo('/login');
    }
});

function handleLogout() {
    logout();
}
</script>
