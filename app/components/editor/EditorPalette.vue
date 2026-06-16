<template>
    <div class="flex flex-col shrink-0">
        <div class="px-5 pb-2">
            <p
                class="font-mono text-[10px] uppercase tracking-widest text-foreground-text opacity-70 mb-3"
            >
                Set Schemes — tap scheme, then tap a card
            </p>

            <div class="flex flex-wrap gap-2">
                <button
                    v-for="scheme in setSchemes"
                    :key="scheme.label"
                    :class="[
                        'px-3 py-2 rounded-lg border-2 font-mono font-bold text-sm transition-all',
                        activePalette?.type === 'scheme' &&
                        activePalette.label === scheme.label
                            ? 'border-primary bg-primary text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 scale-105'
                            : 'border-separator bg-white text-foreground-primary hover:border-foreground-primary',
                    ]"
                    @click="selectScheme(scheme)"
                >
                    {{ scheme.label }}
                </button>
            </div>

            <div
                class="flex items-center gap-2 mt-3 pt-3 border-t border-separator/50"
            >
                <span
                    class="font-mono text-[10px] text-foreground-text/50 uppercase tracking-widest shrink-0"
                    >Custom:</span
                >
                <div class="flex items-center gap-1">
                    <input
                        v-model.number="customSets"
                        type="number"
                        min="1"
                        max="10"
                        class="w-12 bg-white border-2 border-separator rounded-lg px-2 py-1.5 text-xs font-mono text-center focus:outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span
                        class="font-mono text-xs text-foreground-text font-bold"
                        >×</span
                    >
                    <input
                        v-model.number="customReps"
                        type="number"
                        min="1"
                        max="999"
                        class="w-14 bg-white border-2 border-separator rounded-lg px-2 py-1.5 text-xs font-mono text-center focus:outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
                <button
                    @click="selectCustomScheme"
                    :class="[
                        'px-3 py-1.5 rounded-lg border-2 font-mono font-bold text-xs transition-all shrink-0',
                        isCustomActive
                            ? 'border-primary bg-primary text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 scale-105'
                            : 'border-dashed border-separator bg-white text-foreground-text hover:border-foreground-primary',
                    ]"
                >
                    {{ customSets }}×{{ customReps }}
                </button>
            </div>

            <p class="font-mono text-[10px] text-foreground-text/40 mt-2">
                Sets × Target Reps. Applied to card = updates the badge.
            </p>
        </div>

        <div class="mx-5 border-t border-separator my-3"></div>

        <div class="px-5 pb-6">
            <p
                class="font-mono text-[10px] uppercase tracking-widest text-foreground-text opacity-70 mb-3"
            >
                Equipment — tap alat, then tap a card
            </p>

            <div class="flex flex-wrap gap-2 mb-3">
                <button
                    v-for="eq in equipmentPresets"
                    :key="eq"
                    :class="[
                        'px-3 py-1.5 rounded-full border-2 font-mono text-xs font-bold transition-all',
                        activePalette?.type === 'equipment' &&
                        activePalette.value === eq
                            ? 'border-primary bg-primary text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] -translate-y-0.5'
                            : 'border-separator bg-white text-foreground-primary hover:border-foreground-primary',
                    ]"
                    @click="selectEquipment(eq)"
                >
                    {{ eq }}
                </button>
            </div>

            <div class="flex gap-2">
                <input
                    v-model="customEq"
                    type="text"
                    placeholder="Custom alat…"
                    class="flex-1 bg-white border-2 border-separator rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary transition-colors"
                    @keydown.enter="selectEquipment(customEq)"
                />
                <button
                    @click="selectEquipment(customEq)"
                    :disabled="!customEq.trim()"
                    class="px-3 py-2 bg-foreground-primary text-white font-bold text-xs rounded-lg disabled:opacity-40 hover:bg-primary transition-colors"
                >
                    Select
                </button>
            </div>
            <p class="font-mono text-[10px] text-foreground-text/40 mt-2">
                Equipment di card = variant/substitusi yang bisa dipilih saat
                logging.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
    mode: "gym" | "calist";
    activePalette: any;
}>();

const emit = defineEmits(["update:activePalette"]);

const customEq = ref("");

const gymEquipment = [
    "Barbell",
    "Dumbbell",
    "Cable",
    "Smith Machine",
    "Machine",
    "EZ Bar",
    "Kettlebell",
    "Band",
];
const calistEquipment = [
    "Pull-up Bar",
    "Parallettes",
    "Band",
    "Rings",
    "Dip Bar",
    "Chair",
    "Floor",
];

const equipmentPresets = computed(() =>
    props.mode === "gym" ? gymEquipment : calistEquipment,
);

const setSchemes = [
    { label: "3×5", sets: 3, reps: 5 },
    { label: "3×8", sets: 3, reps: 8 },
    { label: "3×10", sets: 3, reps: 10 },
    { label: "3×12", sets: 3, reps: 12 },
    { label: "4×6", sets: 4, reps: 6 },
    { label: "4×8", sets: 4, reps: 8 },
    { label: "4×10", sets: 4, reps: 10 },
    { label: "5×5", sets: 5, reps: 5 },
    { label: "5×3", sets: 5, reps: 3 },
];

const customSets = ref(3);
const customReps = ref(10);
const customActiveLabel = ref<string | null>(null);

const isCustomActive = computed(() =>
    props.activePalette?.type === "scheme" &&
    customActiveLabel.value !== null &&
    props.activePalette.label === customActiveLabel.value,
);

function selectScheme(scheme: any) {
    if (
        props.activePalette?.type === "scheme" &&
        props.activePalette.label === scheme.label
    ) {
        emit("update:activePalette", null);
        return;
    }
    emit("update:activePalette", {
        type: "scheme",
        label: scheme.label,
        sets: scheme.sets,
        reps: scheme.reps,
    });
}

function selectCustomScheme() {
    const label = `${customSets.value}×${customReps.value}`;

    // If matches predefined scheme, use predefined handler
    const predefined = setSchemes.find((s) => s.label === label);
    if (predefined) {
        selectScheme(predefined);
        customActiveLabel.value = null;
        return;
    }

    // If non-custom scheme is active, forget old custom label
    if (
        props.activePalette?.type === "scheme" &&
        customActiveLabel.value !== null &&
        props.activePalette.label !== customActiveLabel.value
    ) {
        customActiveLabel.value = null;
    }

    // Toggle: same custom scheme already active → deselect
    if (
        props.activePalette?.type === "scheme" &&
        customActiveLabel.value === label
    ) {
        emit("update:activePalette", null);
        customActiveLabel.value = null;
        return;
    }

    customActiveLabel.value = label;
    emit("update:activePalette", {
        type: "scheme",
        label,
        sets: customSets.value,
        reps: customReps.value,
    });
}

function selectEquipment(eq: string) {
    const trimmed = eq.trim();
    if (!trimmed) return;
    if (
        props.activePalette?.type === "equipment" &&
        props.activePalette.value === trimmed
    ) {
        emit("update:activePalette", null);
        return;
    }
    emit("update:activePalette", { type: "equipment", value: trimmed });
    if (trimmed === customEq.value.trim()) customEq.value = "";
}
</script>
