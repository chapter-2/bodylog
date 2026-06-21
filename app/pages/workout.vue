<template>
    <div class="min-h-screen bg-white">
        <div v-if="isLoading" class="min-h-screen">
            <div
                class="inner border-x bg-[#fcfbf7] py-16 md:py-24 border-b border-separator text-center"
            >
                <div
                    class="w-12 h-12 mx-auto mb-4 bg-separator border-2 border-border animate-pulse rounded"
                ></div>
                <div
                    class="h-8 w-48 mx-auto mb-4 bg-separator border-2 border-border animate-pulse"
                ></div>
                <div
                    class="h-16 w-64 mx-auto bg-separator border-2 border-border animate-pulse"
                ></div>
            </div>
            <div class="inner border-x border-separator bg-white p-8 md:p-16">
                <div class="space-y-6">
                    <div v-for="i in 4" :key="i" class="border-2 border-separator p-6">
                        <div class="h-6 w-2/3 bg-separator mb-4 animate-pulse"></div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div
                                v-for="j in 4"
                                :key="j"
                                class="h-12 bg-separator/50 animate-pulse"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fixed bottom-8 right-8 z-50 animate-bounce-in">
                <div
                    class="flex items-center gap-3 px-4 py-3 bg-primary border-2 border-foreground-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div class="flex gap-1">
                        <span
                            class="w-2 h-2 bg-white rounded-full animate-bounce"
                            style="animation-delay: 0ms"
                        ></span>
                        <span
                            class="w-2 h-2 bg-white rounded-full animate-bounce"
                            style="animation-delay: 150ms"
                        ></span>
                        <span
                            class="w-2 h-2 bg-white rounded-full animate-bounce"
                            style="animation-delay: 300ms"
                        ></span>
                    </div>
                    <span
                        class="font-mono text-xs uppercase tracking-widest text-white font-bold"
                        >{{ loadingLabel }}</span
                    >
                </div>
            </div>
        </div>

        <div v-else>
            <div
                v-if="!isAuthenticated"
                class="inner border-x border-b-2 border-yellow-400 bg-yellow-50 px-6 py-4"
            >
                <div
                    class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                    <div class="flex items-center gap-3">
                        <Eye class="w-5 h-5 text-yellow-600 shrink-0" />
                        <div>
                            <p class="font-bold text-yellow-900 text-sm">PREVIEW MODE</p>
                            <p class="text-xs text-yellow-700 font-mono">
                                {{ previewText }}
                            </p>
                        </div>
                    </div>
                    <NuxtLink
                        to="/login"
                        class="px-6 py-2 bg-yellow-600 text-white font-bold text-xs uppercase rounded hover:bg-yellow-700 transition-colors whitespace-nowrap"
                    >
                        Login Now →
                    </NuxtLink>
                </div>
            </div>

            <div
                class="inner border-x bg-[#fcfbf7] py-16 md:py-24 border-b border-separator text-center"
            >
                <div class="flex justify-center mb-4">
                    <component :is="heroIcon" class="w-12 h-12 text-primary" :class="heroIconClass" :stroke-width="1.5" />
                </div>
                <span class="font-handwriting text-xl text-primary mb-2 block rotate-1"
                    >Time to grind!</span
                >
                <h1
                    class="text-5xl md:text-7xl font-black uppercase text-foreground-primary"
                    :class="pageTitleMb"
                >
                    {{ pageTitle }}
                </h1>
                <p
                    v-if="pageSubtitle"
                    class="font-mono text-xs text-foreground-text opacity-60 mb-8 uppercase tracking-widest"
                >
                    {{ pageSubtitle }}
                </p>

                <div
                    class="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full"
                >
                    <Calendar class="w-4 h-4 text-primary" />
                    <span class="font-mono text-sm text-primary font-bold"
                        >Today: {{ todayDayName }} • Week {{ calculatedWeek }}</span
                    >
                </div>

                <div class="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto px-4">
                    <button
                        v-for="d in ALL_DAYS"
                        :key="d.value"
                        @click="selectDay(d.value)"
                        :class="[
                            'px-4 py-2 rounded-lg font-bold text-sm transition-all border font-mono uppercase tracking-wider relative',
                            selectedDay === d.value
                                ? 'bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 z-10'
                                : isDayCompleted(d.value)
                                    ? 'bg-green-50 text-green-700 border-green-200 opacity-80'
                                    : isRestDay(d.value)
                                        ? 'bg-gray-50 text-foreground-text/50 border-separator'
                                        : d.value === todayDay
                                            ? 'bg-primary/5 text-primary border-primary hover:bg-primary/10'
                                            : 'bg-white text-foreground-text border-separator hover:bg-gray-50',
                        ]"
                    >
                        {{ d.label }}
                        <span
                            v-if="isDayCompleted(d.value)"
                            class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white"
                            >✓</span
                        >
                        <span
                            v-if="isRestDay(d.value) && !isDayCompleted(d.value)"
                            class="absolute -top-1 -right-1 w-4 h-4 bg-separator rounded-full flex items-center justify-center text-[8px] text-white font-bold shadow-sm"
                            >R</span
                        >
                        <span
                            v-if="
                                d.value === todayDay &&
                                !isDayCompleted(d.value) &&
                                !isRestDay(d.value)
                            "
                            class="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"
                        ></span>
                    </button>
                </div>

                <div
                    class="flex items-center justify-center gap-2 md:gap-6 mt-8 select-none"
                >
                    <button
                        @click="currentWeek = Math.max(1, currentWeek - 1)"
                        class="group flex items-center gap-2 p-3 md:p-4 text-xs md:text-sm font-mono uppercase hover:text-primary transition-colors disabled:opacity-30 active:scale-95 cursor-pointer"
                        :disabled="currentWeek === 1"
                    >
                        <ChevronLeft
                            class="w-6 h-6 group-hover:-translate-x-1 transition-transform"
                        />
                        Prev
                    </button>
                    <div class="flex flex-col items-center min-w-[140px]">
                        <span class="font-black text-2xl md:text-3xl leading-none"
                            >WEEK {{ currentWeek }}</span
                        >
                        <button
                            v-if="currentWeek !== calculatedWeek"
                            @click="initializeProgram"
                            class="text-[10px] font-mono text-primary bg-primary/10 px-3 py-1 rounded mt-2 hover:bg-primary/20 transition-colors uppercase font-bold tracking-widest active:scale-95 cursor-pointer"
                        >
                            Return to W{{ calculatedWeek }}
                        </button>
                        <span
                            v-else
                            class="text-[10px] font-mono text-foreground-text opacity-60 tracking-widest uppercase mt-2"
                            >{{ programLabel }}</span
                        >
                    </div>
                    <button
                        @click="currentWeek++"
                        class="group flex items-center gap-2 p-3 md:p-4 text-xs md:text-sm font-mono uppercase hover:text-primary transition-colors active:scale-95 cursor-pointer"
                    >
                        Next
                        <ChevronRight
                            class="w-6 h-6 group-hover:translate-x-1 transition-transform"
                        />
                    </button>
                </div>

                <div
                    v-if="weekCompletionStatus && isAuthenticated"
                    class="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white border border-separator rounded-full"
                >
                    <span class="font-mono text-xs text-foreground-text"
                        >Week {{ currentWeek }} Progress:</span
                    >
                    <span class="font-bold text-primary">{{ weekCompletionStatus }}</span>
                </div>
            </div>

            <div class="inner border-x border-separator bg-white">
                <div
                    v-if="isDayCompleted(selectedDay) && isAuthenticated"
                    class="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center justify-between"
                >
                    <div class="flex items-center gap-2">
                        <CheckCircle2 class="w-5 h-5 text-green-600" />
                        <span class="text-sm font-bold text-green-800"
                            >Session marked as completed</span
                        >
                    </div>
                    <span class="text-xs text-green-700 font-mono"
                        >You can still edit below</span
                    >
                </div>
                <WorkoutForm
                    :week="currentWeek"
                    :day="selectedDay"
                    @saved="handleSaved"
                />
            </div>

            <div class="inner border-x bg-white border-t border-separator">
                <div class="p-8 md:p-12">
                    <div class="flex items-center gap-3 mb-8">
                        <History class="w-6 h-6 text-primary" />
                        <h3 class="text-2xl font-black uppercase tracking-tight">
                            {{ historyTitle }}
                        </h3>
                    </div>

                    <div
                        v-if="workoutHistory.length > 0"
                        class="border border-separator rounded-xl overflow-hidden"
                    >
                        <div
                            class="grid grid-cols-12 gap-4 bg-background p-4 border-b border-separator font-mono text-xs font-bold uppercase tracking-widest text-foreground-text opacity-70"
                        >
                            <div class="col-span-2 md:col-span-1 text-center">Week</div>
                            <div class="col-span-5 md:col-span-4">Session</div>
                            <div class="col-span-5 md:col-span-4 text-right md:text-left">
                                Date
                            </div>
                            <div class="hidden md:block md:col-span-3 text-right">Status</div>
                        </div>

                        <div class="divide-y divide-separator">
                            <div
                                v-for="(workout, idx) in workoutHistory.slice(0, 5)"
                                :key="idx"
                                class="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#fcfbf7] transition-colors group"
                            >
                                <div class="col-span-2 md:col-span-1 flex justify-center">
                                    <span
                                        class="inline-flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary font-bold font-mono text-xs group-hover:bg-primary group-hover:text-white transition-colors"
                                    >
                                        {{ workout[0] }}
                                    </span>
                                </div>
                                <div class="col-span-5 md:col-span-4">
                                    <span
                                        class="font-bold text-sm md:text-base text-foreground-primary uppercase"
                                        >{{ workout[1] }}</span
                                    >
                                </div>
                                <div class="col-span-5 md:col-span-4 text-right md:text-left">
                                    <div
                                        class="flex items-center justify-end md:justify-start gap-2 text-foreground-text"
                                    >
                                        <Calendar class="w-3 h-3 opacity-50 hidden md:block" />
                                        <span class="font-mono text-xs">{{ workout[2] }}</span>
                                    </div>
                                </div>
                                <div class="hidden md:flex md:col-span-3 justify-end">
                                    <div
                                        v-if="workout[9] === 'YES'"
                                        class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-100 text-green-700"
                                    >
                                        <CheckCircle2 class="w-3 h-3" />
                                        <span
                                            class="text-[10px] font-bold uppercase tracking-wide"
                                            >Done</span
                                        >
                                    </div>
                                    <div
                                        v-else
                                        class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700"
                                    >
                                        <span
                                            class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                                        ></span>
                                        <span
                                            class="text-[10px] font-bold uppercase tracking-wide"
                                            >Draft</span
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-else
                        class="flex flex-col items-center justify-center py-16 border border-dashed border-separator rounded-xl bg-[#fcfbf7]"
                    >
                        <component :is="emptyIcon" class="w-12 h-12 text-separator mb-4 opacity-50" />
                        <p class="font-mono text-sm text-foreground-text opacity-60 mb-4">
                            {{
                                isAuthenticated
                                    ? emptyHistoryText
                                    : emptyHistoryGuestText
                            }}
                        </p>
                        <button
                            v-if="!isAuthenticated"
                            @click="navigateTo('/login')"
                            class="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold uppercase hover:bg-foreground-primary transition-colors"
                        >
                            Login to Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Dumbbell,
    Activity,
    Heart,
    Puzzle,
    ChevronLeft,
    ChevronRight,
    History,
    Calendar,
    CheckCircle2,
    Eye,
} from "lucide-vue-next";
import { ref, computed, onMounted, watch } from "vue";

