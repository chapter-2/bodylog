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
                'bottom-0 left-0 right-0 max-h-[92vh] rounded-t-2xl border-t-2 border-foreground-primary',
                'md:bottom-0 md:top-0 md:left-auto md:right-0 md:w-[380px] md:max-h-full md:rounded-none md:border-t-0 md:border-l-2',
                'shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.08)] md:shadow-[-8px_0px_40px_rgba(0,0,0,0.15)]',
            ]"
        >
            <div class="flex justify-center pt-3 pb-1 md:hidden">
                <div class="w-10 h-1 bg-separator rounded-full"></div>
            </div>

            <div
                class="px-6 py-4 border-b-2 border-foreground-primary flex items-center justify-between shrink-0 bg-[#fcfbf7]"
            >
                <div>
                    <p
                        class="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-1.5 mb-1"
                    >
                        <Dumbbell v-if="mode === 'gym'" class="w-3 h-3" />
                        <Activity v-else-if="mode === 'calist'" class="w-3 h-3" />
                        <Heart v-else-if="mode === 'cardio'" class="w-3 h-3" />
                        <Settings v-else class="w-3 h-3" />
                        {{ mode.toUpperCase() }} ·
                        {{ dayDisplayName }}
                    </p>
                    <h2
                        class="text-xl font-black uppercase text-foreground-primary leading-tight"
                    >
                        Edit Program
                    </h2>
                </div>
                <button
                    @click="handleClose"
                    class="p-2 hover:text-red-500 transition-colors"
                >
                    <X class="w-5 h-5" />
                </button>
            </div>

            <transition name="indicator-slide">
                <div
                    v-if="activePalette"
                    class="mx-4 mt-3 mb-0 px-4 py-2.5 bg-primary text-white rounded-xl flex items-center gap-3 text-sm shrink-0"
                >
                    <div
                        class="w-2 h-2 bg-white rounded-full animate-pulse"
                    ></div>
                    <span class="font-bold text-xs uppercase tracking-widest">
                        {{
                            activePalette.type === "scheme"
                                ? `Apply ${activePalette.label} to card…`
                                : `Add "${activePalette.value}" to card…`
                        }}
                    </span>
                    <button
                        @click="activePalette = null"
                        class="ml-auto font-mono text-white/70 hover:text-white text-xs"
                    >
                        ✕ cancel
                    </button>
                </div>
            </transition>

            <div class="flex-1 overflow-y-auto overscroll-contain">
                <EditorExerciseList
                    v-model:exercises="localExercises"
                    :mode="mode"
                    v-model:active-palette="activePalette"
                />
                <div class="mx-5 border-t border-separator my-3"></div>
                <EditorPalette
                    :mode="mode"
                    v-model:active-palette="activePalette"
                />
            </div>

            <div
                class="px-5 py-4 border-t-2 border-separator bg-[#fcfbf7] flex gap-3 shrink-0"
            >
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
                    {{ isSaving ? "Saving…" : "Save Program" }}
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { X, Save, Dumbbell, Activity, Heart, Settings } from "lucide-vue-next";
import EditorExerciseList from "./editor/EditorExerciseList.vue";
import EditorPalette from "./editor/EditorPalette.vue";

const props = defineProps<{
    open: boolean;
    mode: "gym" | "calist" | "cardio" | "custom";
    day: string;
    exercises: any[];
}>();
const emit = defineEmits(["close", "saved"]);

const { secureFetch } = useAuth();
const isMobile = ref(false);
const localExercises = ref<any[]>([]);
const activePalette = ref<any | null>(null);
const isSaving = ref(false);

const isDirty = computed(
    () =>
        JSON.stringify(localExercises.value) !==
        JSON.stringify(props.exercises),
);

const dayNames: Record<string, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
};
const dayDisplayName = computed(() => dayNames[props.day] || props.day);

onMounted(() => {
    isMobile.value = window.matchMedia("(max-width: 767px)").matches;
});

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            localExercises.value = props.exercises.map((ex) => ({
                ...ex,
                equipment: [...ex.equipment],
            }));
            activePalette.value = null;
        }
    },
    { immediate: true },
);

const handleClose = () => {
    if (
        isDirty.value &&
        !window.confirm(
            "Ada perubahan yang belum disimpan. Yakin ingin keluar?",
        )
    )
        return;
    emit("close");
};

async function saveProgram() {
    isSaving.value = true;
    try {
        const config: Record<string, { exercises: any[] }> = {
            [props.day]: {
                exercises: localExercises.value.map((ex) => ({
                    name: ex.name,
                    equipment: ex.equipment,
                    sets: ex.sets,
                    targetReps: ex.targetReps,
                    type: ex.type,
                })),
            },
        };
        const existing = (await secureFetch(
            `/api/program/get?mode=${props.mode}`,
        )) as any;
        const fullConfig = existing?.config ? { ...existing.config } : {};
        fullConfig[props.day] = {
            ...fullConfig[props.day],
            ...config[props.day],
        };

        await secureFetch("/api/program/save", {
            method: "POST",
            body: { mode: props.mode, config: fullConfig },
        });
        emit(
            "saved",
            localExercises.value.map((ex) => ({
                ...ex,
                equipment: [...ex.equipment],
            })),
        );
    } catch (error) {
        console.error(error);
    } finally {
        isSaving.value = false;
    }
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape")
        activePalette.value ? (activePalette.value = null) : emit("close");
}
onMounted(() => document.addEventListener("keydown", onKeyDown));
onUnmounted(() => document.removeEventListener("keydown", onKeyDown));
</script>

<style scoped>
.sheet-slide-enter-active,
.sheet-slide-leave-active {
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
    transform: translateY(100%);
}
.drawer-slide-enter-active,
.drawer-slide-leave-active {
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
    transform: translateX(100%);
}
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
    transition: opacity 0.25s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
    opacity: 0;
}
.indicator-slide-enter-active,
.indicator-slide-leave-active {
    transition: all 0.2s ease;
}
.indicator-slide-enter-from,
.indicator-slide-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
