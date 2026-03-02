<template>
    <div class="min-h-screen bg-background">
        <section
            class="inner py-20 md:py-32 text-center relative overflow-hidden"
        >
            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none -z-10"
            >
                <span
                    class="text-[10rem] sm:text-[14rem] md:text-[18rem] font-black text-primary leading-none"
                    >BL</span
                >
            </div>

            <span
                class="font-handwriting text-xl md:text-2xl text-primary mb-4 block -rotate-2"
                >No excuses.</span
            >

            <h1
                class="text-7xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase text-foreground-primary tracking-tighter leading-[0.85] sm:leading-none mb-6"
            >
                BODY<br class="block sm:hidden" /><span class="text-primary"
                    >LOG</span
                >
            </h1>

            <p
                class="font-mono text-sm md:text-base text-foreground-text max-w-xl mx-auto opacity-80 leading-relaxed mb-10"
            >
                Aplikasi tracker minimalis untuk eksekusi yang serius. Catat
                target beban latihanmu, pantau perkembangan berat badan, dan
                diskusikan progresmu dengan AI Coach. Sepenuhnya privat.
            </p>

            <div
                v-if="isAuthenticated && hasMode"
                class="flex flex-col sm:flex-row gap-4 justify-center"
            >
                <NuxtLink
                    :to="isGym ? '/gym' : '/calist'"
                    class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground-primary text-white font-bold uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                    <Dumbbell v-if="isGym" class="w-5 h-5" />
                    <Activity v-else class="w-5 h-5" />
                    Open {{ isGym ? "Gym" : "Calist" }} Log
                </NuxtLink>
                <NuxtLink
                    to="/coach"
                    class="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-foreground-primary text-foreground-primary font-bold uppercase tracking-widest text-sm hover:bg-foreground-primary hover:text-white transition-all"
                >
                    AI Coach →
                </NuxtLink>
            </div>

            <div
                v-else-if="isAuthenticated && !hasMode"
                class="flex flex-col sm:flex-row gap-4 justify-center"
            >
                <button
                    @click="openSetupModal"
                    class="inline-flex items-center justify-center gap-2 px-10 py-5 bg-foreground-primary text-white font-black uppercase tracking-widest text-base hover:bg-primary transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                    Initialize Protocol →
                </button>
            </div>

            <div v-else class="flex flex-col sm:flex-row gap-4 justify-center">
                <NuxtLink
                    to="/login"
                    class="inline-flex items-center justify-center gap-2 px-10 py-5 bg-primary text-white font-black uppercase tracking-widest text-base hover:bg-foreground-primary transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                    Get Started →
                </NuxtLink>
            </div>
        </section>

        <section
            v-if="hasMode && isAuthenticated"
            class="inner border-x border-t border-separator bg-white py-10 px-6 md:px-10 animate-fade-in"
        >
            <div
                class="flex items-center justify-between mb-6 pb-4 border-b-2 border-foreground-primary"
            >
                <div>
                    <span
                        class="font-mono text-xs uppercase tracking-widest text-primary block mb-1"
                        >Active Protocol</span
                    >
                    <h2
                        class="text-3xl md:text-4xl font-black uppercase text-foreground-primary tracking-tighter"
                    >
                        {{ mode.toUpperCase() }} MODE
                    </h2>
                </div>
                <button
                    @click="openSetupModal"
                    class="text-xs font-mono text-foreground-text hover:text-primary transition-colors underline"
                >
                    Switch Mode
                </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NuxtLink
                    :to="isGym ? '/gym' : '/calist'"
                    class="group p-5 border-2 border-separator bg-[#fcfbf7] hover:border-primary hover:bg-white transition-all"
                >
                    <Dumbbell
                        v-if="isGym"
                        class="w-6 h-6 text-primary mb-3 group-hover:-rotate-12 transition-transform"
                    />
                    <Activity
                        v-else
                        class="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform"
                    />
                    <p
                        class="font-bold text-sm uppercase group-hover:text-primary transition-colors"
                    >
                        {{ isGym ? "Gym Log" : "Calist Log" }}
                    </p>
                    <p
                        class="font-mono text-xs text-foreground-text opacity-60 mt-1"
                    >
                        Log today's session
                    </p>
                </NuxtLink>

                <NuxtLink
                    to="/weight"
                    class="group p-5 border-2 border-separator bg-[#fcfbf7] hover:border-primary hover:bg-white transition-all"
                >
                    <Scale
                        class="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform"
                    />
                    <p
                        class="font-bold text-sm uppercase group-hover:text-primary transition-colors"
                    >
                        Weigh In
                    </p>
                    <p
                        class="font-mono text-xs text-foreground-text opacity-60 mt-1"
                    >
                        Weekly weight entry
                    </p>
                </NuxtLink>

                <NuxtLink
                    to="/coach"
                    class="group p-5 border-2 border-separator bg-[#fcfbf7] hover:border-primary hover:bg-white transition-all"
                >
                    <BrainCircuit
                        class="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform"
                    />
                    <p
                        class="font-bold text-sm uppercase group-hover:text-primary transition-colors text-primary"
                    >
                        AI Coach
                    </p>
                    <p
                        class="font-mono text-xs text-foreground-text opacity-60 mt-1"
                    >
                        Export & analyze
                    </p>
                </NuxtLink>

                <NuxtLink
                    to="/profile"
                    class="group p-5 border-2 border-separator bg-[#fcfbf7] hover:border-primary hover:bg-white transition-all"
                >
                    <Settings2
                        class="w-6 h-6 text-primary mb-3 group-hover:rotate-45 transition-transform"
                    />
                    <p
                        class="font-bold text-sm uppercase group-hover:text-primary transition-colors"
                    >
                        Settings
                    </p>
                    <p
                        class="font-mono text-xs text-foreground-text opacity-60 mt-1"
                    >
                        Account & Setup
                    </p>
                </NuxtLink>
            </div>
        </section>

        <section
            class="inner border-x border-t border-separator py-16 md:py-24"
        >
            <div class="text-center mb-12">
                <span
                    class="font-handwriting text-xl text-primary mb-2 block rotate-1"
                    >What you get</span
                >
                <h2
                    class="text-4xl md:text-5xl font-black uppercase text-foreground-primary"
                >
                    Feature Overview
                </h2>
            </div>

            <div
                class="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-foreground-primary divide-y-2 md:divide-y-0 md:divide-x-2 divide-foreground-primary"
            >
                <div
                    class="p-8 md:p-10 group hover:bg-[#fcfbf7] transition-colors"
                >
                    <div class="flex items-start gap-5">
                        <div
                            class="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors"
                        >
                            <Dumbbell
                                class="w-7 h-7 text-primary group-hover:text-white transition-colors"
                                :stroke-width="1.5"
                            />
                        </div>
                        <div>
                            <h3
                                class="text-2xl font-black uppercase text-foreground-primary mb-2 group-hover:text-primary transition-colors"
                            >
                                Gym Log
                            </h3>
                            <p
                                class="font-mono text-sm text-foreground-text leading-relaxed opacity-80"
                            >
                                Manajemen jadwal terpusat dengan pelacakan
                                progressive overload bawaan. Setiap sesi
                                otomatis menampilkan riwayat minggu sebelumnya
                                sebagai acuan beban.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="p-8 md:p-10 group hover:bg-[#fcfbf7] transition-colors md:border-t-0"
                >
                    <div class="flex items-start gap-5">
                        <div
                            class="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors"
                        >
                            <Activity
                                class="w-7 h-7 text-primary group-hover:text-white transition-colors"
                                :stroke-width="1.5"
                            />
                        </div>
                        <div>
                            <h3
                                class="text-2xl font-black uppercase text-foreground-primary mb-2 group-hover:text-primary transition-colors"
                            >
                                Calist Log
                            </h3>
                            <p
                                class="font-mono text-sm text-foreground-text leading-relaxed opacity-80"
                            >
                                Pelacakan repetisi dan durasi tahanan secara
                                presisi, pengaturan substitusi alat, serta
                                milestone tracker khusus untuk Bodyweight
                                Skills.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="p-8 md:p-10 group hover:bg-[#fcfbf7] transition-colors border-t-2 border-foreground-primary"
                >
                    <div class="flex items-start gap-5">
                        <div
                            class="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors"
                        >
                            <Scale
                                class="w-7 h-7 text-primary group-hover:text-white transition-colors"
                                :stroke-width="1.5"
                            />
                        </div>
                        <div>
                            <h3
                                class="text-2xl font-black uppercase text-foreground-primary mb-2 group-hover:text-primary transition-colors"
                            >
                                Weight Tracker
                            </h3>
                            <p
                                class="font-mono text-sm text-foreground-text leading-relaxed opacity-80"
                            >
                                Pencatatan berat badan mingguan dengan strategi
                                dinamis. Sesuaikan dengan fase targetmu (Bulk,
                                Cut, atau Maintain).
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="p-8 md:p-10 group hover:bg-[#fcfbf7] transition-colors border-t-2 border-foreground-primary"
                >
                    <div class="flex items-start gap-5">
                        <div
                            class="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors"
                        >
                            <BrainCircuit
                                class="w-7 h-7 text-primary group-hover:text-white transition-colors"
                                :stroke-width="1.5"
                            />
                        </div>
                        <div>
                            <h3
                                class="text-2xl font-black uppercase text-foreground-primary mb-2 group-hover:text-primary transition-colors"
                            >
                                AI Coach
                            </h3>
                            <p
                                class="font-mono text-sm text-foreground-text leading-relaxed opacity-80"
                            >
                                Ekspor seluruh data ke format CSV terstruktur.
                                Termasuk instruksi prompt otomatis agar AI dapat
                                membaca konteks dan progres harianmu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section
            class="inner border-x border-t border-separator py-16 md:py-20 bg-primary/5"
        >
            <div class="text-center max-w-3xl mx-auto px-6">
                <ShieldCheck class="w-12 h-12 text-primary mx-auto mb-6" />
                <h2
                    class="text-3xl md:text-4xl font-black uppercase text-foreground-primary mb-4"
                >
                    Total Privacy. 100% Yours.
                </h2>
                <p
                    class="font-mono text-sm md:text-base text-foreground-text opacity-80 leading-relaxed"
                >
                    Kami sama sekali tidak memiliki akses ke data latihanmu.
                    Tidak ada pelacakan tersembunyi ataupun sinkronisasi data ke
                    pihak ketiga. Seluruh catatan progresmu murni milikmu dan
                    tersimpan dengan aman secara mandiri.
                </p>
            </div>
        </section>

        <section
            class="inner border-x border-t border-b border-separator py-16 text-center"
        >
            <span
                class="font-handwriting text-xl text-primary block mb-2 -rotate-1"
                >Consistency beats intensity.</span
            >
            <h2
                class="text-3xl md:text-5xl font-black uppercase text-foreground-primary mb-8"
            >
                Ready to Execute?
            </h2>

            <NuxtLink
                v-if="!isAuthenticated"
                to="/login"
                class="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black uppercase tracking-widest text-base hover:bg-foreground-primary transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
            >
                Get Started →
            </NuxtLink>
            <button
                v-else-if="!hasMode"
                @click="openSetupModal"
                class="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black uppercase tracking-widest text-base hover:bg-foreground-primary transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
            >
                Initialize Protocol →
            </button>
            <NuxtLink
                v-else
                :to="isGym ? '/gym' : '/calist'"
                class="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black uppercase tracking-widest text-base hover:bg-foreground-primary transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
            >
                Open Log →
            </NuxtLink>
        </section>
    </div>
</template>

<script setup lang="ts">
import {
    Dumbbell,
    Activity,
    Scale,
    BrainCircuit,
    Settings2,
    ShieldCheck,
} from "lucide-vue-next";

const { mode, isGym, isCalist, hasMode, setMode } = useMode();
const { isAuthenticated } = useAuth();

const showSetupModal = ref(false);

function openSetupModal() {
    showSetupModal.value = true;
}
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in {
    animation: fadeIn 0.3s ease forwards;
}
</style>
