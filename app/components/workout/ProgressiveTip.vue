<template>
    <div class="p-6 md:p-8 bg-primary/5 border-b border-primary/20">
        <div class="flex items-start gap-3">
            <Target class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
                <p class="font-bold text-sm text-foreground-primary">
                    {{
                        mode === "gym"
                            ? "Progressive Overload Tracker"
                            : "Skill & Milestone Tracker"
                    }}
                </p>
                <p
                    class="font-mono text-xs text-foreground-text opacity-70 mt-1"
                >
                    {{
                        mode === "gym"
                            ? "Fokus pada 1-2 main compound movement. Tambah 1-2.5kg atau 1-2 reps dari minggu sebelumnya."
                            : "Fokus pada form dan hold time. Tambah waktu hold 2-5 detik atau transisi ke progresi yang lebih berat."
                    }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Target } from "lucide-vue-next";
defineProps<{ mode: "gym" | "calist" }>();
</script>
