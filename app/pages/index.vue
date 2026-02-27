<template>
    <div class="min-h-screen bg-background relative">
        <OnboardingTour />

        <div class="inner py-10 md:py-20">
            <div v-if="!hasMode" class="max-w-3xl mx-auto">
                <div class="text-center mb-12">
                    <span class="font-handwriting text-2xl text-primary mb-2 block -rotate-2">Step {{ setupStep }} of 3</span>
                    <h1 class="text-5xl md:text-6xl font-black uppercase text-foreground-primary tracking-tighter leading-none">
                        BUILD YOUR PROTOCOL
                    </h1>
                </div>

                <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    
                    <div v-if="setupStep === 1" class="animate-bounce-in">
                        <h2 class="font-mono text-sm uppercase tracking-widest text-foreground-text mb-6">Select Discipline</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button v-for="m in ['gym', 'calist', 'cardio']" :key="m"
                                @click="tempMode = m"
                                :class="['p-6 border-2 text-left transition-all', tempMode === m ? 'border-primary bg-[#fcfbf7] shadow-[4px_4px_0px_0px_#229799] -translate-y-1' : 'border-separator hover:border-foreground-primary']"
                            >
                                <h3 class="text-2xl font-black uppercase mb-2">{{ m }}</h3>
                                <p class="font-mono text-xs opacity-70">
                                    {{ m === 'gym' ? 'Hypertrophy & Iron' : (m === 'calist' ? 'Bodyweight Mastery' : 'Endurance & Engine') }}
                                </p>
                            </button>
                        </div>
                    </div>

                    <div v-if="setupStep === 2" class="animate-bounce-in">
                        <h2 class="font-mono text-sm uppercase tracking-widest text-foreground-text mb-6">Select Intensity</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button v-for="i in ['beginner', 'intermediate', 'advanced']" :key="i"
                                @click="tempIntensity = i"
                                :class="['p-6 border-2 text-left transition-all', tempIntensity === i ? 'border-primary bg-[#fcfbf7] shadow-[4px_4px_0px_0px_#229799] -translate-y-1' : 'border-separator hover:border-foreground-primary']"
                            >
                                <h3 class="text-xl font-black uppercase mb-2">{{ i }}</h3>
                                <p class="font-mono text-xs opacity-70">
                                    {{ i === 'beginner' ? 'Lower volume, focus on form.' : (i === 'advanced' ? 'High volume, brutal execution.' : 'Balanced progression.') }}
                                </p>
                            </button>
                        </div>
                    </div>

                    <div v-if="setupStep === 3" class="animate-bounce-in">
                        <h2 class="font-mono text-sm uppercase tracking-widest text-foreground-text mb-6">Training Days Per Week</h2>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <button v-for="d in [3,4,5,6,7]" :key="d"
                                @click="tempFreq = d"
                                :class="['p-4 border-2 text-center font-black text-2xl transition-all', tempFreq === d ? 'border-primary bg-primary text-white shadow-[4px_4px_0px_0px_#27272a] -translate-y-1' : 'border-separator hover:border-foreground-primary']"
                            >
                                {{ d }}
                            </button>
                        </div>
                        <p class="mt-6 text-xs font-mono text-yellow-700 bg-yellow-50 border border-yellow-200 p-3">
                            Warning: Overtraining is a real threat. If you select 6 or 7 days, ensure your nutrition is dialed in.
                        </p>
                    </div>

                    <div class="mt-10 pt-6 border-t border-separator flex justify-between">
                        <button 
                            @click="setupStep--" 
                            :class="['font-bold uppercase tracking-wider text-sm', setupStep === 1 ? 'opacity-0 pointer-events-none' : 'text-foreground-text hover:text-primary']"
                        >
                            Back
                        </button>
                        
                        <button v-if="setupStep < 3"
                            @click="setupStep++" 
                            :disabled="(setupStep === 1 && !tempMode) || (setupStep === 2 && !tempIntensity)"
                            class="bg-foreground-primary text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-primary disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                        
                        <button v-else
                            @click="finalizeSetup" 
                            :disabled="!tempFreq"
                            class="bg-primary text-white px-8 py-3 font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-foreground-primary transition-colors disabled:opacity-50"
                        >
                            Initialize Program
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="animate-bounce-in">
                <div class="flex justify-between items-end mb-8 border-b-2 border-foreground-primary pb-4">
                    <div>
                        <span class="font-mono text-xs uppercase tracking-widest text-primary mb-1 block">Active Protocol</span>
                        <h1 class="text-4xl md:text-5xl font-black uppercase text-foreground-primary tracking-tighter leading-none">
                            {{ mode }} - {{ frequency }} DAYS
                        </h1>
                    </div>
                    <div class="text-right hidden md:block">
                        <span class="font-mono text-xs text-foreground-text uppercase">Intensity: {{ intensity }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="text-2xl font-black uppercase mb-4">Today's Directive</h2>
                        <p class="font-mono text-sm text-foreground-text mb-6">Navigate to the training log to execute your daily requirements.</p>
                        <NuxtLink :to="`/${mode}`" class="inline-block text-center w-full py-4 bg-foreground-primary text-white font-bold uppercase tracking-widest hover:bg-primary transition-colors">
                            Open Log
                        </NuxtLink>
                    </div>

                    <div class="bg-white border-2 border-separator p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 class="text-2xl font-black uppercase mb-4">System Settings</h2>
                        <p class="font-mono text-sm text-foreground-text mb-6">Change your discipline or adjust frequency. (Warning: Resets active tracking interface)</p>
                        <button @click="resetMode" class="w-full py-4 border-2 border-red-200 text-red-600 font-bold uppercase tracking-widest hover:bg-red-50 transition-colors">
                            Re-Initialize
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OnboardingTour from '~/components/OnboardingTour.vue';

const { mode, intensity, frequency, hasMode, setMode, resetMode } = useMode();

// Setup Wizard State
const setupStep = ref(1);
const tempMode = ref("");
const tempIntensity = ref("");
const tempFreq = ref(0);

function finalizeSetup() {
    setMode(tempMode.value, tempIntensity.value, tempFreq.value);
}
</script>

<style scoped>
@keyframes bounceIn {
    0% { transform: translateY(10px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
.animate-bounce-in { animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>
