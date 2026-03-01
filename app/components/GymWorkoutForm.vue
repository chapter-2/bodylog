<template>
    <div class="inner border-x border-separator bg-white min-h-[60vh]">

        <div class="p-8 border-b border-separator flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <span class="font-handwriting text-primary text-xl">Today's Session</span>
                <h2 class="text-4xl md:text-5xl font-black uppercase mt-1">
                    {{ dayName }}
                </h2>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                    <p class="font-mono text-sm text-foreground-text">Focus: {{ dayFocus }}</p>

                    <button @click="showRules = true" class="text-xs font-bold bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-foreground-text flex items-center gap-1 transition-colors">
                        <Info class="w-3 h-3" />
                        <span>LOGGING RULES</span>
                    </button>
                </div>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
                <button
                    id="tour-edit-btn"
                    v-if="exercises.length > 0"
                    @click="handleEditClick"
                    class="flex items-center gap-2 px-4 py-2 border-2 border-separator rounded-xl font-bold text-xs uppercase tracking-widest text-foreground-text hover:border-primary hover:text-primary transition-all group"
                >
                    <Lock v-if="!isAuthenticated" class="w-4 h-4 opacity-50" />
                    <Settings2 v-else class="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span class="hidden md:inline">Edit Program</span>
                    <span class="md:hidden">Edit</span>
                </button>

                <div v-if="lastSaved" class="px-4 py-2 border border-separator rounded-full bg-background flex items-center gap-2">
                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span class="font-mono text-xs uppercase tracking-widest">Saved: {{ lastSaved }}</span>
                </div>
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

            <div class="p-6 md:p-8 bg-[#fffef5] border-b border-yellow-200">
                <button
                    type="button"
                    @click="showSessionNote = !showSessionNote"
                    class="text-sm font-bold text-foreground-primary hover:text-primary flex items-center gap-2 w-full transition-colors"
                >
                    <MessageSquare class="w-4 h-4 text-yellow-600" />
                    <span>Session Notes</span>
                    <span v-if="sessionNote" class="text-xs font-mono text-primary ml-auto">Has note ✓</span>
                    <span v-else class="text-xs font-mono text-foreground-text/40 ml-auto">e.g. injury update, energy level</span>
                    <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showSessionNote }" />
                </button>

                <div v-if="showSessionNote || sessionNote" class="mt-3">
                    <textarea
                        v-model="sessionNote"
                        rows="2"
                        placeholder="Kenapa hari ini beda? Cerita singkat tentang kondisi lo."
                        class="w-full text-sm font-mono bg-yellow-50 border border-yellow-300 rounded p-3 text-foreground-text focus:outline-none focus:border-yellow-500 placeholder:text-gray-400 resize-none"
                    ></textarea>
                    <p class="text-xs font-mono text-foreground-text/40 mt-1">
                        Ini yang AI Coach baca untuk ngerti konteks lo hari ini.
                    </p>
                </div>
            </div>

            <div
                v-for="(exercise, exIdx) in exercises"
                :key="exIdx"
                class="p-6 md:p-8 hover:bg-[#fcfbf7] transition-colors group"
            >
                <div class="flex justify-between items-start mb-4 gap-4">
                    <div class="flex flex-col gap-1 w-full">

                        <div v-if="exercise.targetReps && exercise.targetReps > 0" class="inline-flex items-center gap-1.5 w-fit mb-1">
                            <span class="font-mono text-[10px] text-foreground-text/50 uppercase tracking-widest">Target:</span>
                            <span class="font-mono text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                                {{ exercise.sets.length }}×{{ exercise.targetReps }} reps
                            </span>
                        </div>

                        <h4 class="text-2xl font-bold group-hover:text-primary transition-colors uppercase leading-tight">
                            {{ exercise.variants ? exercise.name : exercise.name }}
                        </h4>

                        <div v-if="exercise.variants && exercise.variants.length > 0" class="flex flex-wrap gap-2 mt-2">
                            <label
                                v-for="variant in exercise.variants"
                                :key="variant"
                                class="flex items-center gap-2 cursor-pointer group/variant"
                            >
                                <input
                                    type="radio"
                                    :name="`variant-${exIdx}`"
                                    :value="variant"
                                    v-model="exercise.selectedVariant"
                                    class="peer hidden"
                                />
                                <span class="w-4 h-4 border-2 border-separator rounded-full flex items-center justify-center transition-colors peer-checked:border-primary">
                                    <span class="w-2 h-2 bg-primary rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                                </span>
                                <span class="font-mono text-sm text-foreground-text group-hover/variant:text-primary peer-checked:text-primary peer-checked:font-bold transition-colors">
                                    {{ variant }}
                                </span>
                            </label>
                        </div>

                        <button
                            type="button"
                            @click="toggleNote(exIdx)"
                            class="text-xs font-mono text-foreground-text/60 hover:text-primary flex items-center gap-1 w-fit mt-1"
                        >
                            <MessageSquare class="w-3 h-3" />
                            <span v-if="exercise.note" class="text-primary font-bold">Edit Note</span>
                            <span v-else>Add Note (e.g. Gym crowded)</span>
                        </button>

                        <div v-if="exercise.showNote || exercise.note" class="mt-2">
                            <input
                                v-model="exercise.note"
                                type="text"
                                placeholder="Kenapa ganti alat? Kenapa beban turun?"
                                class="w-full text-sm font-mono bg-yellow-50 border border-yellow-200 rounded p-2 text-foreground-text focus:outline-none focus:border-yellow-400 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div class="flex flex-col items-end gap-2 shrink-0">
                        <span class="font-mono text-xs border border-separator px-2 py-1 rounded bg-white whitespace-nowrap">
                            {{ exercise.sets.length }} SETS
                        </span>
                        <a
                            :href="`https://www.youtube.com/results?search_query=${encodeURIComponent((exercise.selectedVariant || exercise.name) + ' form tutorial')}`"
                            target="_blank"
                            class="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                            <Youtube class="w-3 h-3" />
                            <span class="font-bold text-[10px] tracking-wider">WATCH</span>
                        </a>
                    </div>
                </div>

                <div v-if="lastWeekData[exIdx]" class="mb-4 p-3 bg-background rounded border border-separator">
                    <span class="font-mono text-xs uppercase tracking-wider text-foreground-text opacity-70">
                        Last Week (W{{ week - 1 }}):
                        <span v-if="lastWeekData[exIdx].exerciseName && lastWeekData[exIdx].exerciseName !== (exercise.selectedVariant || exercise.name)" class="text-primary ml-1">
                            [{{ lastWeekData[exIdx].exerciseName }}]
                        </span>
                    </span>
                    <div class="flex gap-2 mt-1 flex-wrap">
                        <span
                            v-for="(set, idx) in lastWeekData[exIdx].sets"
                            :key="idx"
                            class="font-mono text-xs bg-white px-2 py-1 rounded border border-separator"
                        >
                            {{ set }}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div v-for="(set, setIdx) in exercise.sets" :key="setIdx" class="flex items-center gap-2">
                        <span class="font-mono text-xs text-primary w-6 pt-1">S{{ setIdx + 1 }}</span>
                        <div class="relative w-full">
                            <input
                                v-model.number="set.weight"
                                type="number" step="0.5" placeholder="KG"
                                class="w-full bg-transparent border-b border-separator py-1 font-bold text-center focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <span class="text-separator text-sm">×</span>
                        <div class="relative w-full">
                            <input
                                v-model.number="set.reps"
                                type="number" placeholder="REPS"
                                class="w-full bg-transparent border-b border-separator py-1 font-bold text-center focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-6 md:p-8 bg-primary/5 border-b border-primary/20">
                <div class="flex items-start gap-3">
                    <Target class="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p class="font-bold text-sm text-foreground-primary">Progressive Overload Tracker</p>
                        <p class="font-mono text-xs text-foreground-text opacity-70 mt-1">
                            Fokus pada 1-2 main compound movement. Tambah 1-2.5kg atau 1-2 reps dari minggu sebelumnya. Jangan korbankan form demi beban.
                        </p>
                    </div>
                </div>
            </div>

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
                        {{ saving ? "Saving..." : "Save Workout" }}
                    </button>
                </div>
                <div v-if="saveError" class="mt-4 text-red-500 font-bold text-center border border-red-200 bg-red-50 p-2 rounded">
                    {{ saveError }}
                </div>
            </div>
        </form>

        <transition name="fade">
            <div v-if="showRules" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="showRules = false">
                <div class="w-full max-w-sm bg-white border-2 border-foreground-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative animate-bounce-in">
                    <button @click="showRules = false" class="absolute top-4 right-4 text-foreground-text hover:text-red-500">
                        <X class="w-6 h-6" />
                    </button>
                    <h3 class="text-xl font-black uppercase mb-4 border-b-2 border-primary w-fit">Logging Rules</h3>
                    <div class="space-y-4 font-mono text-sm">
                        <div class="bg-blue-50 p-3 rounded border border-blue-100">
                            <div class="font-bold text-blue-800 mb-1">Dumbbells</div>
                            <p>Catat berat <strong>PER TANGAN</strong> (Satu sisi).</p>
                            <p class="text-xs text-blue-600 mt-1">Ex: Curl pake 10kg kiri & 10kg kanan → Tulis <strong>10</strong>.</p>
                        </div>
                        <div class="bg-green-50 p-3 rounded border border-green-100">
                            <div class="font-bold text-green-800 mb-1">Barbell / Smith</div>
                            <p>Catat <strong>TOTAL BERAT</strong> (Plate).</p>
                            <p class="text-xs text-green-600 mt-1">Ex: Plate 10kg kiri/kanan → Tulis <strong>20</strong>.</p>
                        </div>
                        <div class="bg-orange-50 p-3 rounded border border-orange-100">
                            <div class="font-bold text-orange-800 mb-1">Cable / Machine</div>
                            <p>Catat <strong>ANGKA DI TUMPUKAN</strong>.</p>
                        </div>
                    </div>
                    <button @click="showRules = false" class="w-full mt-6 py-3 bg-foreground-primary text-white font-bold uppercase rounded hover:bg-primary transition-colors">
                        Got it
                    </button>
                </div>
            </div>
        </transition>

        <ProgramEditorSidebar
            :open="showProgramEditor"
            mode="gym"
            :day="props.day"
            :exercises="sidebarExercises"
            @close="showProgramEditor = false"
            @saved="onProgramSaved"
        />
    </div>
