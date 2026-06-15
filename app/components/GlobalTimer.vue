<template>
  <div
    v-if="isVisible"
    class="fixed left-1/2 -translate-x-1/2 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 z-[9999] border-2 transition-all duration-300"
    :class="[
      timerPosition === 'top' ? 'top-6' : 'bottom-6',
      isRinging
        ? 'border-red-500 bg-red-950 scale-105'
        : timerActive && timerSeconds <= 10
          ? 'border-orange-500 bg-slate-800'
          : 'border-slate-700 bg-slate-900',
      timerSeconds === 0 && !timerActive && !isRinging
        ? 'opacity-50 hover:opacity-100'
        : 'opacity-100',
    ]"
  >
    <div class="flex items-center gap-2">
      <button
        type="button"
        @click="togglePosition"
        class="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400"
      >
        <ArrowDown v-if="timerPosition === 'top'" class="w-4 h-4" />
        <ArrowUp v-else class="w-4 h-4" />
      </button>
      <Timer class="w-4 h-4 text-slate-400 hidden md:block" />
      <div
        class="font-mono text-xl md:text-2xl font-bold w-16 md:w-20 text-center tracking-wider cursor-pointer md:cursor-auto"
        :class="{
          'text-red-400': isRinging || (timerActive && timerSeconds <= 10),
        }"
        @click="togglePosition"
      >
        {{ formattedTime }}
      </div>
    </div>

    <template v-if="isRinging">
      <div class="border-l border-red-800 pl-3 md:pl-4">
        <button
          type="button"
          @click="stopAlarm"
          class="px-6 py-1.5 md:py-2 bg-red-600 hover:bg-red-500 text-white font-black tracking-widest text-xs md:text-sm rounded-full transition-colors animate-pulse"
        >
          STOP
        </button>
      </div>
    </template>

    <template v-else>
      <div class="flex gap-1 md:gap-2 border-l border-slate-600 pl-3 md:pl-4">
        <button
          type="button"
          @click="addTime(30)"
          class="text-[10px] md:text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 px-2 py-1 md:py-1.5 rounded transition-colors"
        >
          +30s
        </button>
        <button
          type="button"
          @click="addTime(60)"
          class="text-[10px] md:text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 px-2 py-1 md:py-1.5 rounded transition-colors"
        >
          +1m
        </button>
      </div>
      <div class="flex gap-1 md:gap-2 border-l border-slate-600 pl-3 md:pl-4">
        <button
          type="button"
          @click="toggleTimer"
          class="p-1.5 md:p-2 rounded-full hover:bg-slate-700 transition-colors"
          :class="timerActive ? 'text-yellow-400' : 'text-emerald-400'"
        >
          <Pause
            v-if="timerActive"
            class="w-4 h-4 md:w-5 md:h-5 fill-current"
          />
          <Play v-else class="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />
        </button>
        <button
          type="button"
          @click="resetTimer"
          class="p-1.5 md:p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors"
        >
          <RotateCcw class="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  ArrowUp,
  ArrowDown,
} from "lucide-vue-next";
import { useTimer } from "~/composables/useTimer";

const {
  timerSeconds,
  timerActive,
  isRinging,
  showOnWorkoutPage,
  formattedTime,
  timerPosition,
  addTime,
  toggleTimer,
  resetTimer,
  stopAlarm,
  togglePosition,
} = useTimer();

const isVisible = computed(
  () => timerActive.value || isRinging.value || showOnWorkoutPage.value,
);
</script>
