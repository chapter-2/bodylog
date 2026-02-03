<template>
    <div class="min-h-screen bg-background">
        <!-- Loading State -->
        <div v-if="isLoading">
            <div class="inner border-x bg-white py-16 md:py-24 border-b border-separator relative overflow-hidden">
                <div class="relative z-10 text-center">
                    <div class="h-8 w-48 mx-auto mb-2 bg-separator border-2 border-border animate-pulse"></div>
                    <div class="h-16 w-64 mx-auto bg-separator border-2 border-border animate-pulse"></div>
                </div>
            </div>

            <div class="inner border-x border-separator bg-white p-8 md:p-16">
                <div class="space-y-6">
                    <div class="h-24 bg-separator border-2 border-border animate-pulse"></div>
                    <div class="grid grid-cols-2 gap-8">
                        <div class="h-16 bg-separator/50 border-2 border-border animate-pulse"></div>
                        <div class="h-16 bg-separator/50 border-2 border-border animate-pulse"></div>
                    </div>
                </div>
            </div>

            <!-- Loading Indicator -->
            <div class="fixed bottom-8 right-8 z-50 animate-bounce-in">
                <div class="flex items-center gap-3 px-4 py-3 bg-primary border-2 border-foreground-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div class="flex gap-1">
                        <span class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                        <span class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                        <span class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                    </div>
                    <span class="font-mono text-xs uppercase tracking-widest text-white font-bold">
                        LOADING BULK DATA
                    </span>
                </div>
            </div>
        </div>

        <!-- Actual Content -->
        <div v-else>
            <!-- Guest Preview Banner -->
            <div v-if="!isAuthenticated" class="inner border-x border-b-2 border-yellow-400 bg-yellow-50 px-6 py-4">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <Eye class="w-5 h-5 text-yellow-600 shrink-0" />
                        <div>
                            <p class="font-bold text-yellow-900 text-sm">PREVIEW MODE</p>
                            <p class="text-xs text-yellow-700 font-mono">Login to save your weight & track bulk progress</p>
                        </div>
                    </div>
                    <NuxtLink 
                        to="/login" 
                        class="px-6 py-2 bg-yellow-600 text-white font-bold text-xs uppercase rounded hover:bg-yellow-700 transition-colors whitespace-nowrap"
                    >
                        Login Now →
                    </NuxtLink>
                </div>
            </div>

            <div class="inner border-x bg-white py-16 md:py-24 border-b border-separator relative overflow-hidden">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                    <span class="text-[15rem] font-black font-sans">BULK</span>
                </div>

                <div class="relative z-10 text-center">
                    <span class="font-handwriting text-xl text-primary mb-2 block -rotate-1">
                        Tracking Progress
                    </span>
                    <h1 class="text-5xl md:text-7xl font-black uppercase text-foreground-primary">
                        Weigh In
                    </h1>
                    <p class="font-mono text-sm mt-4 text-foreground-text opacity-70 max-w-lg mx-auto">
                        Target: +0.5-1KG per week. Eat big to get big.
                    </p>
                </div>
            </div>

            <div class="inner border-x border-separator bg-white">
                <BulkWeightForm @saved="handleSaved" />
            </div>

            <div class="inner border-x bg-[#fcfbf7] border-t border-separator">
                <div class="grid grid-cols-3 divide-x divide-separator border-b border-separator">
                    <div class="p-8 text-center">
                        <span class="font-mono text-xs uppercase tracking-widest text-foreground-text block mb-2">Start</span>
                        <span class="text-3xl md:text-4xl font-black text-foreground-text opacity-50">{{ startWeight }}</span>
                    </div>
                    <div class="p-8 text-center bg-white">
                        <span class="font-mono text-xs uppercase tracking-widest text-primary block mb-2 font-bold">Current</span>
                        <span class="text-3xl md:text-4xl font-black text-primary">{{ currentWeight }}</span>
                    </div>
                    <div class="p-8 text-center">
                        <span class="font-mono text-xs uppercase tracking-widest text-foreground-text block mb-2">Gained</span>
                        <span class="text-3xl md:text-4xl font-black text-foreground-primary">
                            {{ totalGained > 0 ? "+" : "" }}{{ totalGained }}
                        </span>
                    </div>
                </div>

                <div class="p-8 md:p-12">
                    <h3 class="text-2xl font-bold uppercase mb-6 font-handwriting">
                        Progress Log
                    </h3>

                    <div v-if="weightData.length > 0" class="space-y-2">
                        <div
                            v-for="(entry, idx) in weightData.slice(1).reverse().slice(0, 10)"
                            :key="idx"
                            class="flex items-center justify-between p-4 border-b border-separator last:border-0 hover:bg-white transition-colors"
                        >
                            <div class="flex items-center gap-4">
                                <span class="font-bold font-mono text-foreground-primary bg-primary/10 px-2 py-1 rounded text-xs">W{{ entry[0] }}</span>
                                <span class="text-sm text-foreground-text font-mono">{{ entry[1] }}</span>
                            </div>

                            <div class="text-right">
                                <span class="font-black text-xl block">{{ entry[2] }} KG</span>

                                <span v-if="entry[3]" class="text-xs text-foreground-text font-handwriting">{{ entry[3] }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center py-8 opacity-50 italic">
                        {{ isAuthenticated ? 'No data logged yet.' : 'Login to see your weight history.' }}
                    </div>
                </div>
            </div>

            <div class="inner border-x border-separator h-12 bg-background border-b"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Eye } from "lucide-vue-next";

const { secureFetch, checkAuth, isAuthenticated } = useAuth();

const isLoading = ref(true);
const weightData = ref<any[]>([]);

const currentWeight = computed(() => {
    if (weightData.value.length <= 1) return 0;
    const lastEntry = weightData.value[weightData.value.length - 1];
    return lastEntry[2] || 0;
});

const startWeight = computed(() => {
    return weightData.value[1]?.[2] || "-";
});

const totalGained = computed(() => {
    if (weightData.value.length <= 1) return 0;
    const start = parseFloat(weightData.value[1]?.[2]) || 0;
    const current = parseFloat(currentWeight.value) || 0;
    return (current - start).toFixed(1);
});

async function loadWeightData() {
    try {
        const { data } = await secureFetch("/api/bulk/get");
        weightData.value = data as any[];
    } catch (error) {
        console.error("Failed to load weight data:", error);
    }
}

function handleSaved() {
    loadWeightData();
}

onMounted(async () => {
    isLoading.value = true;
    checkAuth();
    await nextTick();

    try {
        if (isAuthenticated.value) {
            await loadWeightData();
        }
    } catch (error) {
        console.error("Error loading bulk data:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes bounceIn {
    0% { transform: scale(0.9); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
    animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
