<template>
    <div class="min-h-screen bg-background pb-20">
        <div
            class="inner border-x border-b border-separator bg-white py-16 md:py-24 relative overflow-hidden"
        >
            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none"
            >
                <span class="text-[15rem] font-black font-sans text-primary">COACH</span>
            </div>

            <div class="relative z-10 text-center px-4">
                <span class="font-handwriting text-xl text-primary mb-2 block rotate-2">
                    Free AI Analysis
                </span>
                <h1 class="text-3xl md:text-7xl font-black uppercase text-foreground-primary">
                    AI Personal <span class="text-primary">Trainer</span>
                </h1>
                <p class="font-mono text-sm mt-4 text-foreground-text opacity-70 max-w-lg mx-auto">
                    Export your raw data and let AI analyze your progress.
                </p>

                <!-- Mode indicator -->
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
                    <p class="text-sm font-mono opacity-60">
                        We compile your {{ isGym ? 'Gym' : 'Calist' }} & Bulk logs into a single CSV file.
                    </p>
                </div>
                <div class="p-6 border-2 border-dashed border-separator rounded-xl hover:bg-[#fcfbf7] transition-colors">
                    <span class="text-4xl font-black text-separator mb-4 block">02</span>
                    <h3 class="font-bold text-lg mb-2">Auto-Copy Prompt</h3>
                    <p class="text-sm font-mono opacity-60">
                        We copy the perfect "Personal Trainer" prompt to your clipboard.
                    </p>
                </div>
                <div class="p-6 border-2 border-dashed border-separator rounded-xl hover:bg-[#fcfbf7] transition-colors">
                    <span class="text-4xl font-black text-separator mb-4 block">03</span>
                    <h3 class="font-bold text-lg mb-2">Paste & Upload</h3>
                    <p class="text-sm font-mono opacity-60">
                        Gemini opens automatically. Just paste the text and attach the file.
                    </p>
                </div>
            </div>

            <div class="max-w-md mx-auto mb-8">
                <label class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2 text-center">
                    Your Height (CM)
                </label>
                <div class="relative">
                    <input
                        v-model="userHeight"
                        type="number"
                        placeholder="170"
                        class="w-full bg-transparent border-b-2 border-separator py-4 font-sans text-4xl font-bold text-center text-foreground-primary outline-none focus:border-primary transition-colors"
                    />
                    <span class="absolute right-10 bottom-6 text-xl font-bold text-separator pointer-events-none">CM</span>
                </div>
                <p class="text-xs text-center mt-2 text-foreground-text opacity-60">
                    Used to calculate BMI in the prompt.
                </p>
            </div>

            <div class="text-center">
                <button
                    @click="handleSummonTrainer"
                    :disabled="loading || !userHeight"
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

        <!-- ─── SUCCESS MODAL ─── -->
        <transition name="fade">
            <div
                v-if="showSuccessModal"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
                <div
                    class="w-full max-w-sm bg-white border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative animate-bounce-in"
                >
                    <div class="mx-auto w-16 h-16 bg-green-50 border-2 border-green-100 rounded-full flex items-center justify-center mb-6">
                        <Sparkles class="w-8 h-8 text-green-600" />
                    </div>

                    <h3 class="text-2xl font-black uppercase mb-2">
                        Prompt Copied!
                    </h3>

                    <p class="font-mono text-sm mb-4 text-foreground-text leading-relaxed">
                        Opening Gemini in
                        <span class="font-bold text-primary text-lg">{{ countdown }}</span>
                        seconds...
                    </p>

                    <p class="text-xs text-foreground-text/60 mb-8 bg-gray-50 p-3 rounded border border-separator">
                        Pop-up blocked? Click the button below to open manually.
                    </p>

                    <div class="flex flex-col gap-3">
                        <button
                            @click="openGemini"
                            class="w-full py-4 bg-foreground-primary text-white border-2 border-foreground-primary font-bold text-lg uppercase hover:bg-primary hover:border-primary transition-all active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2"
                        >
                            <span>Open Gemini</span>
                            <ExternalLink class="w-4 h-4" />
                        </button>
                        <button
                            @click="showSuccessModal = false"
                            class="w-full py-4 bg-transparent border-2 border-separator text-foreground-text font-bold text-lg uppercase hover:border-foreground-primary hover:text-foreground-primary transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ─── LOGIN MODAL ─── -->
        <transition name="fade">
            <div
                v-if="showLoginModal"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
                <div
                    class="w-full max-w-sm bg-white border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative animate-bounce-in"
                >
                    <div class="mx-auto w-16 h-16 bg-yellow-50 border-2 border-yellow-100 rounded-full flex items-center justify-center mb-6">
                        <Lock class="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 class="text-2xl font-black uppercase mb-2">Access Denied</h3>
                    <p class="font-mono text-sm mb-8 text-foreground-text leading-relaxed">
                        You need to login to access your workout data.
                    </p>
                    <div class="flex flex-col gap-3">
                        <button
                            @click="navigateTo('/login')"
                            class="w-full py-4 bg-foreground-primary text-white border-2 border-foreground-primary font-bold text-lg uppercase hover:bg-primary hover:border-primary transition-all"
                        >
                            Go to Login
                        </button>
                        <button
                            @click="showLoginModal = false"
                            class="w-full py-4 bg-transparent border-2 border-separator text-foreground-text font-bold text-lg uppercase hover:border-foreground-primary"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { Loader2, Rocket, Lock, Sparkles, ExternalLink, Dumbbell, Activity } from "lucide-vue-next";