const { isGym, isCalist, isCardio, mode: currentMode } = useMode();
const { isAuthenticated, checkAuth, secureFetch } = useAuth();

const isLoading = ref(true);
const currentWeek = ref(1);
const selectedDay = ref("monday");
const workoutHistory = ref<any[]>([]);
const completedSessions = ref<Set<string>>(new Set());
const globalConfig = ref<Record<string, any>>({});
const PROGRAM_START_DATE = ref<Date>(new Date());

const ALL_DAYS = [
    { label: "Mon", value: "monday" },
    { label: "Tue", value: "tuesday" },
    { label: "Wed", value: "wednesday" },
    { label: "Thu", value: "thursday" },
    { label: "Fri", value: "friday" },
    { label: "Sat", value: "saturday" },
    { label: "Sun", value: "sunday" },
];

// Mode-conditional values
const heroIcon = computed(() => {
    if (isGym.value) return Dumbbell;
    if (isCalist.value) return Activity;
    if (isCardio.value) return Heart;
    return Puzzle;
});
const heroIconClass = computed(() =>
    isGym.value ? "rotate-[-15deg]" : "",
);
const pageTitle = computed(() => {
    if (isGym.value) return "Gym Log";
    if (isCalist.value) return "Calist Log";
    if (isCardio.value) return "Cardio Log";
    return "Custom Program";
});
const pageTitleMb = computed(() => (isGym.value ? "mb-8" : "mb-4"));
const pageSubtitle = computed(() => {
    if (isGym.value) return null;
    if (isCalist.value) return "Pull-up Bar · Parallettes · Resistance Band";
    if (isCardio.value) return "Run · Cycle · Swim · Row";
    return null;
});
const loadingLabel = computed(() => {
    if (isGym.value) return "LOADING GYM DATA";
    if (isCalist.value) return "LOADING CALIST DATA";
    if (isCardio.value) return "LOADING CARDIO DATA";
    return "LOADING CUSTOM DATA";
});
const programLabel = computed(() => {
    if (isGym.value) return "Gym Program";
    if (isCalist.value) return "Calist Program";
    if (isCardio.value) return "Cardio Program";
    return "Custom Program";
});
const previewText = computed(() =>
    isGym.value
        ? "Login to save your workouts & track progress"
        : "Login to save your sessions & track progress",
);
const historyTitle = computed(() => {
    if (isGym.value) return "Recent Logs";
    if (isCalist.value) return "Recent Sessions";
    if (isCardio.value) return "Recent Sessions";
    return "Recent Logs";
});
const emptyHistoryText = computed(() => {
    if (isGym.value) return "No workouts logged yet.";
    if (isCalist.value) return "No sessions logged yet.";
    if (isCardio.value) return "No sessions logged yet.";
    return "No workouts logged yet.";
});
const emptyHistoryGuestText = computed(() => {
    if (isGym.value) return "Login to see your workout history.";
    if (isCalist.value) return "Login to see your session history.";
    if (isCardio.value) return "Login to see your session history.";
    return "Login to see your workout history.";
});
const emptyIcon = computed(() => {
    if (isGym.value) return Dumbbell;
    if (isCalist.value) return Activity;
    if (isCardio.value) return Heart;
    return Puzzle;
});

