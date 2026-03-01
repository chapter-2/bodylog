<template>
    <transition name="backdrop-fade">
        <div
            v-if="open"
            class="fixed inset-0 z-[90] bg-black/60 md:hidden"
            @click="handleClose"
        />
    </transition>

    <transition :name="isMobile ? 'sheet-slide' : 'drawer-slide'">
        <div
            id="program-editor-sidebar"
            v-if="open"
            :class="[
                'fixed z-[100] bg-white flex flex-col overflow-hidden',
                // Mobile: bottom sheet
                'bottom-0 left-0 right-0 max-h-[92vh] rounded-t-2xl border-t-2 border-foreground-primary',
                // Desktop: right side drawer
                'md:bottom-0 md:top-0 md:left-auto md:right-0 md:w-[380px] md:max-h-full md:rounded-none md:border-t-0 md:border-l-2',
                'shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.08)] md:shadow-[-8px_0px_40px_rgba(0,0,0,0.15)]',
            ]"
        >
            <div class="flex justify-center pt-3 pb-1 md:hidden">
                <div class="w-10 h-1 bg-separator rounded-full"></div>
            </div>

            <div class="px-6 py-4 border-b-2 border-foreground-primary flex items-center justify-between shrink-0 bg-[#fcfbf7]">
                <div>
                    <p class="font-mono text-[10px] uppercase tracking-widest text-primary">
                        {{ mode === 'gym' ? '🏋️ Gym' : '🤸 Calist' }} · {{ dayDisplayName }}
                    </p>
                    <h2 class="text-xl font-black uppercase text-foreground-primary leading-tight">Edit Program</h2>
                </div>
                <button @click="handleClose" class="p-2 hover:text-red-500 transition-colors">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <transition name="indicator-slide">
                <div
                    v-if="activePaletteItem"
                    class="mx-4 mt-3 mb-0 px-4 py-2.5 bg-primary text-white rounded-xl flex items-center gap-3 text-sm shrink-0"
                >
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span class="font-bold text-xs uppercase tracking-widest">
                        {{ activePaletteItem.type === 'scheme'
                            ? `Apply ${activePaletteItem.label} to card…`
                            : `Add "${activePaletteItem.value}" to card…`
                        }}
                    </span>
                    <button @click="activePaletteItem = null" class="ml-auto font-mono text-white/70 hover:text-white text-xs">
                        ✕ cancel
                    </button>
                </div>
            </transition>

            <div class="flex-1 overflow-y-auto overscroll-contain">

                <div class="p-5 pb-2">
                    <div class="flex items-center justify-between mb-3">
                        <p class="font-mono text-[10px] uppercase tracking-widest text-foreground-text opacity-70">
                            Exercises · drag to reorder
                        </p>
                        <span class="font-mono text-[10px] text-foreground-text opacity-40">
                            {{ localExercises.length }} total
                        </span>
                    </div>

                    <div ref="exerciseListRef" class="space-y-2">
                        <div
                            v-for="(ex, idx) in localExercises"
                            :key="ex.id"
                            :data-id="ex.id"
                            :class="[
                                'group relative border-2 rounded-xl transition-all cursor-default',
                                activePaletteItem
                                    ? 'border-primary/40 hover:border-primary hover:bg-primary/5 cursor-pointer'
                                    : 'border-separator hover:border-foreground-primary/30',
                                hoveredCardIdx === idx && activePaletteItem
                                    ? 'border-primary bg-primary/5 scale-[1.01]'
                                    : '',
                            ]"
                            @mouseenter="hoveredCardIdx = idx"
                            @mouseleave="hoveredCardIdx = null"
                            @click="applyPaletteToCard(idx)"
                        >
                            <div
                                v-if="activePaletteItem && hoveredCardIdx === idx"
                                class="absolute inset-0 rounded-xl bg-primary/10 flex items-center justify-center pointer-events-none z-10"
                            >
                                <span class="font-bold text-primary text-sm uppercase tracking-widest">
                                    {{ activePaletteItem.type === 'scheme' ? '⊕ Apply Scheme' : '⊕ Add Equipment' }}
                                </span>
                            </div>

                            <div class="flex items-start gap-3 p-3">
                                <div class="drag-handle flex flex-col gap-0.5 pt-1.5 cursor-grab active:cursor-grabbing shrink-0 opacity-40 group-hover:opacity-80 transition-opacity">
                                    <span class="w-4 h-0.5 bg-foreground-primary rounded block"></span>
                                    <span class="w-4 h-0.5 bg-foreground-primary rounded block"></span>
                                    <span class="w-4 h-0.5 bg-foreground-primary rounded block"></span>
                                </div>

                                <div class="flex-1 min-w-0">
                                    <input
                                        v-model="ex.name"
                                        type="text"
                                        class="w-full font-bold text-sm bg-transparent border-b border-transparent focus:border-primary focus:outline-none transition-colors text-foreground-primary uppercase py-0.5 placeholder:text-separator"
                                        placeholder="Exercise name"
                                        @click.stop
                                    />

                                    <div class="flex flex-wrap items-center gap-1.5 mt-2">
                                        <span class="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">
                                            {{ ex.sets }}×{{ ex.targetReps === 0 ? '?' : ex.targetReps }}
                                            <span v-if="ex.type === 'hold'" class="text-orange-500">s</span>
                                        </span>

                                        <button
                                            v-if="mode === 'calist'"
                                            @click.stop="ex.type = ex.type === 'hold' ? 'reps' : 'hold'"
                                            :class="[
                                                'font-mono text-[10px] font-bold px-2 py-0.5 rounded border transition-colors',
                                                ex.type === 'hold'
                                                    ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                                                    : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
                                            ]"
                                            title="Click to toggle between HOLD and REPS"
                                        >
                                            {{ ex.type === 'hold' ? '⏱ HOLD' : '🔄 REPS' }}
                                        </button>

                                        <span
                                            v-for="(eq, eqIdx) in ex.equipment"
                                            :key="eqIdx"
                                            class="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-gray-100 text-foreground-text rounded border border-separator"
                                        >
                                            {{ eq }}
                                            <button
                                                class="hover:text-red-500 transition-colors ml-0.5"
                                                @click.stop="removeEquipment(idx, eqIdx)"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    </div>
                                </div>

                                <button
                                    @click.stop="removeExercise(idx)"
                                    class="shrink-0 p-1.5 text-separator hover:text-red-500 transition-colors mt-0.5"
                                    title="Remove exercise"
                                >
                                    <Trash2 class="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <div v-if="localExercises.length === 0" class="py-8 text-center border-2 border-dashed border-separator rounded-xl">
                            <p class="font-mono text-xs text-foreground-text opacity-50">No exercises yet. Add one below.</p>
                        </div>
                    </div>

                    <div class="mt-3">
                        <div v-if="showAddInput" class="flex gap-2">
                            <input
                                ref="addInputRef"
                                v-model="newExerciseName"
                                type="text"
                                placeholder="Exercise name…"
                                class="flex-1 bg-white border-2 border-primary rounded-lg px-3 py-2 text-sm font-bold focus:outline-none uppercase"
                                @keydown.enter="confirmAddExercise"
                                @keydown.escape="showAddInput = false"
                            />
                            <button
                                @click="confirmAddExercise"
                                class="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg"
                            >
                                Add
                            </button>
                            <button
                                @click="showAddInput = false"
                                class="px-3 py-2 border border-separator text-foreground-text text-xs rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <button
                            v-else
                            @click="openAddInput"
                            class="w-full py-2.5 border-2 border-dashed border-separator rounded-xl text-xs font-bold text-foreground-text uppercase tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus class="w-3.5 h-3.5" />
                            Add Exercise
                        </button>
                    </div>
                </div>

                <div class="mx-5 border-t border-separator my-3"></div>

                <div class="px-5 pb-2">
                    <p class="font-mono text-[10px] uppercase tracking-widest text-foreground-text opacity-70 mb-3">
                        Set Schemes — tap scheme, then tap a card
                    </p>

                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="scheme in setSchemes"
                            :key="scheme.label"
                            :class="[
                                'px-3 py-2 rounded-lg border-2 font-mono font-bold text-sm transition-all',
                                activePaletteItem?.type === 'scheme' && activePaletteItem.label === scheme.label
                                    ? 'border-primary bg-primary text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 scale-105'
                                    : 'border-separator bg-white text-foreground-primary hover:border-foreground-primary',
                            ]"
                            @click="selectSchemeTile(scheme)"
                        >
                            {{ scheme.label }}
                        </button>
                    </div>

                    <p class="font-mono text-[10px] text-foreground-text/40 mt-2">
                        Sets × Target Reps. Applied to card = updates the badge.
                    </p>
                </div>

                <div class="mx-5 border-t border-separator my-3"></div>

                <div class="px-5 pb-6">
                    <p class="font-mono text-[10px] uppercase tracking-widest text-foreground-text opacity-70 mb-3">
                        Equipment — tap alat, then tap a card
                    </p>

                    <div class="flex flex-wrap gap-2 mb-3">
                        <button
                            v-for="eq in equipmentPresets"
                            :key="eq"
                            :class="[
                                'px-3 py-1.5 rounded-full border-2 font-mono text-xs font-bold transition-all',
                                activePaletteItem?.type === 'equipment' && activePaletteItem.value === eq
                                    ? 'border-primary bg-primary text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] -translate-y-0.5'
                                    : 'border-separator bg-white text-foreground-primary hover:border-foreground-primary',
                            ]"
                            @click="selectEquipmentTile(eq)"
                        >
                            {{ eq }}
                        </button>
                    </div>

                    <div class="flex gap-2">
                        <input
                            v-model="customEquipmentInput"
                            type="text"
                            placeholder="Custom alat…"
                            class="flex-1 bg-white border-2 border-separator rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary transition-colors"
                            @keydown.enter="selectEquipmentTile(customEquipmentInput)"
                        />
                        <button
                            @click="selectEquipmentTile(customEquipmentInput)"
                            :disabled="!customEquipmentInput.trim()"
                            class="px-3 py-2 bg-foreground-primary text-white font-bold text-xs rounded-lg disabled:opacity-40 hover:bg-primary transition-colors"
                        >
                            Select
                        </button>
                    </div>

                    <p class="font-mono text-[10px] text-foreground-text/40 mt-2">
                        Equipment di card = variant/substitusi yang bisa dipilih saat logging.
                    </p>
                </div>
            </div>

            <div class="px-5 py-4 border-t-2 border-separator bg-[#fcfbf7] flex gap-3 shrink-0">
                <button
                    @click="handleClose"
                    class="flex-1 py-3 border-2 border-separator text-foreground-text font-bold text-xs uppercase tracking-widest rounded-xl hover:border-foreground-primary transition-colors"
                >
                    Cancel
                </button>
                <button
                    @click="saveProgram"
                    :disabled="isSaving"
                    class="flex-2 flex-grow-[2] py-3 bg-foreground-primary text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Save class="w-4 h-4" />
                    {{ isSaving ? 'Saving…' : 'Save Program' }}
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { X, Save, Trash2, Plus } from 'lucide-vue-next';
import { useDragAndDrop } from '@formkit/drag-and-drop/vue';

