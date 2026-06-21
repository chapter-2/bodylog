<template>
    <transition name="fade">
        <div
            v-if="show"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
            <div
                class="w-full max-w-lg bg-white border-2 border-foreground-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative animate-bounce-in"
            >
                <button
                    v-if="hasMode"
                    @click="$emit('close')"
                    class="absolute top-4 right-4 text-foreground-text hover:text-red-500 transition-colors z-10"
                >
                    <X class="w-5 h-5" />
                </button>

                <div class="p-8 border-b border-separator">
                    <span
                        class="font-handwriting text-primary text-xl block mb-1"
                        >Configuration</span
                    >
                    <h3
                        class="text-3xl md:text-4xl font-black uppercase text-foreground-primary leading-none"
                    >
                        Choose Your Mode
                    </h3>
                </div>

                <div class="grid grid-cols-2 divide-x divide-separator">
                    <button
                        @click="selectDirectMode('gym')"
                        class="p-8 text-left hover:bg-[#fcfbf7] transition-colors group flex flex-col gap-4"
                    >
                        <Dumbbell
                            class="w-10 h-10 text-primary group-hover:-rotate-12 transition-transform"
                            :stroke-width="1.5"
                        />
                        <div>
                            <h4
                                class="text-2xl font-black uppercase text-foreground-primary group-hover:text-primary transition-colors"
                            >
                                GYM
                            </h4>
                            <p
                                class="font-mono text-xs text-foreground-text mt-2 leading-relaxed opacity-80"
                            >
                                Barbell, mesin, & dumbbell.
                            </p>
                        </div>
                    </button>

                    <button
                        @click="selectDirectMode('calist')"
                        class="p-8 text-left hover:bg-[#fcfbf7] transition-colors group flex flex-col gap-4"
                    >
                        <Activity
                            class="w-10 h-10 text-primary group-hover:scale-110 transition-transform"
                            :stroke-width="1.5"
                        />
                        <div>
                            <h4
                                class="text-2xl font-black uppercase text-foreground-primary group-hover:text-primary transition-colors"
                            >
                                CALIST
                            </h4>
                            <p
                                class="font-mono text-xs text-foreground-text mt-2 leading-relaxed opacity-80"
                            >
                                Bodyweight skills.
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { Dumbbell, Activity, X } from "lucide-vue-next";

defineProps<{ show: boolean }>();
const emit = defineEmits(["close"]);

const { setMode, hasMode } = useMode();

function selectDirectMode(m: "gym" | "calist") {
    setMode(m);
    emit("close");
    navigateTo("/workout");
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
