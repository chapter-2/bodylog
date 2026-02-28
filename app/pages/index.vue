<template>
    <div class="min-h-screen bg-background relative overflow-hidden">
        <div class="inner py-16 md:py-24">
            
            <div class="text-center mb-16">
                <span class="font-handwriting text-2xl text-primary mb-4 block -rotate-2">No excuses.</span>
                <h1 class="text-6xl md:text-8xl font-black uppercase text-foreground-primary tracking-tighter leading-none mb-6">
                    BODY<span class="text-primary">LOG</span>
                </h1>
                <p class="font-mono text-sm md:text-base text-foreground-text max-w-2xl mx-auto opacity-80 leading-relaxed">
                    A brutalist tracker for serious execution. Select your path below.
                </p>
            </div>

            <div v-if="hasMode && isAuthenticated" class="max-w-4xl mx-auto animate-bounce-in">
                <div class="flex justify-between items-end mb-8 border-b-2 border-foreground-primary pb-4">
                    <div>
                        <span class="font-mono text-xs uppercase tracking-widest text-primary mb-1 block">Active Protocol</span>
                        <h2 class="text-4xl md:text-5xl font-black uppercase text-foreground-primary tracking-tighter leading-none">
                            {{ mode }} <span v-if="mode !== 'custom'">- {{ frequency }} DAYS</span>
                        </h2>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:border-primary transition-all group">
                        <h3 class="text-2xl font-black uppercase mb-4 group-hover:text-primary transition-colors">Today's Directive</h3>
                        <NuxtLink :to="mode === 'custom' ? '/builder' : `/${mode}`" class="inline-block text-center w-full py-4 bg-foreground-primary text-white font-bold uppercase tracking-widest hover:bg-primary transition-colors">
                            {{ mode === 'custom' ? 'Open Builder →' : 'Open Log →' }}
                        </NuxtLink>
                    </div>

                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:border-foreground-primary transition-all group">
                        <h3 class="text-2xl font-black uppercase mb-4">System Settings</h3>
                        <button @click="resetMode" class="w-full py-4 border-2 border-separator text-foreground-primary font-bold uppercase tracking-widest hover:bg-foreground-primary hover:text-white transition-colors">
                            Re-Initialize
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <button @click="startMode('gym')" class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left hover:-translate-y-1 hover:border-primary transition-all group">
                    <h2 class="text-3xl font-black uppercase text-foreground-primary mb-2 group-hover:text-primary">GYM</h2>
                    <p class="font-mono text-xs text-foreground-text leading-relaxed">Iron & machines. Structured hypertrophy.</p>
                </button>

                <button @click="startMode('calist')" class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left hover:-translate-y-1 hover:border-primary transition-all group">
                    <h2 class="text-3xl font-black uppercase text-foreground-primary mb-2 group-hover:text-primary">CALIST</h2>
                    <p class="font-mono text-xs text-foreground-text leading-relaxed">Bodyweight skills. Planche & levers.</p>
                </button>

                <button @click="startMode('cardio')" class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left hover:-translate-y-1 hover:border-primary transition-all group">
                    <h2 class="text-3xl font-black uppercase text-foreground-primary mb-2 group-hover:text-primary">CARDIO</h2>
                    <p class="font-mono text-xs text-foreground-text leading-relaxed">Endurance & engine. Miles & time.</p>
                </button>

                <button @click="startMode('custom')" class="md:col-span-3 bg-primary border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center hover:-translate-y-1 hover:bg-foreground-primary transition-all group mt-2">
                    <h2 class="text-4xl font-black uppercase text-white mb-2 tracking-widest">CUSTOM BUILDER</h2>
                    <p class="font-mono text-sm text-white/80 leading-relaxed">Drag and drop your own sets, reps, and rules from scratch.</p>
                </button>
            </div>
        </div>

        <transition name="fade">
            <div v-if="showSetupModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div class="w-full max-w-xl bg-white border-2 border-foreground-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 relative animate-bounce-in">
                    
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-black uppercase text-foreground-primary tracking-tighter">
                            Configure {{ tempMode }}
                        </h2>
                    </div>

                    <div v-if="setupStep === 1" class="space-y-4">
                        <h3 class="font-mono text-sm uppercase tracking-widest text-foreground-text text-center">Intensity</h3>
                        <div class="grid grid-cols-3 gap-2">
                            <button v-for="i in ['beginner', 'intermediate', 'advanced']" :key="i" @click="tempIntensity = i" :class="['p-3 border-2 text-xs font-bold uppercase transition-all', tempIntensity === i ? 'border-primary bg-primary text-white' : 'border-separator hover:border-foreground-primary']">
                                {{ i }}
                            </button>
                        </div>
                        <div class="pt-6 flex justify-end">
                            <button @click="setupStep++" :disabled="!tempIntensity" class="px-8 py-3 bg-foreground-primary text-white font-bold uppercase disabled:opacity-50">Next</button>
                        </div>
                    </div>

                    <div v-if="setupStep === 2" class="space-y-4">
                        <h3 class="font-mono text-sm uppercase tracking-widest text-foreground-text text-center">Days Per Week</h3>
                        <div class="grid grid-cols-5 gap-2">
                            <button v-for="d in [3,4,5,6,7]" :key="d" @click="tempFreq = d" :class="['p-3 border-2 font-black text-xl transition-all', tempFreq === d ? 'border-primary bg-primary text-white' : 'border-separator hover:border-foreground-primary']">
                                {{ d }}
                            </button>
                        </div>
                        <div class="pt-6 flex justify-between">
                            <button @click="setupStep--" class="font-bold uppercase text-xs text-foreground-text">Back</button>
                            <button @click="finalizeSetup" :disabled="!tempFreq" class="px-8 py-3 bg-primary text-white font-bold uppercase disabled:opacity-50">Initialize</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Dumbbell, Activity } from "lucide-vue-next";

const { mode, intensity, frequency, hasMode, setMode, resetMode, isAuthenticated } = useMode();

const showSetupModal = ref(false);
const setupStep = ref(1);
const tempMode = ref("");
const tempIntensity = ref("");
const tempFreq = ref(0);

function startMode(selectedMode: string) {
    if (selectedMode === 'custom') {
        setMode('custom', 'n/a', 0);
        navigateTo('/builder');
    } else {
        tempMode.value = selectedMode;
        setupStep.value = 1;
        showSetupModal.value = true;
    }
}

function finalizeSetup() {
    setMode(tempMode.value, tempIntensity.value, tempFreq.value);
    showSetupModal.value = false;
}
</script>

<style scoped>
@keyframes bounceIn {
    0% { transform: translateY(10px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
.animate-bounce-in { animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