// ─── Types ───
interface EditableExercise {
    id: string;
    name: string;
    sets: number;
    targetReps: number;
    equipment: string[];
    type: 'reps' | 'hold';
}

interface SetScheme {
    label: string;
    sets: number;
    reps: number;
}

interface PaletteItem {
    type: 'scheme' | 'equipment';
    label?: string;     
    value?: string;     
    sets?: number;
    reps?: number;
}

// ─── Props / Emits ───
const props = defineProps<{
    open: boolean;
    mode: 'gym' | 'calist';
    day: string;
    exercises: EditableExercise[];
}>();

const emit = defineEmits<{
    close: [];
    saved: [exercises: EditableExercise[]];
}>();

const { secureFetch } = useAuth();

// ─── Mobile detection ───
const isMobile = ref(false);
onMounted(() => {
    isMobile.value = window.matchMedia('(max-width: 767px)').matches;
});

// ─── Local state ───
const localExercises = ref<EditableExercise[]>([]);
const activePaletteItem = ref<PaletteItem | null>(null);
const hoveredCardIdx = ref<number | null>(null);
const showAddInput = ref(false);
const newExerciseName = ref('');
const addInputRef = ref<HTMLInputElement | null>(null);
const customEquipmentInput = ref('');
const isSaving = ref(false);