</template>

<script setup lang="ts">
import type { Exercise } from "~/types";
import { Youtube, BedDouble, Check, Info, X, MessageSquare, ChevronDown, Settings2, Lock, Target } from "lucide-vue-next";

interface UIExercise extends Exercise {
    variants?: string[];
    selectedVariant?: string;
    note?: string;
    showNote?: boolean;
    targetReps?: number;
}

interface SidebarExercise {
    id: string;
    name: string;
    sets: number;
    targetReps: number;
    equipment: string[];
    type: 'reps' | 'hold';
}

const props = defineProps<{ week: number; day: string; }>();
const emit = defineEmits(["saved"]);
const { isAuthenticated, secureFetch } = useAuth();
const route = useRoute();

const exercises = ref<UIExercise[]>([]);
const completed = ref(false);
const saving = ref(false);
const lastSaved = ref("");
const saveError = ref("");
const lastWeekData = ref<Record<number, { sets: string[]; exerciseName: string }>>({});
const showRules = ref(false);
const sessionNote = ref("");
const showSessionNote = ref(false);

const showProgramEditor = ref(false);
const sidebarExercises = ref<SidebarExercise[]>([]);

const customProgram = ref<Record<string, { exercises?: any[], name?: string, focus?: string, isRest?: boolean }> | null>(null);


