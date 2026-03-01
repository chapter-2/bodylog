<template>
    <transition name="fade">
        <div
            v-if="show"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <div
                class="w-full max-w-sm bg-white border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative animate-bounce-in"
            >
                <div
                    class="mx-auto w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center mb-6"
                >
                    <LogOut class="w-8 h-8 text-red-500" />
                </div>
                <h3 class="text-3xl font-black uppercase mb-2">Logging Out?</h3>
                <p
                    class="font-mono text-sm mb-8 text-foreground-text leading-relaxed"
                >
                    Your session will be ended.
                </p>
                <div class="flex flex-col gap-3">
                    <button
                        @click="$emit('confirm')"
                        class="w-full py-4 bg-foreground-primary text-white font-bold text-lg uppercase hover:bg-red-600 hover:border-red-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                    >
                        Yes, I'm Done
                    </button>
                    <button
                        @click="$emit('close')"
                        class="w-full py-4 bg-transparent border-2 border-separator text-foreground-text font-bold text-lg uppercase hover:border-foreground-primary hover:text-foreground-primary transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { LogOut } from "lucide-vue-next";
defineProps<{ show: boolean }>();
defineEmits(["close", "confirm"]);
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
