<template>
    <div class="inner border-x border-separator bg-white min-h-[60vh]">

        <div class="p-8 border-b border-separator flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <span class="font-handwriting text-primary text-xl">Today's Session</span>
                <h2 class="text-4xl md:text-5xl font-black uppercase mt-1">
                    {{ dayName }}
                </h2>
                <p class="font-mono text-sm text-foreground-text mt-2">Focus: {{ dayFocus }}</p>
            </div>

            <div v-if="lastSaved" class="px-4 py-2 border border-separator rounded-full bg-background flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span class="font-mono text-xs uppercase tracking-widest">Saved: {{ lastSaved }}</span>
            </div>
        </div>

        <div v-if="exercises.length === 0" class="flex flex-col items-center justify-center py-24 text-center p-8">
            <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <BedDouble class="w-10 h-10" />
            </div>
            <h3 class="text-2xl font-bold uppercase mb-2">Rest & Recover</h3>
            <p class="font-mono text-foreground-text opacity-60 max-w-md">
                No workouts scheduled for today. Take a break, eat well, and get ready for the next grind!
            </p>
        </div>

        <form v-else @submit.prevent="saveWorkout" class="divide-y divide-separator">

            <!-- ─── SESSION NOTE ─── -->
            <div class="p-6 md:p-8 bg-[#fffef5] border-b border-yellow-200">
                <button
                    type="button"
                    @click="showSessionNote = !showSessionNote"
                    class="text-sm font-bold text-foreground-primary hover:text-primary flex items-center gap-2 w-full transition-colors"
                >
                    <MessageSquare class="w-4 h-4 text-yellow-600" />
                    <span>Session Notes</span>
                    <span v-if="sessionNote" class="text-xs font-mono text-primary ml-auto">Has note ✓</span>
                    <span v-else class="text-xs font-mono text-foreground-text/40 ml-auto">e.g. kondisi tubuh, energy level</span>
                    <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showSessionNote }" />
                </button>

                <div v-if="showSessionNote || sessionNote" class="mt-3">
                    <textarea
                        v-model="sessionNote"
                        rows="2"
                        placeholder="Gimana kondisi hari ini? Wrist oke? Energi gimana?"
                        class="w-full text-sm font-mono bg-yellow-50 border border-yellow-300 rounded p-3 text-foreground-text focus:outline-none focus:border-yellow-500 placeholder:text-gray-400 resize-none"
                    ></textarea>
                    <p class="text-xs font-mono text-foreground-text/40 mt-1">
                        AI Coach baca ini untuk ngerti konteks lo hari ini.
                    </p>
                </div>
            </div>

            <!-- ─── EXERCISES ─── -->
            <div
                v-for="(exercise, exIdx) in exercises"
                :key="exIdx"
                class="p-6 md:p-8 hover:bg-[#fcfbf7] transition-colors group"
            >
                <div class="flex justify-between items-start mb-4 gap-4">
                    <div class="flex flex-col gap-1 w-full">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="text-2xl font-bold group-hover:text-primary transition-colors uppercase leading-tight">
                                {{ exercise.name }}
                            </h4>
                            <span
                                class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border"
                                :class="exercise.type === 'hold'
                                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                                    : 'bg-blue-50 border-blue-200 text-blue-700'"
                            >
                                {{ exercise.type === 'hold' ? 'HOLD (detik)' : 'REPS' }}
                            </span>
                        </div>

                        <button
                            type="button"
                            @click="toggleNote(exIdx)"
                            class="text-xs font-mono text-foreground-text/60 hover:text-primary flex items-center gap-1 w-fit mt-1"
                        >
                            <MessageSquare class="w-3 h-3" />
                            <span v-if="exercise.note" class="text-primary font-bold">Edit Note</span>
                            <span v-else>Add Note (e.g. form cues, pain)</span>
                        </button>

                        <div v-if="exercise.showNote || exercise.note" class="mt-2">
                            <input
                                v-model="exercise.note"
                                type="text"
                                placeholder="Kenapa beda dari biasanya?"
                                class="w-full text-sm font-mono bg-yellow-50 border border-yellow-200 rounded p-2 text-foreground-text focus:outline-none focus:border-yellow-400 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div class="flex flex-col items-end gap-2 shrink-0">
                        <span class="font-mono text-xs border border-separator px-2 py-1 rounded bg-white whitespace-nowrap">
                            {{ exercise.sets.length }} SETS
                        </span>
                        <a
                        
                            :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' tutorial form calisthenics')}`"
                            target="_blank"
                            class="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                            <Youtube class="w-3 h-3" />
                            <span class="font-bold text-[10px] tracking-wider">WATCH</span>
                        </a>
                    </div>
                </div>

                <!-- Last week reference -->
                <div v-if="lastWeekData[exIdx]" class="mb-4 p-3 bg-background rounded border border-separator">
                    <span class="font-mono text-xs uppercase tracking-wider text-foreground-text opacity-70">
                        Last Week (W{{ week - 1 }}):
                    </span>
                    <div class="flex gap-2 mt-1 flex-wrap">
                        <span
                            v-for="(set, idx) in lastWeekData[exIdx]"
                            :key="idx"
                            class="font-mono text-xs bg-white px-2 py-1 rounded border border-separator"
                        >
                            {{ set }}
                        </span>
                    </div>
                </div>

                <!-- Set inputs -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="(set, setIdx) in exercise.sets" :key="setIdx" class="flex items-center gap-2">
                        <span class="font-mono text-xs text-primary w-6 pt-1">S{{ setIdx + 1 }}</span>
                        <div class="relative w-full">
                            <input
                                v-model.number="set.value"
                                type="number"
                                placeholder="0"
                                class="w-full bg-transparent border-b border-separator py-1 font-bold text-center focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <span class="text-separator text-xs font-mono shrink-0">
                            {{ exercise.type === 'hold' ? 's' : 'reps' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- ─── PLANCHE MILESTONE TRACKER ─── -->
            <div class="p-6 md:p-8 bg-primary/5 border-b border-primary/20">
                <div class="flex items-start gap-3">
                    <Target class="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p class="font-bold text-sm text-foreground-primary">Planche Milestone Tracker</p>
                        <p class="font-mono text-xs text-foreground-text opacity-70 mt-1">
                            W1: Lean 15s · W2: Lean 20s · W3: Tuck 10s · W4: Tuck 15s solid
                        </p>
                    </div>
                </div>
            </div>

            <!-- ─── SUBMIT ─── -->
            <div class="p-8 bg-background">
                <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" v-model="completed" class="peer hidden" />
                        <div class="w-6 h-6 border-2 border-border rounded flex items-center justify-center transition-colors peer-checked:bg-primary peer-checked:border-primary">
                            <Check class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" stroke-width="3" />
                        </div>
                        <span class="font-bold text-foreground-primary group-hover:text-primary transition-colors">Session Completed</span>
                    </label>

                    <button type="submit" :disabled="saving" class="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-foreground-primary transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {{ saving ? "Saving..." : "Save Session" }}
                    </button>
                </div>
                <div v-if="saveError" class="mt-4 text-red-500 font-bold text-center border border-red-200 bg-red-50 p-2 rounded">
                    {{ saveError }}
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { BedDouble, Check, MessageSquare, ChevronDown, Target, Youtube } from "lucide-vue-next";

// ─── UI Types ───
interface UISet {
    value: number;
}

interface UIExercise {
    name: string;
    type: 'reps' | 'hold';
    sets: UISet[];
    note?: string;
    showNote?: boolean;
}

// ─── Props / Emits ───
const props = defineProps<{ week: number; day: string; }>();
const emit = defineEmits(["saved"]);
const { isAuthenticated, secureFetch } = useAuth();

// ─── State ───
const exercises = ref<UIExercise[]>([]);
const completed = ref(false);
const saving = ref(false);
const lastSaved = ref("");
const saveError = ref("");
const lastWeekData = ref<Record<number, string[]>>({});
const sessionNote = ref("");
const showSessionNote = ref(false);

// ─── Program Templates ───
interface ExerciseDef {
    name: string;
    type: 'reps' | 'hold';
    setCount: number;
}

const programTemplates: Record<string, { name: string; focus: string; exercises: ExerciseDef[] }> = {
    monday: {
        name: "SENIN",
        focus: "Pull — Back Width",
        exercises: [
            { name: "Scapular Pull-up", type: "reps", setCount: 3 },
            { name: "Wide Grip Pull-up", type: "reps", setCount: 4 },
            { name: "Band Face Pull", type: "reps", setCount: 3 },
            { name: "Hollow Body Hold", type: "hold", setCount: 3 },
        ],
    },
    wednesday: {
        name: "RABU",
        focus: "Push + Planche Foundation",
        exercises: [
            { name: "Planche Lean", type: "hold", setCount: 4 },
            { name: "Push-up (Parallettes)", type: "reps", setCount: 4 },
            { name: "Pike Push-up", type: "reps", setCount: 3 },
            { name: "Band Lateral Raise", type: "reps", setCount: 4 },
        ],
    },
    friday: {
        name: "JUMAT",
        focus: "Pull 2 + Planche Skill",
        exercises: [
            { name: "Tuck Planche Hold", type: "hold", setCount: 4 },
            { name: "Chin-up", type: "reps", setCount: 4 },
            { name: "L-sit", type: "hold", setCount: 3 },
            { name: "Band Hammer Curl", type: "reps", setCount: 3 },
        ],
    },
    saturday: {
        name: "SABTU",
        focus: "Legs + Core",
        exercises: [
            { name: "Pistol Squat", type: "reps", setCount: 4 },
            { name: "Nordic Curl", type: "reps", setCount: 3 },
            { name: "Single Leg Calf Raise", type: "reps", setCount: 3 },
            { name: "Planche Lean", type: "hold", setCount: 3 },
        ],
    },
    sunday: {
        name: "MINGGU",
        focus: "Shoulders + Arms + Wrist Rehab",
        exercises: [
            { name: "Pike Push-up (Feet Elevated)", type: "reps", setCount: 4 },
            { name: "Band Lateral Raise", type: "reps", setCount: 4 },
            { name: "Band Curl", type: "reps", setCount: 3 },
            { name: "Wrist Conditioning", type: "hold", setCount: 3 },
        ],
    },
};

// ─── Computed ───
const dayName = computed(() => programTemplates[props.day]?.name || "REST DAY");
const dayFocus = computed(() => programTemplates[props.day]?.focus || "Recover");

// ─── Helpers ───
function formatSetValue(ex: UIExercise, val: number): string {
    if (!val || val <= 0) return "-";
    return ex.type === 'hold' ? `${val}s` : `${val} reps`;
}

function parseSetValue(stored: string): number {
    if (!stored || stored === '-') return 0;
    return parseInt(stored) || 0;
}

function toggleNote(index: number) {
    exercises.value[index].showNote = !exercises.value[index].showNote;
}

// ─── Initialization ───
function initializeExercises() {
    const template = programTemplates[props.day];
    if (!template) {
        exercises.value = [];
        return;
    }
    exercises.value = template.exercises.map((def) => ({
        name: def.name,
        type: def.type,
        sets: Array(def.setCount).fill(null).map(() => ({ value: 0 })),
        note: "",
        showNote: false,
    }));
}

// ─── Load last week data ───
async function loadLastWeekData() {
    if (props.week <= 1) { lastWeekData.value = {}; return; }
    try {
        if (dayName.value === "REST DAY") return;
        const { data } = await secureFetch(`/api/calist/get?day=${dayName.value}`);
        const lastWeekRows = (data as any[]).filter((row: any) => parseInt(row[0]) === props.week - 1);

        if (lastWeekRows.length > 0) {
            const template = programTemplates[props.day];
            const dataMap: Record<number, string[]> = {};
            template?.exercises.forEach((def, idx) => {
                const exerciseRow = lastWeekRows.find((row: any) => row[4] === def.name);
                if (exerciseRow) {
                    const sets = [exerciseRow[5], exerciseRow[6], exerciseRow[7], exerciseRow[8]]
                        .filter((s: any) => s && s !== "-" && s !== undefined);
                    dataMap[idx] = sets;
                }
            });
            lastWeekData.value = dataMap;
        }
    } catch (error) {
        console.error("Failed to load last week data:", error);
    }
}

// ─── Load current session ───
async function loadCurrentSession() {
    try {
        if (dayName.value === "REST DAY") return;
        const { data } = await secureFetch(`/api/calist/get?day=${dayName.value}`);
        const currentRows = (data as any[]).filter((row: any) => parseInt(row[0]) === props.week);

        if (currentRows.length > 0) {
            const firstRow = currentRows[0];
            if (firstRow[11]) {
                sessionNote.value = firstRow[11];
                showSessionNote.value = true;
            }

            exercises.value.forEach((exercise) => {
                const savedRow = currentRows.find((row: any) => row[4] === exercise.name);
                if (savedRow) {
                    exercise.sets.forEach((set, idx) => {
                        const stored = savedRow[5 + idx];
                        set.value = parseSetValue(stored);
                    });
                    if (savedRow[10]) {
                        exercise.note = savedRow[10];
                    }
                }
            });

            if (currentRows[0][9] === "YES") {
                completed.value = true;
            }
        }
    } catch (error) {
        console.error("Failed to load current session:", error);
    }
}

// ─── Save ───
async function saveWorkout() {
    if (dayName.value === "REST DAY") return;
    if (!isAuthenticated.value) { navigateTo("/login"); return; }

    saving.value = true;
    saveError.value = "";

    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString("id-ID");
        const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

        const exercisePayload = exercises.value.map(ex => ({
            name: ex.name,
            sets: ex.sets.map(s => formatSetValue(ex, s.value)),
            note: ex.note || "",
        }));

        await secureFetch("/api/calist/save", {
            method: "POST",
            body: {
                week: props.week,
                day: dayName.value,
                date: dateStr,
                time: timeStr,
                exercises: exercisePayload,
                completed: completed.value,
                sessionNote: sessionNote.value || "",
            },
        });

        lastSaved.value = `${dateStr} ${timeStr}`;
        emit("saved");
        completed.value = false;
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

watch(() => props.day, async () => {
    initializeExercises();
    sessionNote.value = "";
    showSessionNote.value = false;
    if (dayName.value !== "REST DAY") {
        await Promise.all([loadLastWeekData(), loadCurrentSession()]);
    }
}, { immediate: true });

watch(() => props.week, () => {
    sessionNote.value = "";
    showSessionNote.value = false;
    if (dayName.value !== "REST DAY") {
        loadLastWeekData();
        loadCurrentSession();
    }
});
</script>
