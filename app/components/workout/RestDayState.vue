<template>
    <div
        class="flex flex-col items-center justify-center py-24 text-center p-8"
    >
        <div
            class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary"
        >
            <BedDouble class="w-10 h-10" />
        </div>
        <h3 class="text-2xl font-bold uppercase mb-2">Rest & Recover</h3>
        <p class="font-mono text-foreground-text opacity-60 max-w-md">
            No workouts scheduled for today. Take a break, eat well, and get
            ready for the next grind!
        </p>
    </div>
</template>

<script setup lang="ts">
import { BedDouble } from "lucide-vue-next";
</script>
