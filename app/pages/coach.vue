<template>
    <div class="min-h-screen bg-background pb-20">
        <div class="inner border-x border-b border-separator bg-white py-16 md:py-24 relative overflow-hidden">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                <span class="text-[15rem] font-black font-sans text-primary">COACH</span>
            </div>

            <div class="relative z-10 text-center px-4">
                <span class="font-handwriting text-xl text-primary mb-2 block rotate-2">Free AI Analysis</span>
                <h1 class="text-3xl md:text-7xl font-black uppercase text-foreground-primary">
                    AI Personal <span class="text-primary">Trainer</span>
                </h1>
                <p class="font-mono text-sm mt-4 text-foreground-text opacity-70 max-w-lg mx-auto">
                    Export your raw data and let AI analyze your progress.
                </p>

                <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                    <Dumbbell v-if="isGym" class="w-3 h-3 text-primary" />
                    <Activity v-else class="w-3 h-3 text-primary" />
                    <span class="font-mono text-xs text-primary font-bold uppercase tracking-widest">
                        {{ isGym ? 'Gym Mode' : 'Calisthenics Mode' }}
                    </span>
                </div>
            </div>
        </div>

        <div class="inner border-x border-separator bg-white p-8 md:p-12">
            <div class="grid md:grid-cols-3 gap-8 mb-12">
                <div class="p-6 border-2 border-dashed border-separator rounded-xl hover:bg-[#fcfbf7] transition-colors">
                    <span class="text-4xl font-black text-separator mb-4 block">01</span>
                    <h3 class="font-bold text-lg mb-2">Export Data</h3>
                    <p class="text-sm font-mono opacity-60">We compile your {{ isGym ? 'Gym' : 'Calist' }} & Weight logs into a smart CSV file.</p>
                </div>
                <div class="p-6 border-2 border-dashed border-separator rounded-xl hover:bg-[#fcfbf7] transition-colors">
                    <span class="text-4xl font-black text-separator mb-4 block">02</span>
                    <h3 class="font-bold text-lg mb-2">Auto-Copy Prompt</h3>
                    <p class="text-sm font-mono opacity-60">We copy the perfect "Personal Trainer" prompt to your clipboard.</p>
                </div>
                <div class="p-6 border-2 border-dashed border-separator rounded-xl hover:bg-[#fcfbf7] transition-colors">
                    <span class="text-4xl font-black text-separator mb-4 block">03</span>
                    <h3 class="font-bold text-lg mb-2">Paste & Upload</h3>
                    <p class="text-sm font-mono opacity-60">Gemini opens automatically. Just paste the text and attach the file.</p>
                </div>
            </div>

            <div class="max-w-md mx-auto mb-10 space-y-6">
                <div>
                    <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2 text-center">Your Height (CM)</label>
                    <div class="relative">
                        <input v-model="userHeight" type="number" placeholder="170" class="w-full bg-transparent border-b-2 border-separator py-3 font-sans text-3xl font-bold text-center text-foreground-primary outline-none focus:border-primary transition-colors" />
                        <span class="absolute right-8 bottom-4 text-lg font-bold text-separator pointer-events-none">CM</span>
                    </div>
                </div>

                <div>
                    <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2 text-center">Current Goal</label>
                    <select v-model="userGoal" class="w-full bg-transparent border-b-2 border-separator py-3 font-sans text-xl font-bold text-center text-foreground-primary outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                        <option value="Bulk (Muscle Gain)">Bulk (Muscle Gain)</option>
                        <option value="Cut (Fat Loss)">Cut (Fat Loss)</option>
                        <option value="Maintain">Maintain</option>
                    </select>
                </div>
            </div>

            <div class="text-center">
                <button
                    @click="handleSummonTrainer"
                    :disabled="loading || !userHeight || !userGoal"
                    class="w-full px-12 py-6 bg-foreground-primary text-white text-xl md:text-2xl font-black uppercase tracking-wider rounded-xl hover:bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    <Loader2 v-if="loading" class="w-8 h-8 animate-spin" />
                    <div v-else class="flex items-center gap-3">
                        <Rocket class="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
                        <span>Summon AI Coach</span>
                    </div>
                </button>
            </div>
        </div>

        <transition name="fade">
            <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div class="w-full max-w-sm bg-white border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative animate-bounce-in">
                    <div class="mx-auto w-16 h-16 bg-green-50 border-2 border-green-100 rounded-full flex items-center justify-center mb-6">
                        <Sparkles class="w-8 h-8 text-green-600" />
                    </div>
                    <h3 class="text-2xl font-black uppercase mb-2">Prompt Copied!</h3>
                    <p class="font-mono text-sm mb-4 text-foreground-text leading-relaxed">Opening Gemini in <span class="font-bold text-primary text-lg">{{ countdown }}</span> seconds...</p>
                    <div class="flex flex-col gap-3">
                        <button @click="openGemini" class="w-full py-4 bg-foreground-primary text-white font-bold text-lg uppercase hover:bg-primary transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2">
                            <span>Open Gemini</span> <ExternalLink class="w-4 h-4" />
                        </button>
                        <button @click="showSuccessModal = false" class="w-full py-4 bg-transparent border-2 border-separator text-foreground-text font-bold text-lg uppercase hover:border-foreground-primary transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div v-if="showLoginModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div class="w-full max-w-sm bg-white border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative animate-bounce-in">
                    <div class="mx-auto w-16 h-16 bg-yellow-50 border-2 border-yellow-100 rounded-full flex items-center justify-center mb-6">
                        <Lock class="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 class="text-2xl font-black uppercase mb-2">Access Denied</h3>
                    <p class="font-mono text-sm mb-8 text-foreground-text leading-relaxed">You need to login to access your workout data.</p>
                    <button @click="navigateTo('/login')" class="w-full py-4 bg-foreground-primary text-white font-bold text-lg uppercase hover:bg-primary transition-all">Go to Login</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { Loader2, Rocket, Lock, Sparkles, ExternalLink, Dumbbell, Activity } from "lucide-vue-next";
