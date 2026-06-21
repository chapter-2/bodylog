<template>
    <div class="p-5 pb-2">
        <div class="flex items-center justify-between mb-3">
            <p
                class="font-mono text-[10px] uppercase tracking-widest text-foreground-text opacity-70"
            >
                Exercises · tap arrows to reorder
            </p>
            <span class="font-mono text-[10px] text-foreground-text opacity-40">
                {{ localExercises.length }} total
            </span>
        </div>

        <div class="space-y-2">
            <div
                v-for="(ex, idx) in localExercises"
                :key="ex.id"
                :class="[
                    'group relative border-2 rounded-xl transition-colors cursor-default bg-white',
                    activePalette
                        ? 'border-primary/40 hover:border-primary hover:bg-primary/5 cursor-pointer'
                        : 'border-separator hover:border-foreground-primary/30',
                    hoveredCardIdx === idx && activePalette
                        ? 'border-primary bg-primary/5'
                        : '',
                ]"
                @mouseenter="hoveredCardIdx = idx"
                @mouseleave="hoveredCardIdx = null"
                @click="applyPaletteToCard(idx)"
            >
                <div
                    v-if="activePalette && hoveredCardIdx === idx"
                    class="absolute inset-0 rounded-xl bg-primary/10 flex items-center justify-center pointer-events-none z-10"
                >
                    <span
                        class="font-bold text-primary text-sm uppercase tracking-widest"
                    >
                        {{
                            activePalette.type === "scheme"
                                ? "⊕ Apply Scheme"
                                : "⊕ Add Equipment"
                        }}
                    </span>
                </div>

                <div class="flex items-start gap-3 p-3">
                    <div
                        class="flex flex-col gap-1 shrink-0 items-center justify-center pt-1"
                        v-if="!activePalette"
                    >
                        <button
                            @click.stop="moveUp(idx)"
                            :disabled="idx === 0"
                            class="p-1 text-separator hover:text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <ChevronUp class="w-5 h-5" />
                        </button>
                        <button
                            @click.stop="moveDown(idx)"
                            :disabled="idx === localExercises.length - 1"
                            class="p-1 text-separator hover:text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <ChevronDown class="w-5 h-5" />
                        </button>
                    </div>

                    <div class="flex-1 min-w-0">
                        <input
                            v-model="ex.name"
                            type="text"
                            :readonly="!!activePalette"
                            :class="[
                                'w-full font-bold text-sm bg-transparent border-b border-transparent focus:border-primary focus:outline-none transition-colors text-foreground-primary uppercase py-0.5 placeholder:text-separator',
                                activePalette
                                    ? 'pointer-events-none select-none'
                                    : '',
                            ]"
                            placeholder="Exercise name"
                            @click.stop="!activePalette"
                        />

                        <div
                            class="flex flex-wrap items-center gap-1.5 mt-2 pointer-events-auto"
                        >
                            <span
                                class="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20"
                            >
                                {{ ex.sets }}×{{
                                    ex.targetReps === 0 ? "?" : ex.targetReps
                                }}
                                <span
                                    v-if="ex.type === 'hold'"
                                    class="text-orange-500"
                                    >s</span
                                >
                            </span>

                            <button
                                v-if="mode === 'calist'"
                                @click.stop="toggleType(idx)"
                                :disabled="!!activePalette"
                                :class="[
                                    'font-mono text-[10px] font-bold px-2 py-0.5 rounded border transition-colors flex items-center gap-1',
                                    ex.type === 'hold'
                                        ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
                                    activePalette
                                        ? 'opacity-50 cursor-not-allowed'
                                        : '',
                                ]"
                            >
                                <Timer
                                    v-if="ex.type === 'hold'"
                                    class="w-3 h-3"
                                />
                                <Repeat v-else class="w-3 h-3" />
                                {{ ex.type === "hold" ? "HOLD" : "REPS" }}
                            </button>

                            <span
                                v-for="(eq, eqIdx) in ex.equipment"
                                :key="eqIdx"
                                class="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-gray-100 text-foreground-text rounded border border-separator"
                            >
                                {{ eq }}
                                <button
                                    v-if="!activePalette"
                                    class="hover:text-red-500 transition-colors ml-0.5"
                                    @click.stop="removeEquipment(idx, eqIdx)"
                                >
                                    ×
                                </button>
                            </span>
                        </div>
                    </div>

                    <button
                        v-if="!activePalette"
                        @click.stop="removeExercise(idx)"
                        class="shrink-0 p-1.5 text-separator hover:text-red-500 transition-colors mt-0.5 pointer-events-auto"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div
                v-if="localExercises.length === 0"
                class="py-8 text-center border-2 border-dashed border-separator rounded-xl"
            >
                <p class="font-mono text-xs text-foreground-text opacity-50">
                    No exercises yet. Add one below.
                </p>
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
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import {
    Trash2,
    Plus,
    Timer,
    Repeat,
    ChevronUp,
    ChevronDown,
} from "lucide-vue-next";

const props = defineProps<{ mode: "gym" | "calist" | "cardio" | "custom"; activePalette: any }>();
const localExercises = defineModel<any[]>("exercises", { required: true });
const emit = defineEmits(["update:activePalette"]);

const hoveredCardIdx = ref<number | null>(null);
const showAddInput = ref(false);
const newExerciseName = ref("");
const addInputRef = ref<HTMLInputElement | null>(null);

// MENGHANCURKAN GHOST HOVER SAAT PALETTE DIPILIH
watch(
    () => props.activePalette,
    (newVal) => {
        if (newVal) {
            hoveredCardIdx.value = null;
        }
    },
);

function moveUp(idx: number) {
    hoveredCardIdx.value = null; // MENGHANCURKAN GHOST HOVER SAAT PINDAH
    if (idx === 0) return;
    // Menggunakan splice agar reaktivitas Vue 100% akurat tanpa bug
    const item = localExercises.value.splice(idx, 1)[0];
    localExercises.value.splice(idx - 1, 0, item);
}

function moveDown(idx: number) {
    hoveredCardIdx.value = null; // MENGHANCURKAN GHOST HOVER SAAT PINDAH
    if (idx === localExercises.value.length - 1) return;
    const item = localExercises.value.splice(idx, 1)[0];
    localExercises.value.splice(idx + 1, 0, item);
}

function applyPaletteToCard(idx: number) {
    if (!props.activePalette) return;
    const ex = localExercises.value[idx];
    if (!ex) return;

    if (props.activePalette.type === "scheme") {
        ex.sets = props.activePalette.sets;
        ex.targetReps = props.activePalette.reps;
    } else if (props.activePalette.type === "equipment") {
        const val = props.activePalette.value;
        if (!ex.equipment.includes(val)) ex.equipment.push(val);
    }
    emit("update:activePalette", null);
}

function toggleType(idx: number) {
    const ex = localExercises.value[idx];
    ex.type = ex.type === "hold" ? "reps" : "hold";
}

function removeExercise(idx: number) {
    localExercises.value.splice(idx, 1);
}

function removeEquipment(exIdx: number, eqIdx: number) {
    localExercises.value[exIdx].equipment.splice(eqIdx, 1);
}

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
        type: "reps",
    });
    newExerciseName.value = "";
    showAddInput.value = false;
}
</script>
