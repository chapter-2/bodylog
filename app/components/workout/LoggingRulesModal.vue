<template>
    <transition name="fade">
        <div
            v-if="show"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            @click.self="$emit('close')"
        >
            <div
                class="w-full max-w-sm bg-white border-2 border-foreground-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative animate-bounce-in"
            >
                <button
                    @click="$emit('close')"
                    class="absolute top-4 right-4 text-foreground-text hover:text-red-500"
                >
                    <X class="w-6 h-6" />
                </button>
                <h3
                    class="text-xl font-black uppercase mb-4 border-b-2 border-primary w-fit"
                >
                    Logging Rules
                </h3>

                <div v-if="mode === 'gym'" class="space-y-4 font-mono text-sm">
                    <div class="bg-blue-50 p-3 rounded border border-blue-100">
                        <div class="font-bold text-blue-800 mb-1">
                            Dumbbells
                        </div>
                        <p>
                            Catat berat <strong>PER TANGAN</strong> (Satu sisi).
                        </p>
                        <p class="text-xs text-blue-600 mt-1">
                            Ex: Curl pake 10kg kiri & 10kg kanan → Tulis
                            <strong>10</strong>.
                        </p>
                    </div>
                    <div
                        class="bg-green-50 p-3 rounded border border-green-100"
                    >
                        <div class="font-bold text-green-800 mb-1">
                            Barbell / Smith
                        </div>
                        <p>Catat <strong>TOTAL BERAT</strong> (Plate).</p>
                        <p class="text-xs text-green-600 mt-1">
                            Ex: Plate 10kg kiri/kanan → Tulis
                            <strong>20</strong>.
                        </p>
                    </div>
                    <div
                        class="bg-orange-50 p-3 rounded border border-orange-100"
                    >
                        <div class="font-bold text-orange-800 mb-1">
                            Cable / Machine
                        </div>
                        <p>Catat <strong>ANGKA DI TUMPUKAN</strong>.</p>
                    </div>
                </div>

                <div v-else class="space-y-4 font-mono text-sm">
                    <div class="bg-blue-50 p-3 rounded border border-blue-100">
                        <div class="font-bold text-blue-800 mb-1">
                            REPS Exercises
                        </div>
                        <p>
                            Catat jumlah
                            <strong>full range of motion reps</strong>.
                        </p>
                        <p class="text-xs text-blue-600 mt-1">
                            Ex: Pull-up 6 reps → Tulis <strong>6</strong>.
                            Jangan hitung partial rep.
                        </p>
                    </div>
                    <div
                        class="bg-orange-50 p-3 rounded border border-orange-100"
                    >
                        <div class="font-bold text-orange-800 mb-1">
                            HOLD Exercises
                        </div>
                        <p>Catat <strong>detik hold tanpa putus</strong>.</p>
                        <p class="text-xs text-orange-600 mt-1">
                            Ex: Planche Lean 12 detik lalu form break → Tulis
                            <strong>12</strong>.
                        </p>
                    </div>
                    <div
                        class="bg-yellow-50 p-3 rounded border border-yellow-100"
                    >
                        <div class="font-bold text-yellow-800 mb-1">
                            Substitusi Alat
                        </div>
                        <p>
                            Pilih versi yang lo pakai dari
                            <strong>radio button</strong> di bawah nama
                            exercise.
                        </p>
                        <p class="text-xs text-yellow-600 mt-1">
                            Data tersimpan dengan nama versi yang dipilih.
                        </p>
                    </div>
                </div>

                <button
                    @click="$emit('close')"
                    class="w-full mt-6 py-3 bg-foreground-primary text-white font-bold uppercase rounded hover:bg-primary transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";

defineProps<{
    show: boolean;
    mode: "gym" | "calist";
}>();

defineEmits(["close"]);
</script>