const isDirty = computed(() => {
    return JSON.stringify(localExercises.value) !== JSON.stringify(props.exercises);
});

const handleClose = () => {
    if (isDirty.value) {
        const confirmExit = window.confirm("Ada perubahan yang belum disimpan. Yakin ingin keluar?");
        if (!confirmExit) return;
    }
    emit('close');
};

// ─── Drag-and-drop for exercise list ───
const [exerciseListRef] = useDragAndDrop(localExercises, {
    dragHandle: '.drag-handle',
    plugins: [],
});

// ─── Day display name ───
const dayNames: Record<string, string> = {
    monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu',
    thursday: 'Kamis', friday: 'Jumat', saturday: 'Sabtu', sunday: 'Minggu',
};
const dayDisplayName = computed(() => dayNames[props.day] || props.day);

// ─── Sync local exercises when sidebar opens or exercises change ───
watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            localExercises.value = props.exercises.map(ex => ({
                ...ex,
                equipment: [...ex.equipment],
            }));
            activePaletteItem.value = null;
            showAddInput.value = false;
            newExerciseName.value = '';
        }
    },
    { immediate: true }
);

// ─── Equipment presets by mode ───
const gymEquipment = ['Barbell', 'Dumbbell', 'Cable', 'Smith Machine', 'Machine', 'EZ Bar', 'Kettlebell', 'Band'];
const calistEquipment = ['Pull-up Bar', 'Parallettes', 'Band', 'Rings', 'Dip Bar', 'Chair', 'Floor'];

const equipmentPresets = computed(() =>
    props.mode === 'gym' ? gymEquipment : calistEquipment
);

