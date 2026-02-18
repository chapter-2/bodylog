<template>
    <div>
        <div class="inner border-b border-separator pb-20 pt-12 relative">
            <div
                class="mx-auto flex flex-col justify-center gap-6 lg:max-w-4xl lg:items-center lg:text-center z-10 relative"
            >
                <span
                    class="font-handwriting text-xl text-foreground-text sm:text-2xl"
                >
                    12 Weeks. Zero Tolerance.
                </span>

                <h1
                    class="text-4xl md:text-7xl lg:text-8xl font-black uppercase leading-none text-foreground-primary py-2"
                >
                    SHAPED
                    <span class="text-primary block sm:inline">PROGRAM</span>
                </h1>

                <p
                    class="text-balance sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto font-mono opacity-80"
                >
                    Log every rep. Track every gram. Create the aesthetic.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 mt-8">
                    <NuxtLink
                        :to="isGym ? '/gym' : '/calist'"
                        class="btn-pow text-lg px-8"
                    >
                        Start Tracking
                        <span class="group-hover:-rotate-45 transition-transform">→</span>
                    </NuxtLink>
                </div>
            </div>

            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5 whitespace-nowrap overflow-hidden pointer-events-none select-none"
            >
                <span class="text-[20rem] font-black font-sans text-primary">BODYLOG</span>
            </div>
        </div>

        <section class="border-b border-separator">
            <div class="inner border-x border-separator bg-white">
                <div
                    class="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-separator"
                >
                    <!-- GYM card -->
                    <NuxtLink
                        to="/gym"
                        @click="onClickGym"
                        class="p-10 group hover:bg-[#fcfbf7] transition-colors block"
                        :class="isGym ? 'bg-primary/5' : ''"
                    >
                        <div class="mb-4 flex justify-between items-start">
                            <div class="flex flex-col gap-1">
                                <span class="font-handwriting text-lg text-primary">The Iron Path</span>
                                <div v-if="isGym" class="flex items-center gap-1.5">
                                    <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                    <span class="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">Active Mode</span>
                                </div>
                            </div>
                            <Dumbbell
                                class="w-12 h-12 text-primary group-hover:rotate-12 transition-transform"
                                :stroke-width="1.5"
                            />
                        </div>
                        <h3 class="text-3xl font-bold mb-6">Gym Training</h3>
                        <ul class="space-y-4 font-mono text-sm">
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>5 Days / Week</strong> (Mon–Sat)</span>
                            </li>
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>Back 2x</strong> (Width + Thickness)</span>
                            </li>
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>Barbell, Dumbbell, Cable</strong></span>
                            </li>
                        </ul>
                        <span class="font-mono text-xs text-primary font-bold uppercase tracking-widest mt-8 block">
                            {{ isGym ? 'Currently Active →' : 'Switch to Gym →' }}
                        </span>
                    </NuxtLink>

                    <!-- CALIST card -->
                    <NuxtLink
                        to="/calist"
                        @click="onClickCalist"
                        class="p-10 group hover:bg-[#fcfbf7] transition-colors block relative"
                        :class="isCalist ? 'bg-primary/5' : ''"
                    >
                        <div class="mb-4 flex justify-between items-start">
                            <div class="flex flex-col gap-1">
                                <span class="font-handwriting text-lg text-primary">The Skill Path</span>
                                <div v-if="isCalist" class="flex items-center gap-1.5">
                                    <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                    <span class="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">Active Mode</span>
                                </div>
                            </div>
                            <Activity
                                class="w-12 h-12 text-primary group-hover:scale-110 transition-transform"
                                :stroke-width="1.5"
                            />
                        </div>
                        <h3 class="text-3xl font-bold mb-6">Calisthenics</h3>
                        <ul class="space-y-4 font-mono text-sm">
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>5 Days / Week</strong> (Mon, Wed, Fri, Sat, Sun)</span>
                            </li>
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>Planche Progression</strong> (Skill-based)</span>
                            </li>
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>Pull-up Bar, Parallettes, Band</strong></span>
                            </li>
                        </ul>
                        <span class="font-mono text-xs text-primary font-bold uppercase tracking-widest mt-8 block">
                            {{ isCalist ? 'Currently Active →' : 'Switch to Calist →' }}
                        </span>
                    </NuxtLink>
                </div>
            </div>
        </section>

        <section class="border-b border-separator">
            <div class="inner border-x border-separator bg-white">
                <div
                    class="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-separator"
                >
                    <div class="p-10 group hover:bg-[#fcfbf7] transition-colors">
                        <div class="mb-4 flex justify-between items-start">
                            <span class="font-handwriting text-lg text-primary">The Law</span>
                            <Scale class="w-12 h-12 text-primary group-hover:-rotate-12 transition-transform" :stroke-width="1.5" />
                        </div>
                        <h3 class="text-3xl font-bold mb-6">Rules</h3>
                        <ul class="space-y-4 font-mono text-sm">
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span><strong>Double Progression</strong> (Reps first)</span>
                            </li>
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span><strong>Track Everything</strong> (No guessing)</span>
                            </li>
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span><strong>Stuck 2 Weeks?</strong> Deload 10%</span>
                            </li>
                        </ul>
                    </div>

                    <div class="p-10 group hover:bg-[#fcfbf7] transition-colors">
                        <div class="mb-4 flex justify-between items-start">
                            <span class="font-handwriting text-lg text-primary">The Edge</span>
                            <Brain class="w-12 h-12 text-primary group-hover:scale-110 transition-transform" :stroke-width="1.5" />
                        </div>
                        <h3 class="text-3xl font-bold mb-6">AI Coach</h3>
                        <ul class="space-y-4 font-mono text-sm">
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>Auto-export</strong> your full log as CSV</span>
                            </li>
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>Context-aware</strong> prompt generation</span>
                            </li>
                            <li class="flex gap-4 items-center">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span><strong>Weekly analysis</strong> via Gemini</span>
                            </li>
                        </ul>
                        <NuxtLink
                            to="/coach"
                            class="font-mono text-xs text-primary font-bold uppercase tracking-widest mt-8 block hover:underline underline-offset-4"
                        >
                            Open AI Coach →
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { Dumbbell, Scale, Activity, Brain } from "lucide-vue-next";
const { isGym, isCalist, setMode } = useMode();

function onClickGym() {
    setMode('gym');
}

function onClickCalist() {
    setMode('calist');
}
</script>