const { secureFetch } = useAuth();
const { isGym } = useMode();

const loading = ref(false);
const showLoginModal = ref(false);
const showSuccessModal = ref(false);
const userHeight = ref<number | null>(null);
const userGoal = ref("Bulk (Muscle Gain)");
const countdown = ref(3);
let timer: any = null;

function openGemini() {
    window.open("https://gemini.google.com/app", "_blank");
}

function csvField(val: string): string {
    if (!val) return "";
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
}

function buildContextBlock(data: any[]): string {
    const contextLines: string[] = [];
    const sessionNotesMap = new Map<string, string>();

    data.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        const key = `W${row[0]} ${row[1]}`;
        if (row[11] && !sessionNotesMap.has(key)) sessionNotesMap.set(key, row[11]);
        if (row[10]) contextLines.push(`- ${key} | ${row[4]}: "${row[10]}"`);
    });

    const sessionNoteLines: string[] = [];
    sessionNotesMap.forEach((note, key) => sessionNoteLines.push(`- ${key} Session: "${note}"`));

    const allLines = [...sessionNoteLines, ...contextLines];
    return allLines.length > 0
        ? `\n**TRAINING CONTEXT & NOTES:**\n${allLines.join("\n")}\n`
        : "";
}

function buildGymPrompt(gymData: any[], height: number, goal: string): string {
    return `Act as an elite Personal Trainer and Nutritionist.
I have attached a CSV file containing my "Gym Logs" and "Weight Logs".

**My Profile:**
- Height: ${height} cm
- Current Goal: ${goal}
${buildContextBlock(gymData)}
**IMPORTANT:** Understand the Context Notes above before analyzing. Do NOT flag reduced weight as regression if I noted an injury or form change.

Please provide a concise report:
1. **Progressive Overload**: Am I getting stronger on core lifts? Point out exact stalls.
2. **Weight Analysis**: Based on my BMI and Goal (${goal}), is my weight trending in the right direction and at a safe pace?
3. **Weak Points**: What muscle groups seem lagging?
4. **Action Plan**: 3 concrete bullet points to focus on next week. Be brutal and direct.`;
}