const programDefaults: Record<string, { isRest: boolean; name: string; focus: string; exercises: { name: string; sets: number; targetReps: number; equipment: string[] }[] }> = {
    monday: { isRest: false, name: "FULL BODY A", focus: "Squat, Bench, Row", exercises: [
        { name: "Barbell Squat", sets: 4, targetReps: 8, equipment: ["Barbell", "Smith Machine"] },
        { name: "Barbell Bench Press", sets: 4, targetReps: 8, equipment: ["Barbell", "Dumbbell"] },
        { name: "Barbell Row", sets: 3, targetReps: 10, equipment: ["Barbell", "Machine"] },
        { name: "Overhead Press", sets: 3, targetReps: 10, equipment: ["Barbell", "Dumbbell"] },
        { name: "Bicep Curl", sets: 3, targetReps: 12, equipment: ["Cable", "Dumbbell"] },
    ]},
    tuesday: { isRest: true, name: "FULL BODY B", focus: "Deadlift, OHP, Pull-down", exercises: [
        { name: "Deadlift / RDL", sets: 4, targetReps: 8, equipment: ["Barbell", "Dumbbell"] },
        { name: "Incline Dumbbell Press", sets: 3, targetReps: 10, equipment: ["Dumbbell", "Barbell"] },
        { name: "Lat Pulldown", sets: 3, targetReps: 10, equipment: ["Cable", "Machine"] },
        { name: "Lateral Raise", sets: 3, targetReps: 15, equipment: ["Dumbbell", "Cable"] },
        { name: "Tricep Pushdown", sets: 3, targetReps: 12, equipment: ["Cable"] },
    ]},
    wednesday: { isRest: false, name: "FULL BODY C", focus: "Leg Press, Dips, Cable Row", exercises: [
        { name: "Leg Press", sets: 4, targetReps: 10, equipment: ["Machine"] },
        { name: "Dips / Machine Press", sets: 3, targetReps: 10, equipment: ["Machine", "Bodyweight"] },
        { name: "Seated Cable Row", sets: 3, targetReps: 10, equipment: ["Cable", "Machine"] },
        { name: "Leg Curl", sets: 3, targetReps: 12, equipment: ["Machine"] },
        { name: "Face Pull", sets: 3, targetReps: 15, equipment: ["Cable"] },
    ]},
    thursday: { isRest: true, name: "FULL BODY A", focus: "Squat, Bench, Row", exercises: [
        { name: "Barbell Squat", sets: 4, targetReps: 8, equipment: ["Barbell", "Smith Machine"] },
        { name: "Barbell Bench Press", sets: 4, targetReps: 8, equipment: ["Barbell", "Dumbbell"] },
        { name: "Barbell Row", sets: 3, targetReps: 10, equipment: ["Barbell", "Machine"] },
        { name: "Overhead Press", sets: 3, targetReps: 10, equipment: ["Barbell", "Dumbbell"] },
        { name: "Bicep Curl", sets: 3, targetReps: 12, equipment: ["Cable", "Dumbbell"] },
    ]},
    friday: { isRest: false, name: "FULL BODY B", focus: "Deadlift, OHP, Pull-down", exercises: [
        { name: "Deadlift / RDL", sets: 4, targetReps: 8, equipment: ["Barbell", "Dumbbell"] },
        { name: "Incline Dumbbell Press", sets: 3, targetReps: 10, equipment: ["Dumbbell", "Barbell"] },
        { name: "Lat Pulldown", sets: 3, targetReps: 10, equipment: ["Cable", "Machine"] },
        { name: "Lateral Raise", sets: 3, targetReps: 15, equipment: ["Dumbbell", "Cable"] },
        { name: "Tricep Pushdown", sets: 3, targetReps: 12, equipment: ["Cable"] },
    ]},
    saturday: { isRest: true, name: "FULL BODY C", focus: "Leg Press, Dips, Cable Row", exercises: [
        { name: "Leg Press", sets: 4, targetReps: 10, equipment: ["Machine"] },
        { name: "Dips / Machine Press", sets: 3, targetReps: 10, equipment: ["Machine", "Bodyweight"] },
        { name: "Seated Cable Row", sets: 3, targetReps: 10, equipment: ["Cable", "Machine"] },
        { name: "Leg Curl", sets: 3, targetReps: 12, equipment: ["Machine"] },
        { name: "Face Pull", sets: 3, targetReps: 15, equipment: ["Cable"] },
    ]},
    sunday: { isRest: true, name: "FULL BODY D", focus: "Accessories & Core", exercises: [
        { name: "Bulgarian Split Squat", sets: 3, targetReps: 10, equipment: ["Dumbbell", "Bodyweight"] },
        { name: "Push-up", sets: 3, targetReps: 15, equipment: ["Bodyweight"] },
        { name: "Pull-up", sets: 3, targetReps: 8, equipment: ["Bodyweight", "Machine"] },
        { name: "Hanging Leg Raise", sets: 3, targetReps: 12, equipment: ["Bodyweight"] },
        { name: "Calf Raise", sets: 3, targetReps: 15, equipment: ["Machine", "Dumbbell"] },
    ]}
};

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const effectiveTemplates = computed(() => {
    const result: Record<string, any> = {};
    for (const day of ALL_DAYS) {
        const def = programDefaults[day] || { name: "REST DAY", focus: "Recover", exercises: [], isRest: true };
        const custom = customProgram.value?.[day];

        // Penentuan Rest mutlak berdasarkan konfigurasi custom, atau default jika belum ada
        const isRest = custom?.isRest !== undefined ? custom.isRest : def.isRest;

        if (isRest) {
            result[day] = { name: "REST DAY", focus: "Recover", exercises: [] };
        } else if (custom) {
            result[day] = {
                name: custom.name || def.name,
                focus: custom.focus || def.focus,
                exercises: custom.exercises && custom.exercises.length > 0 ? custom.exercises : def.exercises || [],
            };
        } else {
            result[day] = def;
        }
    }
    return result;
});