const apiMode = computed(() => currentMode.value || "gym");

function getDayName(dayValue: string) {
    if (globalConfig.value[dayValue]?.name) return globalConfig.value[dayValue].name;
    const defaults: any = {
        monday: "FULL BODY A",
        tuesday: "FULL BODY B",
        wednesday: "FULL BODY C",
        thursday: "FULL BODY A",
        friday: "FULL BODY B",
        saturday: "FULL BODY C",
        sunday: "FULL BODY D",
    };
    return defaults[dayValue] || dayValue.toUpperCase();
}

function isRestDay(dayValue: string) {
    const custom = globalConfig.value[dayValue];
    if (custom && custom.isRest !== undefined) return custom.isRest;
    return ["tuesday", "thursday", "saturday", "sunday"].includes(dayValue);
}

const workoutDays = computed(() => {
    return ALL_DAYS.map((d) => d.value).filter((d) => !isRestDay(d));
});

const calculatedWeek = computed(() => {
    const now = new Date();
    const start = new Date(PROGRAM_START_DATE.value);

    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = Math.max(0, now.getTime() - start.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(1, Math.floor(diffDays / 7) + 1);
});

const todayDay = computed(() => {
    const dayMap = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    return dayMap[new Date().getDay()];
});

const todayDayName = computed(() => {
    const names: Record<string, string> = {
        sunday: "Minggu",
        monday: "Senin",
        tuesday: "Selasa",
        wednesday: "Rabu",
        thursday: "Kamis",
        friday: "Jumat",
        saturday: "Sabtu",
    };
    return names[todayDay.value] || "";
});

const weekCompletionStatus = computed(() => {
    const wDays = workoutDays.value;
    const completed = wDays.filter((day) => isDayCompleted(day)).length;
    return `${completed}/${wDays.length} sessions`;
});

function isDayCompleted(day: string): boolean {
    if (isRestDay(day)) return false;
    const dayName = getDayName(day);
    const key = `${currentWeek.value}-${dayName}`;
    return completedSessions.value.has(key);
}

function selectDay(day: string) {
    selectedDay.value = day;
}

async function loadHistory() {
    try {
        const { data } = await secureFetch(`/api/workout/get?mode=${apiMode.value}`);
        const sortedData = (data as any[]).sort(
            (a, b) => parseInt(b[0] || 0) - parseInt(a[0] || 0),
        );

        const uniqueSessions = new Map<string, any[]>();
        const sessions = new Set<string>();

        sortedData.forEach((row) => {
            const week = row[0];
            const day = row[1];
            const isCompleted = row[9] === "YES";
            const key = `${week}-${day}`;

            if (!uniqueSessions.has(key)) uniqueSessions.set(key, row);
            if (week && day && isCompleted) sessions.add(key);
        });

        workoutHistory.value = Array.from(uniqueSessions.values());
        completedSessions.value = sessions;
    } catch (error) {}
}

function initializeProgram() {
    currentWeek.value = calculatedWeek.value;
    selectFirstIncompleteDay();
}

function selectFirstIncompleteDay() {
    const wDays = workoutDays.value;
    if (
        currentWeek.value === calculatedWeek.value &&
        wDays.includes(todayDay.value) &&
        !isDayCompleted(todayDay.value)
    ) {
        selectedDay.value = todayDay.value;
        return;
    }
    for (const day of wDays) {
        if (!isDayCompleted(day)) {
            selectedDay.value = day;
            return;
        }
    }
    selectedDay.value = wDays.length > 0 ? wDays[0] : "monday";
}

function handleSaved() {
    loadHistory();
}

watch(currentWeek, () => {
    selectFirstIncompleteDay();
});

watch(() => currentMode.value, async () => {
    if (isAuthenticated.value) {
        const configRes = (await secureFetch(
            `/api/program/get?mode=${currentMode.value}`,
        ).catch(() => ({}))) as any;
        if (configRes?.start_date) PROGRAM_START_DATE.value = new Date(configRes.start_date);
        if (configRes?.config) globalConfig.value = configRes.config;
        await loadHistory();
    }
    initializeProgram();
});

onMounted(async () => {
    isLoading.value = true;
    await checkAuth();

    try {
        if (isAuthenticated.value) {
            const configRes = (await secureFetch(
                `/api/program/get?mode=${apiMode.value}`,
            ).catch(() => ({}))) as any;
            if (configRes?.start_date) PROGRAM_START_DATE.value = new Date(configRes.start_date);
            if (configRes?.config) globalConfig.value = configRes.config;
            await loadHistory();
        }
        initializeProgram();
    } catch (error) {
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes bounceIn {
    0% {
        transform: scale(0.9);
        opacity: 0;
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
.animate-bounce-in {
    animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
