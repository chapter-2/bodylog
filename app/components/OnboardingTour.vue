<template>
    <transition name="fade">
        <div v-if="isActive" class="fixed inset-0 z-[200] pointer-events-none">
            <div class="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto" @click="nextStep"></div>

            <div v-if="step === 1" class="absolute top-24 right-10 flex flex-col items-end animate-bounce-in">
                <div class="bg-white border-2 border-foreground-primary p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xs mb-4 pointer-events-auto">
                    <h3 class="font-black uppercase text-xl mb-1">Track Your Mass</h3>
                    <p class="font-mono text-xs text-foreground-text mb-4">Click "BULK" in the menu to log your weekly weight and cardio sessions.</p>
                    <button @click.stop="nextStep" class="btn-pow w-full text-xs py-2 bg-primary text-white border-2 border-foreground-primary">GOT IT</button>
                </div>
                <svg class="arrow-svg rotate-12" width="120" height="80" viewBox="0 0 120 80" fill="none">
                    <path d="M 20 70 C 20 40, 60 20, 110 10" stroke="#FCD34D" stroke-width="4" stroke-linecap="round" fill="none"/>
                    <path d="M 95 20 L 110 10 L 100 0" stroke="#FCD34D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>

            <div v-if="step === 2" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce-in">
                <svg class="arrow-svg mb-4 -rotate-90" width="120" height="80" viewBox="0 0 120 80" fill="none">
                    <path d="M 10 70 C 10 40, 60 20, 110 10" stroke="#FCD34D" stroke-width="4" stroke-linecap="round" fill="none"/>
                    <path d="M 95 20 L 110 10 L 100 0" stroke="#FCD34D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="bg-white border-2 border-foreground-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm text-center pointer-events-auto">
                    <h3 class="font-black uppercase text-2xl mb-2">Execute Your Program</h3>
                    <p class="font-mono text-xs text-foreground-text mb-6">Your selected training mode dictates your daily logs. Stick to the plan and log every set.</p>
                    <button @click.stop="finishTour" class="btn-pow w-full h-12 bg-foreground-primary text-white font-bold uppercase tracking-wider">Start Grinding</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const { hasSeenTour, completeTour, hasMode } = useMode();
const step = ref(1);

// Only active if they have set up their mode, but haven't seen the tour yet
const isActive = computed(() => hasMode.value && !hasSeenTour.value);

function nextStep() {
    step.value++;
}

function finishTour() {
    completeTour();
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes bounceIn {
    0% { transform: scale(0.9); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in { animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>