const dayName  = computed(() => effectiveTemplates.value[props.day]?.name  || "REST DAY");
const dayFocus = computed(() => effectiveTemplates.value[props.day]?.focus || "Recover");

function handleEditClick() {
    if (!isAuthenticated.value) {
        alert("PREVIEW MODE: Silakan login untuk mengkustomisasi program dan alat.");
        navigateTo('/login');
        return;
    }
    openProgramEditor();
}

function openProgramEditor() {
    const template = effectiveTemplates.value[props.day];
    if (!template) return;
    sidebarExercises.value = template.exercises.map((ex: any, idx: number) => ({
        id: `ex-${props.day}-${idx}-${ex.name.slice(0, 5)}`,
        name: ex.name,
        sets: ex.sets,
        targetReps: ex.targetReps,
        equipment: [...ex.equipment],
        type: 'reps' as const,
    }));
    showProgramEditor.value = true;
}

function onProgramSaved(updatedExercises: SidebarExercise[]) {
    if (!customProgram.value) customProgram.value = {};
    customProgram.value[props.day] = {
        ...customProgram.value[props.day], 
        exercises: updatedExercises.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            targetReps: ex.targetReps,
            equipment: ex.equipment,
        })),
    };
    initializeExercises();
    showProgramEditor.value = false;
}

