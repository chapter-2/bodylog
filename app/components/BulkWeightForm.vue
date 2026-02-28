<template>
    <div class="inner border-x border-separator bg-white min-h-[60vh] flex flex-col md:flex-row">
        <div class="flex-1 p-8 md:p-16 flex flex-col justify-center">
            <span class="font-handwriting text-xl text-primary mb-4 block rotate-2 w-fit">Morning Check-in!</span>
            <h2 class="text-4xl md:text-6xl font-black mb-12 uppercase text-foreground-primary">
                Weekly Weigh-In
            </h2>

            <form @submit.prevent="saveWeight" class="space-y-12 max-w-md">
                <div class="group">
                    <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2 group-hover:text-primary transition-colors">
                        Current Weight
                    </label>
                    <div class="relative">
                        <input v-model.number="weight" type="number" step="0.1" placeholder="00.0" class="input-pow text-6xl py-4" required />
                        <span class="absolute right-0 bottom-4 text-2xl font-bold text-separator">KG</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-8">
                    <div class="group">
                        <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">Week</label>
                        <input v-model.number="week" type="number" placeholder="1" class="input-pow" required />
                    </div>
                    <div class="group">
                        <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2">Note</label>
                        <input v-model="notes" type="text" placeholder="Feeling..." class="input-pow" />
                    </div>
                </div>

                <div class="pt-8">
                    <button type="submit" :disabled="saving || isLoadingWeek" class="w-full h-16 bg-foreground-primary text-white rounded-xl font-bold text-xl hover:bg-primary transition-all hover:scale-[1.02] flex justify-center items-center gap-3 disabled:opacity-70 disabled:hover:scale-100">
                        {{ saving ? "Saving..." : isLoadingWeek ? "Loading..." : "Log Weight" }}
                        <span v-if="!saving && !isLoadingWeek">→</span>
                    </button>
                </div>

                <div v-if="saveError" class="text-red-500 font-bold text-center mt-4">
                    {{ saveError }}
                </div>
            </form>
        </div>

        <div class="md:w-1/3 bg-[#fcfbf7] border-l border-separator p-8 flex flex-col justify-center relative overflow-hidden">
            <div class="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="relative z-10">
                <Notebook class="w-15 h-15 text-primary mb-6" />
                <h3 class="text-2xl font-bold mb-4 text-foreground-primary">Bulking Strategy</h3>
                <p class="font-mono text-sm leading-relaxed mb-8 text-foreground-text">
                    If scale weight stalls for >2 weeks, increase daily intake by <strong>200-300 kcal</strong>. Focus on clean carbs pre/post workout.
                </p>

                <div v-if="lastSaved" class="border-t border-separator pt-8">
                    <span class="font-handwriting text-foreground-text block mb-2">Last Entry:</span>
                    <div class="text-4xl font-black text-primary">{{ lastSaved }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Notebook } from "lucide-vue-next";
const emit = defineEmits(["saved"]);

const week = ref(1);
const weight = ref<number | null>(null);
const notes = ref("");
const saving = ref(false);
const isLoadingWeek = ref(true);
const lastSaved = ref("");
const saveError = ref("");

onMounted(async () => {
    const { isAuthenticated, secureFetch, checkAuth } = useAuth();
    
    isLoadingWeek.value = true;
    await checkAuth(); // Mencegah race condition yang merusak urutan week
    
    if (isAuthenticated.value) {
        try {
            const res = await secureFetch("/api/bulk/get").catch(() => null);
            if (res && res.data && res.data.length > 0) {
                const dataRows = res.data.slice(1);
                if (dataRows.length > 0) {
                     const maxWeek = Math.max(...dataRows.map((row: any[]) => parseInt(row[0]) || 0));
                     week.value = maxWeek + 1;
                }
            }
        } catch (e) {
            console.error("Failed to auto-detect week", e);
        } finally {
            isLoadingWeek.value = false;
        }
    } else {
        isLoadingWeek.value = false;
    }
});

async function saveWeight() {
    const { isAuthenticated, secureFetch } = useAuth();

    if (!isAuthenticated.value) {
        navigateTo("/login");
        return;
    }

    if (!weight.value) return;

    saving.value = true;
    saveError.value = "";

    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString("id-ID");

        await secureFetch("/api/bulk/save", {
            method: "POST",
            body: {
                week: week.value,
                date: dateStr,
                weight: weight.value,
                notes: notes.value,
            },
        });

        lastSaved.value = `${dateStr}`;
        emit("saved");
        week.value++;
    } catch (error: any) {
        if (error.statusCode === 401) {
            saveError.value = "Session expired. Please login again.";
            setTimeout(() => navigateTo("/login"), 2000);
        } else {
            saveError.value = error.message || "Failed to save.";
        }
    } finally {
        saving.value = false;
    }
}
</script>