function buildCalistPrompt(calistData: any[], height: number, goal: string): string {
    return `Act as an elite Calisthenics Coach and Nutritionist.
I have attached a CSV file containing my Calisthenics logs and Weight Logs.

**My Profile:**
- Height: ${height} cm
- Current Goal: ${goal}
${buildContextBlock(calistData)}
Please provide a concise report:
1. **Skill Progression**: How are my hold times and rep ranges progressing? 
2. **Volume Analysis**: Am I progressing on Pull and Push foundations?
3. **Weight Analysis**: Based on my BMI and Goal (${goal}), is my weight trend optimal for bodyweight mastery?
4. **Action Plan**: 3 specific, concrete tweaks for next week's sessions. Be brutal and direct.`;
}

// PERBAIKAN: Format Weight menjadi 1 baris solid per minggu
function buildGymCsv(gymData: any[], weightData: any[], goal: string): string {
    let csv = "TYPE,WEEK,DAY,DATE,EXERCISE,SET1,SET2,SET3,SET4,COMPLETED,EXERCISE_NOTE,SESSION_NOTE\n";

    weightData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        csv += `WEIGHT_LOG,${row[0]},,${row[1]},"Goal: ${goal}",${row[2]}kg,,,,,,${csvField(row[3] || "")}\n`;
    });

    gymData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        csv += `GYM,${row[0]},${row[1]},${row[2]},${csvField(row[4] || "")},${csvField(row[5] || "-")},${csvField(row[6] || "-")},${csvField(row[7] || "-")},${csvField(row[8] || "-")},${row[9] || "NO"},${csvField(row[10] || "")},${csvField(row[11] || "")}\n`;
    });

    return csv;
}

function buildCalistCsv(calistData: any[], weightData: any[], goal: string): string {
    let csv = "TYPE,WEEK,DAY,DATE,EXERCISE,SET1,SET2,SET3,SET4,COMPLETED,EXERCISE_NOTE,SESSION_NOTE\n";

    weightData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        csv += `WEIGHT_LOG,${row[0]},,${row[1]},"Goal: ${goal}",${row[2]}kg,,,,,,${csvField(row[3] || "")}\n`;
    });

    calistData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        csv += `CALIST,${row[0]},${row[1]},${row[2]},${csvField(row[4] || "")},${csvField(row[5] || "-")},${csvField(row[6] || "-")},${csvField(row[7] || "-")},${csvField(row[8] || "-")},${row[9] || "NO"},${csvField(row[10] || "")},${csvField(row[11] || "")}\n`;
    });

    return csv;
}

async function handleSummonTrainer() {
    if (!userHeight.value || !userGoal.value) {
        alert("Please enter your height and goal first!");
        return;
    }

    loading.value = true;
    try {
        const [mainRes, weightRes] = await Promise.all([
            secureFetch(`/api/workout/get?mode=${isGym.value ? 'gym' : 'calist'}`),
            secureFetch("/api/weight/get"),
        ]);

        const mainData: any[] = mainRes.data || [];
        const weightData: any[] = weightRes.data || [];

        const csvContent = isGym.value
            ? buildGymCsv(mainData, weightData, userGoal.value)
            : buildCalistCsv(mainData, weightData, userGoal.value);

        const AI_PROMPT = isGym.value
            ? buildGymPrompt(mainData, userHeight.value, userGoal.value)
            : buildCalistPrompt(mainData, userHeight.value, userGoal.value);

        const filename = isGym.value
            ? `bodylog_gym_export_${new Date().toISOString().slice(0, 10)}.csv`
            : `bodylog_calist_export_${new Date().toISOString().slice(0, 10)}.csv`;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        await navigator.clipboard.writeText(AI_PROMPT.trim());

        loading.value = false;
        showSuccessModal.value = true;
        countdown.value = 3;

        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
                openGemini();
            }
        }, 1000);
    } catch (error) {
        console.error(error);
        showLoginModal.value = true;
        loading.value = false;
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
</style>