function parseVariants(name: string, equipment: string[]): string[] | null {
    if (equipment && equipment.length > 0) return equipment;
    if (name.includes(" / ")) return name.split(" / ").map(v => v.trim());
    return null;
}

function effectiveName(ex: UIExercise): string {
    return ex.selectedVariant || ex.name;
}

function toggleNote(index: number) {
    exercises.value[index].showNote = !exercises.value[index].showNote;
}

function initializeExercises() {
    const template = effectiveTemplates.value[props.day];
    if (!template) {
        exercises.value = [];
        return;
    }
    exercises.value = template.exercises.map((ex: any) => {
        const variants = parseVariants(ex.name, ex.equipment);
        return {
            name: ex.name,
            variants: variants || undefined,
            selectedVariant: variants ? variants[0] : undefined,
            sets: Array(ex.sets).fill(null).map(() => ({ weight: 0, reps: 0 })),
            note: "",
            showNote: false,
            targetReps: ex.targetReps,
        };
    });
}

async function loadLastWeekData() {
    if (props.week <= 1) { lastWeekData.value = {}; return; }
    try {
        if (dayName.value === "REST DAY") return;
        const { data } = await secureFetch(`/api/gym/get?day=${dayName.value}`);
        const lastWeekWorkouts = data.filter((row: any) => parseInt(row[0]) === props.week - 1);
        if (lastWeekWorkouts.length > 0) {
            const template = effectiveTemplates.value[props.day];
            const dataMap: Record<number, { sets: string[]; exerciseName: string }> = {};
            template?.exercises.forEach((templateEx: any, idx: number) => {
                const variants = parseVariants(templateEx.name, templateEx.equipment);
                let exerciseRow: any = null;
                if (variants) {
                    for (const v of variants) {
                        exerciseRow = lastWeekWorkouts.find((row: any) => row[4] === v);
                        if (exerciseRow) break;
                    }
                    if (!exerciseRow) exerciseRow = lastWeekWorkouts.find((row: any) => row[4] === templateEx.name);
                } else {
                    exerciseRow = lastWeekWorkouts.find((row: any) => row[4] === templateEx.name);
                }
                if (exerciseRow) {
                    const sets = [exerciseRow[5], exerciseRow[6], exerciseRow[7], exerciseRow[8]]
                        .filter((s: any) => s && s !== "-" && s !== undefined);
                    dataMap[idx] = { sets, exerciseName: exerciseRow[4] };
                }
            });
            lastWeekData.value = dataMap;
        }
    } catch (error) { console.error("Failed to load last week data:", error); }
}

