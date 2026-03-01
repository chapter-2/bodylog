<template>
    <div class="p-8 bg-background">
        <div
            class="flex flex-col md:flex-row items-center justify-between gap-6"
        >
            <label class="flex items-center gap-3 cursor-pointer group">
                <input
                    type="checkbox"
                    v-model="completed"
                    class="peer hidden"
                />
                <div
                    class="w-6 h-6 border-2 border-border rounded flex items-center justify-center transition-colors peer-checked:bg-primary peer-checked:border-primary"
                >
                    <Check
                        class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        stroke-width="3"
                    />
                </div>
                <span
                    class="font-bold text-foreground-primary group-hover:text-primary transition-colors"
                    >Session Completed</span
                >
            </label>
            <button
                type="submit"
                :disabled="saving"
                class="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-foreground-primary transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {{ saving ? "Saving..." : "Save Session" }}
            </button>
        </div>
        <div
            v-if="saveError"
            class="mt-4 text-red-500 font-bold text-center border border-red-200 bg-red-50 p-2 rounded"
        >
            {{ saveError }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { Check } from "lucide-vue-next";
const completed = defineModel<boolean>("completed", { required: true });
defineProps<{ saving: boolean; saveError: string }>();
</script>
