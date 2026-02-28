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

                    <button
                        type="button"
                        @click="showRules = true"
                        class="text-xs font-bold bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-foreground-text flex items-center gap-1 transition-colors"
                    >
                        <Info class="w-3 h-3" />
                        <span>LOGGING RULES</span>
                    </button>
                </div>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
                <!-- ── EDIT PROGRAM BUTTON ── -->
                <button
                    v-if="isAuthenticated && exercises.length > 0"
                    @click="openProgramEditor"
                    class="flex items-center gap-2 px-4 py-2 border-2 border-separator rounded-xl font-bold text-xs uppercase tracking-widest text-foreground-text hover:border-primary hover:text-primary transition-all group"
                >
                    <Pencil class="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    Edit Program
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

                        <!-- Target reps hint (from program editor) -->
                        <div v-if="exercise.targetReps && exercise.targetReps > 0" class="inline-flex items-center gap-1.5 w-fit mb-1">
                            <span class="font-mono text-[10px] text-foreground-text/50 uppercase tracking-widest">Target:</span>
                            <span class="font-mono text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                                {{ exercise.sets.length }}×{{ exercise.targetReps }}{{ exercise.type === 'hold' ? 's' : ' reps' }}
                            </span>
                        </div>

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

                        <!-- Substitution radio buttons -->
                        <div v-if="exercise.subs" class="flex flex-wrap gap-2 mt-2">
                            <label
                                v-for="sub in exercise.subs"
                                :key="sub.value"
                                class="flex items-center gap-2 cursor-pointer group/sub"
                            >
                                <input
                                    type="radio"
                                    :name="`sub-${exIdx}`"
                                    :value="sub.value"
                                    v-model="exercise.selectedSub"
                                    class="peer hidden"
                                />
                                <span class="w-4 h-4 border-2 border-separator rounded-full flex items-center justify-center transition-colors peer-checked:border-primary">
                                    <span class="w-2 h-2 bg-primary rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                                </span>
                                <span class="font-mono text-sm text-foreground-text group-hover/sub:text-primary peer-checked:text-primary peer-checked:font-bold transition-colors">
                                    {{ sub.label }}
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
                            <span v-else>Add Note (e.g. kondisi, form cues)</span>
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
                            :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(effectiveName(exercise) + ' tutorial form calisthenics')}`"
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
                        <span v-if="lastWeekData[exIdx].savedName && lastWeekData[exIdx].savedName !== effectiveName(exercise)" class="text-primary ml-1">
                            [{{ lastWeekData[exIdx].savedName }}]
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

        <!-- ─── LOGGING RULES MODAL ─── -->
        <transition name="fade">
            <div
                v-if="showRules"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                @click.self="showRules = false"
            >
                <div class="w-full max-w-sm bg-white border-2 border-foreground-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative animate-bounce-in">
                    <button @click="showRules = false" class="absolute top-4 right-4 text-foreground-text hover:text-red-500">
                        <X class="w-6 h-6" />
                    </button>

                    <h3 class="text-xl font-black uppercase mb-4 border-b-2 border-primary w-fit">Logging Rules</h3>

                    <div class="space-y-4 font-mono text-sm">
                        <div class="bg-blue-50 p-3 rounded border border-blue-100">
                            <div class="font-bold text-blue-800 mb-1">REPS Exercises</div>
                            <p>Catat jumlah <strong>full range of motion reps</strong>.</p>
                            <p class="text-xs text-blue-600 mt-1">Ex: Pull-up 6 reps → Tulis <strong>6</strong>. Jangan hitung partial rep.</p>
                        </div>

                        <div class="bg-orange-50 p-3 rounded border border-orange-100">
                            <div class="font-bold text-orange-800 mb-1">HOLD Exercises</div>
                            <p>Catat <strong>detik hold tanpa putus</strong>.</p>
                            <p class="text-xs text-orange-600 mt-1">Ex: Planche Lean 12 detik lalu form break → Tulis <strong>12</strong>.</p>
                        </div>

                        <div class="bg-yellow-50 p-3 rounded border border-yellow-100">
                            <div class="font-bold text-yellow-800 mb-1">Substitusi Alat</div>
                            <p>Pilih versi yang lo pakai dari <strong>radio button</strong> di bawah nama exercise.</p>
                            <p class="text-xs text-yellow-600 mt-1">Data tersimpan dengan nama versi yang dipilih — AI Coach tahu bedanya.</p>
                        </div>
                    </div>

                    <button @click="showRules = false" class="w-full mt-6 py-3 bg-foreground-primary text-white font-bold uppercase rounded hover:bg-primary transition-colors">
                        Got it
                    </button>
                </div>
            </div>
        </transition>

        <!-- ─── PROGRAM EDITOR SIDEBAR ─── -->
        <ProgramEditorSidebar
            :open="showProgramEditor"
            mode="calist"
            :day="props.day"
            :exercises="sidebarExercises"
            @close="showProgramEditor = false"
            @saved="onProgramSaved"
        />
    </div>
</template>

<script setup lang="ts">
import { BedDouble, Check, MessageSquare, ChevronDown, Target, Youtube, Info, X, Pencil } from "lucide-vue-next";

// ─── UI Types ───
interface UISet { value: number; }
interface SubOption { label: string; value: string; }

interface UIExercise {
    name: string;
    type: 'reps' | 'hold';
    sets: UISet[];
    subs?: SubOption[];
    selectedSub?: string;
    note?: string;
    showNote?: boolean;
    targetReps?: number;   // from program editor
}

interface SidebarExercise {
    id: string;
    name: string;
    sets: number;
    targetReps: number;
    equipment: string[];
    type: 'reps' | 'hold';
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
const lastWeekData = ref<Record<number, { sets: string[]; savedName: string }>>({});
const sessionNote = ref("");
const showSessionNote = ref(false);
const showRules = ref(false);

// ─── Program editor state ───
const showProgramEditor = ref(false);
const sidebarExercises = ref<SidebarExercise[]>([]);

// ─── Custom program from DB ───
// Enriched format: { [day]: { exercises: [{ name, setCount, targetReps, equipment, type }] } }
const customProgram = ref<Record<string, { exercises: any[] }> | null>(null);

// ─── Program Defaults ───
interface ExerciseDef {
    name: string;
    type: 'reps' | 'hold';
    setCount: number;
    targetReps?: number;
    subs?: SubOption[];
    equipment?: string[];  // for sidebar compatibility
}

const programDefaults: Record<string, { name: string; focus: string; exercises: ExerciseDef[] }> = {
    monday: {
        name: "SENIN",
        focus: "Pull — Back Width",
        exercises: [
            { name: "Scapular Pull-up", type: "reps", setCount: 3, targetReps: 8, equipment: ["Pull-up Bar"] },
            { name: "Wide Grip Pull-up", type: "reps", setCount: 4, targetReps: 6, equipment: ["Pull-up Bar"] },
            {
                name: "Band Face Pull",
                type: "reps",
                setCount: 3,
                targetReps: 15,
                equipment: ["Band"],
                subs: [
                    { label: "Band Face Pull", value: "Band Face Pull" },
                    { label: "Scapular Pull-up (no band)", value: "Scapular Pull-up (sub)" },
                ],
            },
            { name: "Hollow Body Hold", type: "hold", setCount: 3, targetReps: 20, equipment: ["Floor"] },
        ],
    },
    wednesday: {
        name: "RABU",
        focus: "Push + Planche Foundation",
        exercises: [
            {
                name: "Planche Lean",
                type: "hold",
                setCount: 4,
                targetReps: 15,
                equipment: ["Parallettes", "Floor"],
                subs: [
                    { label: "Parallettes", value: "Planche Lean (Parallettes)" },
                    { label: "Floor (fist)", value: "Planche Lean (Floor)" },
                ],
            },
            {
                name: "Push-up (Parallettes)",
                type: "reps",
                setCount: 4,
                targetReps: 10,
                equipment: ["Parallettes", "Floor"],
                subs: [
                    { label: "Parallettes", value: "Push-up (Parallettes)" },
                    { label: "Floor Push-up", value: "Push-up (Floor)" },
                ],
            },
            { name: "Pike Push-up", type: "reps", setCount: 3, targetReps: 8, equipment: ["Floor"] },
            {
                name: "Band Lateral Raise",
                type: "reps",
                setCount: 4,
                targetReps: 15,
                equipment: ["Band"],
                subs: [
                    { label: "Band Lateral Raise", value: "Band Lateral Raise" },
                    { label: "Pike Push-up +1 set (no band)", value: "Pike Push-up (sub lateral)" },
                ],
            },
        ],
    },
    friday: {
        name: "JUMAT",
        focus: "Pull 2 + Planche Skill",
        exercises: [
            {
                name: "Tuck Planche Hold",
                type: "hold",
                setCount: 4,
                targetReps: 10,
                equipment: ["Parallettes", "Floor"],
                subs: [
                    { label: "Parallettes", value: "Tuck Planche Hold (Parallettes)" },
                    { label: "Floor (fist)", value: "Tuck Planche Hold (Floor)" },
                ],
            },
            { name: "Chin-up", type: "reps", setCount: 4, targetReps: 6, equipment: ["Pull-up Bar"] },
            {
                name: "L-sit",
                type: "hold",
                setCount: 3,
                targetReps: 10,
                equipment: ["Parallettes", "Floor"],
                subs: [
                    { label: "Parallettes", value: "L-sit (Parallettes)" },
                    { label: "Floor (tuck)", value: "L-sit (Floor tuck)" },
                ],
            },
            {
                name: "Band Hammer Curl",
                type: "reps",
                setCount: 3,
                targetReps: 12,
                equipment: ["Band"],
                subs: [
                    { label: "Band Hammer Curl", value: "Band Hammer Curl" },
                    { label: "Neutral Grip Chin-up Negatives (no band)", value: "Chin-up Negatives (sub)" },
                ],
            },
        ],
    },
    saturday: {
        name: "SABTU",
        focus: "Legs + Core",
        exercises: [
            { name: "Pistol Squat", type: "reps", setCount: 4, targetReps: 6, equipment: ["Floor"] },
            { name: "Nordic Curl", type: "reps", setCount: 3, targetReps: 5, equipment: ["Floor"] },
            { name: "Single Leg Calf Raise", type: "reps", setCount: 3, targetReps: 20, equipment: ["Floor"] },
            {
                name: "Planche Lean",
                type: "hold",
                setCount: 3,
                targetReps: 15,
                equipment: ["Parallettes", "Floor"],
                subs: [
                    { label: "Parallettes", value: "Planche Lean (Parallettes)" },
                    { label: "Floor (fist)", value: "Planche Lean (Floor)" },
                ],
            },
        ],
    },
    sunday: {
        name: "MINGGU",
        focus: "Shoulders + Arms + Wrist Rehab",
        exercises: [
            { name: "Pike Push-up (Feet Elevated)", type: "reps", setCount: 4, targetReps: 8, equipment: ["Floor"] },
            {
                name: "Band Lateral Raise",
                type: "reps",
                setCount: 4,
                targetReps: 15,
                equipment: ["Band"],
                subs: [
                    { label: "Band Lateral Raise", value: "Band Lateral Raise" },
                    { label: "Pike Push-up +1 set (no band)", value: "Pike Push-up (sub lateral)" },
                ],
            },
            {
                name: "Band Curl",
                type: "reps",
                setCount: 3,
                targetReps: 12,
                equipment: ["Band"],
                subs: [
                    { label: "Band Curl", value: "Band Curl" },
                    { label: "Chin-up Negatives (no band)", value: "Chin-up Negatives (sub curl)" },
                ],
            },
            { name: "Wrist Conditioning", type: "hold", setCount: 3, targetReps: 30, equipment: ["Floor"] },
        ],
    },
};

// ─── Effective templates (custom overrides defaults) ───
const effectiveTemplates = computed(() => {
    if (!customProgram.value) return programDefaults;
    const result: typeof programDefaults = {};

    for (const [day, template] of Object.entries(programDefaults)) {
        const custom = customProgram.value[day];
        if (!custom?.exercises?.length) {
            result[day] = template;
            continue;
        }
        result[day] = {
            ...template,
            exercises: custom.exercises.map((customEx: any, idx: number) => {
                const def = template.exercises[idx];
                if (!def) {
                    // New exercise added via sidebar
                    return {
                        name: customEx.name,
                        type: customEx.type || 'reps',
                        setCount: customEx.setCount ?? customEx.sets ?? 3,
                        targetReps: customEx.targetReps ?? 10,
                        // equipment → subs: each equipment string becomes a sub option
                        subs: customEx.equipment?.length > 0
                            ? customEx.equipment.map((eq: string) => ({ label: eq, value: eq }))
                            : undefined,
                        equipment: customEx.equipment ?? [],
                    };
                }
                return {
                    ...def,
                    name: customEx.name || def.name,
                    type: customEx.type || def.type,
                    setCount: customEx.setCount ?? customEx.sets ?? def.setCount,
                    targetReps: customEx.targetReps ?? def.targetReps,
                    // equipment from sidebar overrides subs if provided
                    subs: customEx.equipment?.length > 0
                        ? customEx.equipment.map((eq: string) => ({ label: eq, value: eq }))
                        : def.subs,
                    equipment: customEx.equipment ?? def.equipment ?? [],
                };
            }),
        };
    }
    return result;
});

const dayName  = computed(() => effectiveTemplates.value[props.day]?.name  || "REST DAY");
const dayFocus = computed(() => effectiveTemplates.value[props.day]?.focus || "Recover");

// ─── Open program editor ───
function openProgramEditor() {
    const template = effectiveTemplates.value[props.day];
    if (!template) return;

    sidebarExercises.value = template.exercises.map((def, idx) => ({
        id: `ex-calist-${props.day}-${idx}`,
        name: def.name,
        sets: def.setCount,
        targetReps: def.targetReps ?? 10,
        // subs → equipment for sidebar (show sub options as equipment tags)
        equipment: def.equipment ?? (def.subs ? def.subs.map(s => s.label) : []),
        type: def.type,
    }));
    showProgramEditor.value = true;
}

// ─── When sidebar saves ───
function onProgramSaved(updatedExercises: SidebarExercise[]) {
    if (!customProgram.value) customProgram.value = {};
    customProgram.value[props.day] = {
        exercises: updatedExercises.map(ex => ({
            name: ex.name,
            setCount: ex.sets,
            targetReps: ex.targetReps,
            equipment: ex.equipment,
            type: ex.type,
        })),
    };
    initializeExercises();
    showProgramEditor.value = false;
}

// ─── Helpers ───
function effectiveName(ex: UIExercise): string {
    return ex.selectedSub || ex.name;
}

function allPossibleNames(ex: UIExercise | ExerciseDef): string[] {
    const base = ex.name;
    const subs = (ex as any).subs as SubOption[] | undefined;
    if (!subs) return [base];
    return [base, ...subs.map((s: SubOption) => s.value)];
}

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
    const template = effectiveTemplates.value[props.day];
    if (!template) { exercises.value = []; return; }
    exercises.value = template.exercises.map((def) => ({
        name: def.name,
        type: def.type,
        sets: Array(def.setCount).fill(null).map(() => ({ value: 0 })),
        subs: def.subs,
        selectedSub: def.subs ? def.subs[0].value : undefined,
        note: "",
        showNote: false,
        targetReps: def.targetReps,
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
            const template = effectiveTemplates.value[props.day];
            const dataMap: Record<number, { sets: string[]; savedName: string }> = {};

            template?.exercises.forEach((def, idx) => {
                const possibleNames = allPossibleNames(def);
                let exerciseRow: any = null;
                for (const n of possibleNames) {
                    exerciseRow = lastWeekRows.find((row: any) => row[4] === n);
                    if (exerciseRow) break;
                }
                if (exerciseRow) {
                    const sets = [exerciseRow[5], exerciseRow[6], exerciseRow[7], exerciseRow[8]]
                        .filter((s: any) => s && s !== "-" && s !== undefined);
                    dataMap[idx] = { sets, savedName: exerciseRow[4] };
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
            if (firstRow[11]) { sessionNote.value = firstRow[11]; showSessionNote.value = true; }

            exercises.value.forEach((exercise) => {
                const possibleNames = allPossibleNames(exercise);
                let savedRow: any = null;
                for (const n of possibleNames) {
                    savedRow = currentRows.find((row: any) => row[4] === n);
                    if (savedRow) break;
                }
                if (savedRow) {
                    if (exercise.subs) {
                        const matchedSub = exercise.subs.find(s => s.value === savedRow[4]);
                        if (matchedSub) exercise.selectedSub = matchedSub.value;
                    }
                    exercise.sets.forEach((set, idx) => {
                        set.value = parseSetValue(savedRow[5 + idx]);
                    });
                    if (savedRow[10]) exercise.note = savedRow[10];
                }
            });
            if (currentRows[0][9] === "YES") completed.value = true;
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
            name: effectiveName(ex),
            sets: ex.sets.map(s => formatSetValue(ex, s.value)),
            note: ex.note || "",
        }));

        await secureFetch("/api/calist/save", {
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

// ─── Lifecycle ───
onMounted(async () => {
    try {
        // BUG-04 FIX: pass ?mode=calist to avoid 400
        const res = await $fetch('/api/program/get?mode=calist') as { config: any; start_date: string | null };
        if (res.config) customProgram.value = res.config;
    } catch { /* fall through to defaults */ }

    initializeExercises();
    if (dayName.value !== "REST DAY") {
        await Promise.all([loadLastWeekData(), loadCurrentSession()]);
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
