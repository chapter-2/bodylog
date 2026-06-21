<template>
  <div class="p-6 md:p-8 hover:bg-[#fcfbf7] transition-colors group">
    <div class="flex justify-between items-start mb-4 gap-4">
      <div class="flex flex-col gap-1 w-full min-w-0">
        <div
          v-if="exercise.targetReps && exercise.targetReps > 0"
          class="inline-flex items-center gap-1.5 w-fit mb-1"
        >
          <span
            class="font-mono text-[10px] text-foreground-text/50 uppercase tracking-widest"
            >Target:</span
          >
          <span
            class="font-mono text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded"
          >
            {{ exercise.sets.length }}×{{ exercise.targetReps
            }}{{
              mode === "calist" && exercise.type === "hold" ? "s" : " reps"
            }}
          </span>
        </div>

        <div class="flex items-center gap-2 flex-wrap min-w-0">
          <h4
            class="text-2xl font-bold group-hover:text-primary transition-colors uppercase leading-tight break-words min-w-0 flex-1"
          >
            {{
              mode === "gym" && exercise.variants
                ? exercise.name
                : exercise.name
            }}
          </h4>
          <span
            v-if="mode === 'calist'"
            class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border shrink-0"
            :class="
              exercise.type === 'hold'
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            "
          >
            {{ exercise.type === "hold" ? "HOLD (detik)" : "REPS" }}
          </span>
        </div>

        <div v-if="options.length > 0" class="flex flex-wrap gap-2 mt-2">
          <label
            v-for="opt in options"
            :key="opt.value"
            class="flex items-center gap-2 cursor-pointer group/opt"
          >
            <input
              type="radio"
              :value="opt.value"
              v-model="selectedOption"
              class="peer hidden"
            />
            <span
              class="w-4 h-4 border-2 border-separator rounded-full flex items-center justify-center transition-colors peer-checked:border-primary shrink-0"
            >
              <span
                class="w-2 h-2 bg-primary rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"
              ></span>
            </span>
            <span
              class="font-mono text-sm text-foreground-text group-hover/opt:text-primary peer-checked:text-primary peer-checked:font-bold transition-colors"
            >
              {{ opt.label }}
            </span>
          </label>
        </div>

        <button
          type="button"
          @click="toggleNote"
          class="text-xs font-mono text-foreground-text/60 hover:text-primary flex items-center gap-1 w-fit mt-1"
        >
          <MessageSquare class="w-3 h-3" />
          <span v-if="exercise.note" class="text-primary font-bold"
            >Edit Note</span
          >
          <span v-else
            >Add Note (e.g.
            {{ mode === "gym" ? "Gym crowded" : "kondisi, form cues" }})</span
          >
        </button>

        <div v-if="exercise.showNote || exercise.note" class="mt-2">
          <input
            v-model="exercise.note"
            type="text"
            :placeholder="
              mode === 'gym'
                ? 'Kenapa ganti alat? Kenapa beban turun?'
                : 'Kenapa beda dari biasanya?'
            "
            class="w-full text-sm font-mono bg-yellow-50 border border-yellow-200 rounded p-2 text-foreground-text focus:outline-none focus:border-yellow-400 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div class="flex flex-col items-end gap-2 shrink-0">
        <span
          class="font-mono text-xs border border-separator px-2 py-1 rounded bg-white whitespace-nowrap"
        >
          {{ exercise.sets.length }} SETS
        </span>
        <a
          :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(effectiveName + (mode === 'gym' ? ' form tutorial' : ' tutorial form calisthenics'))}`"
          target="_blank"
          class="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap"
        >
          <Youtube class="w-3 h-3" />
          <span class="font-bold text-[10px] tracking-wider">WATCH</span>
        </a>
      </div>
    </div>

    <div
      v-if="lastWeekData"
      class="mb-4 p-3 bg-background rounded border border-separator"
    >
      <div class="flex items-center justify-between gap-2 mb-1">
        <span
          class="font-mono text-xs uppercase tracking-wider text-foreground-text opacity-70"
        >
          Last Week (W{{ week - 1 }}):
          <span
            v-if="lastWeekData.name && lastWeekData.name !== effectiveName"
            class="text-primary ml-1"
          >
            [{{ lastWeekData.name }}]
          </span>
        </span>
        <span
          class="font-mono text-[9px] text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded uppercase hidden md:inline-block"
          >Tap to copy</span
        >
      </div>

      <div class="flex gap-2 mt-1 flex-wrap">
        <button
          type="button"
          v-for="(setStr, idx) in lastWeekData.sets"
          :key="idx"
          @click="copyLastWeekSet(idx, setStr)"
          class="font-mono text-xs bg-white px-2 py-1 rounded border border-separator cursor-pointer hover:border-primary hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
          title="Tap to autofill this set"
        >
          {{ setStr }}
        </button>
      </div>
    </div>

    <div
      :class="
        mode === 'gym'
          ? 'grid grid-cols-1 md:grid-cols-4 gap-4'
          : 'grid grid-cols-2 md:grid-cols-4 gap-4'
      "
    >
      <div
        v-for="(set, setIdx) in exercise.sets"
        :key="setIdx"
        class="flex items-center gap-2 transition-all duration-500 ease-out"
        :class="
          isSetCompleted(set)
            ? 'opacity-40 hover:opacity-100 focus-within:opacity-100 scale-[0.98]'
            : 'opacity-100 scale-100'
        "
      >
        <span
          class="font-mono text-xs w-6 pt-1 transition-colors flex items-center gap-0.5"
          :class="
            isSetCompleted(set) ? 'text-emerald-500 font-black' : 'text-primary'
          "
        >
          <span v-if="isSetCompleted(set)">✓</span>
          <span v-else>S{{ setIdx + 1 }}</span>
        </span>

        <template v-if="mode === 'gym'">
          <div class="relative w-full">
            <input
              v-model.number="set.weight"
              type="number"
              step="0.5"
              placeholder="KG"
              @focus="$event.target.select()"
              class="w-full bg-transparent border-b border-separator py-1 font-bold text-center focus:outline-none focus:border-primary transition-colors"
              :class="{
                'text-emerald-700 border-emerald-200': isSetCompleted(set),
              }"
            />
          </div>
          <span class="text-separator text-sm">×</span>
          <div class="relative w-full">
            <input
              v-model.number="set.reps"
              type="number"
              placeholder="REPS"
              @focus="$event.target.select()"
              class="w-full bg-transparent border-b border-separator py-1 font-bold text-center focus:outline-none focus:border-primary transition-colors"
              :class="{
                'text-emerald-700 border-emerald-200': isSetCompleted(set),
              }"
            />
          </div>
        </template>

        <template v-else>
          <div class="relative w-full">
            <input
              v-model.number="set.value"
              type="number"
              :placeholder="exercise.type === 'hold' ? 'SEC' : 'REPS'"
              @focus="$event.target.select()"
              class="w-full bg-transparent border-b border-separator py-1 font-bold text-center focus:outline-none focus:border-primary transition-colors"
              :class="{
                'text-emerald-700 border-emerald-200': isSetCompleted(set),
              }"
            />
          </div>
          <span class="text-separator text-xs font-mono shrink-0">
            {{ exercise.type === "hold" ? "s" : "reps" }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MessageSquare, Youtube } from "lucide-vue-next";

const props = defineProps<{
  mode: "gym" | "calist" | "cardio" | "custom";
  week: number;
  lastWeekData?: { sets: string[]; name: string };
}>();

const exercise = defineModel<any>({ required: true });

function toggleNote() {
  exercise.value.showNote = !exercise.value.showNote;
}

const effectiveName = computed(() => {
  if (props.mode === "gym")
    return exercise.value.selectedVariant || exercise.value.name;
  return exercise.value.selectedSub || exercise.value.name;
});

const options = computed(() => {
  if (props.mode === "gym" && exercise.value.variants) {
    return exercise.value.variants.map((v: string) => ({
      label: v,
      value: v,
    }));
  }
  if (props.mode === "calist" && exercise.value.subs) {
    return exercise.value.subs;
  }
  return [];
});

const selectedOption = computed({
  get: () =>
    props.mode === "gym"
      ? exercise.value.selectedVariant
      : exercise.value.selectedSub,
  set: (val) => {
    if (props.mode === "gym") exercise.value.selectedVariant = val;
    else exercise.value.selectedSub = val;
  },
});

function isSetCompleted(set: any): boolean {
  if (props.mode === "gym") {
    return (
      set.weight !== null &&
      set.weight !== "" &&
      set.reps !== null &&
      set.reps !== ""
    );
  }
  return set.value !== null && set.value !== "";
}

function copyLastWeekSet(index: number, setString: string) {
  if (!exercise.value.sets[index]) return;

  if (props.mode === "gym") {
    const parts = setString.replace(/kg/gi, "").split("×");
    if (parts.length === 2) {
      exercise.value.sets[index].weight = parseFloat(parts[0].trim());
      exercise.value.sets[index].reps = parseFloat(parts[1].trim());
    }
  } else {
    const parsedVal = parseFloat(setString);
    if (!isNaN(parsedVal)) {
      exercise.value.sets[index].value = parsedVal;
    }
  }

  if ("vibrate" in navigator) navigator.vibrate(50);
}
</script>