const { secureFetch } = useAuth();
const { isGym, isCalist } = useMode();

const loading = ref(false);
const showLoginModal = ref(false);
const showSuccessModal = ref(false);
const userHeight = ref<number | null>(null);
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

// ─── BUILD TRAINING CONTEXT BLOCK (shared for gym & calist) ───
function buildContextBlock(gymOrCalistData: any[]): string {
    const contextLines: string[] = [];
    const sessionNotesMap = new Map<string, string>();

    gymOrCalistData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        const week = row[0];
        const day = row[1];
        const exerciseName = row[4];
        const exerciseNote = row[10];
        const sessionNote = row[11];
        const key = `W${week} ${day}`;

        if (sessionNote && !sessionNotesMap.has(key)) {
            sessionNotesMap.set(key, sessionNote);
        }
        if (exerciseNote) {
            contextLines.push(`- ${key} | ${exerciseName}: "${exerciseNote}"`);
        }
    });

    const sessionNoteLines: string[] = [];
    sessionNotesMap.forEach((note, key) => {
        sessionNoteLines.push(`- ${key} Session: "${note}"`);
    });

    const allLines = [...sessionNoteLines, ...contextLines];
    return allLines.length > 0
        ? `\n**TRAINING CONTEXT & NOTES (READ THESE FIRST — they explain WHY certain numbers look the way they do):**\n${allLines.join("\n")}\n`
        : "";
}

// ─── GYM PROMPT ───
function buildGymPrompt(gymData: any[], bulkData: any[], height: number): string {
    const contextBlock = buildContextBlock(gymData);

    return `Act as an elite Personal Trainer and Nutritionist.
I have attached a CSV file containing my "Gym Logs" and "Body Weight Logs" (Bulk progress).

**My Stats:**
- Height: ${height} cm
${contextBlock}
**IMPORTANT:** Before analyzing my numbers, read the Training Context & Notes above. Some exercises have reduced weight or changed equipment due to injury or equipment availability. Do NOT flag those as regression — understand WHY before judging.

Please analyze my data and provide a concise report with:
1. **Progressive Overload Check**: Am I getting stronger? Point out exercises where I'm genuinely stalling (ignore ones explained by injury/notes).
2. **Bulk Analysis**: Calculate my BMI based on my height (${height}cm) and latest weight. Am I gaining too fast/slow (Target: 0.5kg/week)?
3. **Weak Points**: Based on my lifts, what body parts seem lagging?
4. **Action Plan**: Give me 3 specific bullet points on what I should focus on next week.

Be brutal, direct, and data-driven. Don't give generic advice.`;
}