async function loadCurrentSession() {
    try {
        if (dayName.value === "REST DAY") return;
        const { data } = await secureFetch(`/api/gym/get?day=${dayName.value}`);
        const currentSessionRows = data.filter((row: any) => parseInt(row[0]) === props.week);
        if (currentSessionRows.length > 0) {
            const firstRow = currentSessionRows[0];
            if (firstRow[11]) { sessionNote.value = firstRow[11]; showSessionNote.value = true; }
            exercises.value.forEach((exercise) => {
                const variants = exercise.variants;
                let savedRow: any = null;
                if (variants) {
                    for (const v of variants) {
                        savedRow = currentSessionRows.find((row: any) => row[4] === v);
                        if (savedRow) break;
                    }
                    if (!savedRow) savedRow = currentSessionRows.find((row: any) => row[4] === exercise.name);
                } else {
                    savedRow = currentSessionRows.find((row: any) => row[4] === exercise.name);
                }
                if (savedRow) {
                    if (variants && variants.includes(savedRow[4])) exercise.selectedVariant = savedRow[4];
                    exercise.sets.forEach((set, idx) => {
                        const setString = savedRow[5 + idx];
                        if (setString && setString !== "-") {
                            const parts = setString.split("×");
                            if (parts.length === 2) {
                                set.weight = parseFloat(parts[0].replace("kg", "").trim()) || 0;
                                set.reps   = parseFloat(parts[1].trim()) || 0;
                            }
                        }
                    });
                    if (savedRow[10]) exercise.note = savedRow[10];
                }
            });
            if (currentSessionRows[0][9] === "YES") completed.value = true;
        }
    } catch (error) { console.error("Failed to load current session:", error); }
}

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
            name: effectiveName(ex),
            templateName: ex.name,
            sets: ex.sets,
            note: ex.note || "",
        }));
        await secureFetch("/api/gym/save", {
            method: "POST",
            body: {
                week: props.week, day: dayName.value, date: dateStr, time: timeStr,
                exercises: exercisePayload, completed: completed.value, sessionNote: sessionNote.value || "",
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

onMounted(async () => {
    try {
        const res = await secureFetch('/api/program/get?mode=gym') as { config: any; start_date: string | null };
        if (res.config) customProgram.value = res.config;
    } catch { /* fall through to defaults */ }
    
    initializeExercises();
    if (dayName.value !== "REST DAY") {
        await Promise.all([loadLastWeekData(), loadCurrentSession()]);
    }

    if (route.query.tour === 'editor') {
        setTimeout(() => {
            openProgramEditor();
        }, 500);
    }
});

watch(() => props.day, async () => {
    initializeExercises();
    sessionNote.value = "";
    showSessionNote.value = false;
    if (dayName.value !== "REST DAY") {
        await Promise.all([loadLastWeekData(), loadCurrentSession()]);
    }
});

watch(() => props.week, () => {
    sessionNote.value = "";
    showSessionNote.value = false;
    if (dayName.value !== "REST DAY") {
        loadLastWeekData();
        loadCurrentSession();
    }
});

watch(() => route.query.tour, (newVal) => {
    if (newVal === 'step5') {
        setTimeout(() => {
            openProgramEditor();
        }, 100);
    }
}, { immediate: true });
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes bounceIn {
    0%   { transform: scale(0.9); opacity: 0; }
    50%  { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in { animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>