// ─── Set scheme presets ───
const setSchemes: SetScheme[] = [
    { label: '3×5',  sets: 3, reps: 5  },
    { label: '3×8',  sets: 3, reps: 8  },
    { label: '3×10', sets: 3, reps: 10 },
    { label: '3×12', sets: 3, reps: 12 },
    { label: '4×6',  sets: 4, reps: 6  },
    { label: '4×8',  sets: 4, reps: 8  },
    { label: '4×10', sets: 4, reps: 10 },
    { label: '5×5',  sets: 5, reps: 5  },
    { label: '5×3',  sets: 5, reps: 3  },
];

// ─── Palette select / apply ───
function selectSchemeTile(scheme: SetScheme) {
    if (activePaletteItem.value?.type === 'scheme' && activePaletteItem.value.label === scheme.label) {
        activePaletteItem.value = null;
        return;
    }
    activePaletteItem.value = {
        type: 'scheme',
        label: scheme.label,
        sets: scheme.sets,
        reps: scheme.reps,
    };
}

function selectEquipmentTile(eq: string) {
    const trimmed = eq.trim();
    if (!trimmed) return;
    if (activePaletteItem.value?.type === 'equipment' && activePaletteItem.value.value === trimmed) {
        activePaletteItem.value = null;
        return;
    }
    activePaletteItem.value = {
        type: 'equipment',
        value: trimmed,
    };
}

function applyPaletteToCard(idx: number) {
    if (!activePaletteItem.value) return;

    const ex = localExercises.value[idx];
    if (!ex) return;

    if (activePaletteItem.value.type === 'scheme') {
        ex.sets = activePaletteItem.value.sets!;
        ex.targetReps = activePaletteItem.value.reps!;
    } else if (activePaletteItem.value.type === 'equipment') {
        const val = activePaletteItem.value.value!;
        if (!ex.equipment.includes(val)) {
            ex.equipment.push(val);
        }
        if (val === customEquipmentInput.value.trim()) {
            customEquipmentInput.value = '';
        }
    }

    activePaletteItem.value = null;
}

// ─── Add exercise ───
function openAddInput() {
    showAddInput.value = true;
    nextTick(() => addInputRef.value?.focus());
}

function confirmAddExercise() {
    const name = newExerciseName.value.trim();
    if (!name) return;
    localExercises.value.push({
        id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.toUpperCase(),
        sets: 3,
        targetReps: 10,
        equipment: [],
        type: 'reps',
    });
    newExerciseName.value = '';
    showAddInput.value = false;
}

// ─── Remove exercise ───
function removeExercise(idx: number) {
    localExercises.value.splice(idx, 1);
}

// ─── Remove equipment tag from card ───
function removeEquipment(exIdx: number, eqIdx: number) {
    localExercises.value[exIdx].equipment.splice(eqIdx, 1);
}

// ─── Save to DB ───
async function saveProgram() {
    isSaving.value = true;
    try {
        const config: Record<string, { exercises: any[] }> = {};

        config[props.day] = {
            exercises: localExercises.value.map(ex => ({
                name: ex.name,
                equipment: ex.equipment,
                sets: ex.sets,
                targetReps: ex.targetReps,
                type: ex.type,
            })),
        };

        const existing = await secureFetch(`/api/program/get?mode=${props.mode}`) as any;
        const fullConfig = existing?.config ? { ...existing.config } : {};
        
        // PERBAIKAN: Gabungkan data konfigurasi lama (name, focus, isRest) dengan exercises baru
        fullConfig[props.day] = { ...fullConfig[props.day], ...config[props.day] };

        await secureFetch('/api/program/save', {
            method: 'POST',
            body: { mode: props.mode, config: fullConfig },
        });

        emit('saved', localExercises.value.map(ex => ({ ...ex, equipment: [...ex.equipment] })));
    } catch (error) {
        console.error('Failed to save program:', error);
    } finally {
        isSaving.value = false;
    }
}

// ─── Keyboard: Escape dismisses palette selection ───
function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        if (activePaletteItem.value) {
            activePaletteItem.value = null;
        } else {
            emit('close');
        }
    }
}

onMounted(() => document.addEventListener('keydown', onKeyDown));
onUnmounted(() => document.removeEventListener('keydown', onKeyDown));
</script>

<style scoped>
.sheet-slide-enter-active,
.sheet-slide-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-slide-enter-from,
.sheet-slide-leave-to { transform: translateY(100%); }

.drawer-slide-enter-active,
.drawer-slide-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-slide-enter-from,
.drawer-slide-leave-to { transform: translateX(100%); }

.backdrop-fade-enter-active,
.backdrop-fade-leave-active { transition: opacity 0.25s ease; }
.backdrop-fade-enter-from,
.backdrop-fade-leave-to { opacity: 0; }

.indicator-slide-enter-active,
.indicator-slide-leave-active { transition: all 0.2s ease; }
.indicator-slide-enter-from,
.indicator-slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