// ─── CALIST PROMPT ───
function buildCalistPrompt(calistData: any[], bulkData: any[], height: number): string {
    const contextBlock = buildContextBlock(calistData);

    return `Act as an elite Calisthenics Coach and Nutritionist specializing in skill progression.
I have attached a CSV file containing my Calisthenics training logs and Body Weight Logs during Ramadan.

**My Stats:**
- Height: ${height} cm
${contextBlock}
**Program Context:**
- Ramadan home program, training sore sebelum buka puasa
- Equipment: Pull-up bar, low parallettes, resistance bands
- Primary Goal: Planche foundation + maintain back width & shoulder development
- Secondary Goal: Maintain bodyweight / minimize muscle loss during fasting
- Rest days: Tuesday & Thursday

**IMPORTANT:** Before analyzing, read the Training Context & Notes above. Reduced reps or holds may be due to fasting energy or wrist condition — understand WHY before judging.

Please analyze my data and provide a concise report with:
1. **Planche Progression Check**: How is my Planche Lean hold time and Tuck Planche Hold progressing week over week? Am I on track for the 4-week milestone (W4 target: Tuck hold 15s solid)?
2. **Pull Strength Analysis**: Wide Grip Pull-up and Chin-up volume trend. Am I progressing or stalling?
3. **Push & Shoulder**: Pike Push-up reps and Band Lateral Raise — are these moving?
4. **Ramadan Body Composition**: Calculate BMI from latest weight and height. Am I maintaining weight or losing too fast during fasting? (Acceptable: max -0.5kg/week)
5. **Action Plan**: Give me 3 specific, concrete things to focus on next week — no generic advice.

Be brutal, direct, and data-driven.`;
}

// ─── BUILD CSV (gym mode) ───
function buildGymCsv(gymData: any[], bulkData: any[]): string {
    let csv = "TYPE,WEEK,DAY,DATE,EXERCISE,SET1,SET2,SET3,SET4,COMPLETED,EXERCISE_NOTE,SESSION_NOTE\n";

    bulkData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        csv += `BULK,${row[0]},,${row[1]},,,,,,,${csvField(row[3] || "")},\n`;
        csv += `BULK_WEIGHT,${row[0]},,${row[1]},"Weight: ${row[2]}kg",,,,,,,,\n`;
    });

    gymData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        csv += [
            "GYM",
            row[0], row[1], row[2],
            csvField(row[4] || ""),
            csvField(row[5] || "-"),
            csvField(row[6] || "-"),
            csvField(row[7] || "-"),
            csvField(row[8] || "-"),
            row[9] || "NO",
            csvField(row[10] || ""),
            csvField(row[11] || ""),
        ].join(",") + "\n";
    });

    return csv;
}

// ─── BUILD CSV (calist mode) ───
function buildCalistCsv(calistData: any[], bulkData: any[]): string {
    let csv = "TYPE,WEEK,DAY,DATE,EXERCISE,SET1,SET2,SET3,SET4,COMPLETED,EXERCISE_NOTE,SESSION_NOTE\n";

    bulkData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        csv += `BULK,${row[0]},,${row[1]},,,,,,,${csvField(row[3] || "")},\n`;
        csv += `BULK_WEIGHT,${row[0]},,${row[1]},"Weight: ${row[2]}kg",,,,,,,,\n`;
    });

    calistData.forEach((row: any[]) => {
        if (row[0] === "Week") return;
        csv += [
            "CALIST",
            row[0], row[1], row[2],
            csvField(row[4] || ""),
            csvField(row[5] || "-"),
            csvField(row[6] || "-"),
            csvField(row[7] || "-"),
            csvField(row[8] || "-"),
            row[9] || "NO",
            csvField(row[10] || ""),
            csvField(row[11] || ""),
        ].join(",") + "\n";
    });

    return csv;
}

async function handleSummonTrainer() {
    if (!userHeight.value) {
        alert("Please enter your height first!");
        return;
    }

    loading.value = true;

    try {
        const [mainRes, bulkRes] = await Promise.all([
            isGym.value
                ? secureFetch("/api/gym/get")
                : secureFetch("/api/calist/get"),
            secureFetch("/api/bulk/get"),
        ]);

        const mainData: any[] = mainRes.data || [];
        const bulkData: any[] = bulkRes.data || [];

        const csvContent = isGym.value
            ? buildGymCsv(mainData, bulkData)
            : buildCalistCsv(mainData, bulkData);

        const AI_PROMPT = isGym.value
            ? buildGymPrompt(mainData, bulkData, userHeight.value)
            : buildCalistPrompt(mainData, bulkData, userHeight.value);

        // ─── Download CSV ───
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

        // ─── Copy prompt ───
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
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
@keyframes bounceIn {
    0% {
        transform: scale(0.9);
        opacity: 0;
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
.animate-bounce-in {
    animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
