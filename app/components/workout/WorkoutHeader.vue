<template>
    <div
        class="p-8 border-b border-separator flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
        <div>
            <span class="font-handwriting text-primary text-xl"
                >Today's Session</span
            >
            <h2 class="text-4xl md:text-5xl font-black uppercase mt-1">
                {{ dayName }}
            </h2>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
                <p class="font-mono text-sm text-foreground-text">
                    Focus: {{ dayFocus }}
                </p>
                <button
                    type="button"
                    @click="$emit('open-rules')"
                    class="text-xs font-bold bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-foreground-text flex items-center gap-1 transition-colors"
                >
                    <Info class="w-3 h-3" />
                    <span>LOGGING RULES</span>
                </button>
            </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
            <button
                id="tour-edit-btn"
                v-if="hasExercises"
                @click="$emit('edit-program')"
                type="button"
                class="flex items-center gap-2 px-4 py-2 border-2 border-separator rounded-xl font-bold text-xs uppercase tracking-widest text-foreground-text hover:border-primary hover:text-primary transition-all group"
            >
                <Lock v-if="!isAuthenticated" class="w-4 h-4 opacity-50" />
                <Settings2
                    v-else
                    class="w-4 h-4 group-hover:rotate-90 transition-transform"
                />
                <span class="hidden md:inline">Edit Program</span>
                <span class="md:hidden">Edit</span>
            </button>
            <div
                v-if="lastSaved"
                class="px-4 py-2 border border-separator rounded-full bg-background flex items-center gap-2"
            >
                <span
                    class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                ></span>
                <span class="font-mono text-xs uppercase tracking-widest"
                    >Saved: {{ lastSaved }}</span
                >
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Info, Lock, Settings2 } from "lucide-vue-next";
defineProps<{
    dayName: string;
    dayFocus: string;
    lastSaved: string;
    isAuthenticated: boolean;
    hasExercises: boolean;
}>();
defineEmits(["open-rules", "edit-program"]);
</script>
