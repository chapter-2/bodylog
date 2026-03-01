<template>
    <div class="p-6 md:p-8 bg-[#fffef5] border-b border-yellow-200">
        <button
            type="button"
            @click="show = !show"
            class="text-sm font-bold text-foreground-primary hover:text-primary flex items-center gap-2 w-full transition-colors"
        >
            <MessageSquare class="w-4 h-4 text-yellow-600" />
            <span>Session Notes</span>
            <span
                v-if="modelValue"
                class="text-xs font-mono text-primary ml-auto"
                >Has note ✓</span
            >
            <span
                v-else
                class="text-xs font-mono text-foreground-text/40 ml-auto"
                >e.g. kondisi tubuh, energy level</span
            >
            <ChevronDown
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': show }"
            />
        </button>
        <div v-if="show || modelValue" class="mt-3">
            <textarea
                v-model="modelValue"
                rows="2"
                placeholder="Catat kondisi hari ini (AI Coach akan membaca ini)."
                class="w-full text-sm font-mono bg-yellow-50 border border-yellow-300 rounded p-3 text-foreground-text focus:outline-none focus:border-yellow-500 placeholder:text-gray-400 resize-none"
            ></textarea>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MessageSquare, ChevronDown } from "lucide-vue-next";
const modelValue = defineModel<string>({ default: "" });
const show = ref(false);
</script>
