<template>
    <section>
        <div
            class="flex items-center gap-3 mb-6 border-b-2 border-separator pb-2"
        >
            <CalendarDays class="w-6 h-6 text-primary shrink-0" />
            <h2
                class="text-xl md:text-2xl font-black uppercase tracking-widest text-foreground-primary leading-tight"
            >
                Protocol Configuration
            </h2>
        </div>

        <div class="grid grid-cols-1 gap-8">
            <div
                id="tour-start-dates"
                class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
                <h3 class="font-black uppercase text-lg mb-2">
                    Program Start Dates
                </h3>
                <p
                    class="font-mono text-xs text-foreground-text mb-6 leading-relaxed max-w-2xl"
                >
                    Week number dihitung otomatis dari tanggal ini.
                    <span class="text-primary font-bold"
                        >Jangan diubah jika program latihanmu sudah
                        berjalan.</span
                    >
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            class="font-mono text-xs uppercase tracking-widest text-foreground-text mb-2 flex items-center gap-2"
                        >
                            <Dumbbell class="w-4 h-4 text-primary" /> Gym
                            Program Start
                        </label>
                        <input
                            v-model="gymStartDate"
                            type="date"
                            class="w-full bg-transparent border-b-2 border-separator py-2 font-mono text-lg text-foreground-primary outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label
                            class="font-mono text-xs uppercase tracking-widest text-foreground-text mb-2 flex items-center gap-2"
                        >
                            <Activity class="w-4 h-4 text-primary" /> Calist
                            Program Start
                        </label>
                        <input
                            v-model="calistStartDate"
                            type="date"
                            class="w-full bg-transparent border-b-2 border-separator py-2 font-mono text-lg text-foreground-primary outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <button
                    @click="saveStartDates"
                    :disabled="isSavingDates"
                    class="mt-8 w-full py-4 border-2 border-foreground-primary text-foreground-primary font-bold text-sm uppercase tracking-wider hover:bg-foreground-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Save class="w-4 h-4" />
                    {{ isSavingDates ? "Saving Dates..." : "Save Start Dates" }}
                </button>
                <div
                    v-if="dateMsg"
                    :class="
                        dateStatus === 'error'
                            ? 'text-red-500 bg-red-50 border-red-100'
                            : 'text-green-700 bg-green-50 border-green-100'
                    "
                    class="mt-4 text-sm font-bold border p-3 rounded text-center"
                >
                    {{ dateMsg }}
                </div>
            </div>

            <div
                id="tour-weekly-schedule"
                class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
                <h3 class="font-black uppercase text-lg mb-2">
                    Weekly Schedule Manager
                </h3>
                <p
                    class="font-mono text-sm text-foreground-text mb-6 leading-relaxed"
                >
                    Atur hari latihan dan hari libur secara global. Ubah nama
                    hari dan fokus otot di sini. Data latihan di Program Editor
                    tidak akan hilang meskipun hari tersebut dimatikan.
                </p>

                <div class="flex gap-2 mb-6 border-b-2 border-separator pb-4">
                    <button
                        @click="scheduleMode = 'gym'"
                        :class="
                            scheduleMode === 'gym'
                                ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 border-primary'
                                : 'bg-[#fcfbf7] text-foreground-primary border-separator hover:bg-gray-100'
                        "
                        class="px-6 py-2 border-2 font-bold uppercase text-sm transition-all tracking-widest flex items-center gap-2"
                    >
                        <Dumbbell class="w-4 h-4" /> GYM
                    </button>
                    <button
                        @click="scheduleMode = 'calist'"
                        :class="
                            scheduleMode === 'calist'
                                ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 border-primary'
                                : 'bg-[#fcfbf7] text-foreground-primary border-separator hover:bg-gray-100'
                        "
                        class="px-6 py-2 border-2 font-bold uppercase text-sm transition-all tracking-widest flex items-center gap-2"
                    >
                        <Activity class="w-4 h-4" /> CALIST
                    </button>
                </div>

                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <div
                        v-for="day in ALL_DAYS"
                        :key="day"
                        class="border-2 p-5 transition-all relative overflow-hidden"
                        :class="
                            schedule[scheduleMode][day].isRest
                                ? 'border-separator bg-gray-100 opacity-70'
                                : 'border-foreground-primary bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
                        "
                    >
                        <div
                            class="flex justify-between items-center gap-3 mb-5"
                        >
                            <h4
                                class="font-black uppercase tracking-widest truncate flex-1"
                                :class="
                                    schedule[scheduleMode][day].isRest
                                        ? 'text-separator'
                                        : 'text-primary'
                                "
                            >
                                {{ day }}
                            </h4>

                            <label
                                class="relative inline-flex items-center cursor-pointer shrink-0"
                            >
                                <input
                                    type="checkbox"
                                    v-model="schedule[scheduleMode][day].isRest"
                                    class="sr-only peer"
                                    :true-value="false"
                                    :false-value="true"
                                />
                                <div
                                    class="w-12 h-6 bg-gray-300 border-2 border-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary shadow-inner"
                                ></div>
                            </label>
                        </div>

                        <div
                            v-if="!schedule[scheduleMode][day].isRest"
                            class="space-y-4"
                        >
                            <div>
                                <label
                                    class="block font-mono text-[10px] uppercase text-foreground-text opacity-70 mb-1"
                                    >Session Title</label
                                >
                                <input
                                    v-model="schedule[scheduleMode][day].name"
                                    type="text"
                                    placeholder="e.g. SENIN / PUSH"
                                    class="w-full text-sm font-bold border-b-2 border-separator py-1 focus:border-primary outline-none bg-transparent uppercase transition-colors"
                                />
                            </div>
                            <div>
                                <label
                                    class="block font-mono text-[10px] uppercase text-foreground-text opacity-70 mb-1"
                                    >Muscle Focus</label
                                >
                                <input
                                    v-model="schedule[scheduleMode][day].focus"
                                    type="text"
                                    placeholder="e.g. Chest & Triceps"
                                    class="w-full text-xs font-mono border-b-2 border-separator py-1 focus:border-primary outline-none bg-transparent transition-colors"
                                />
                            </div>
                        </div>
                        <div v-else class="py-6 text-center">
                            <span
                                class="font-mono text-xs font-bold text-foreground-text uppercase tracking-widest opacity-60 flex items-center justify-center gap-2"
                            >
                                <BedDouble class="w-4 h-4" /> REST DAY
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    @click="saveSchedule"
                    :disabled="isSavingSchedule"
                    class="mt-8 w-full py-4 bg-primary text-white font-black text-sm md:text-base uppercase tracking-wider hover:bg-foreground-primary transition-colors flex items-center justify-center gap-3 disabled:opacity-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-1"
                >
                    <Save class="hidden md:block w-5 h-5 shrink-0" />
                    <span>{{
                        isSavingSchedule
                            ? "Saving Configuration..."
                            : "Save Global Schedule"
                    }}</span>
                </button>
                <div
                    v-if="schedMsg"
                    :class="
                        schedStatus === 'error'
                            ? 'text-red-500 bg-red-50 border-red-100'
                            : 'text-green-700 bg-green-50 border-green-100'
                    "
                    class="mt-4 text-sm font-bold border p-3 rounded text-center"
                >
                    {{ schedMsg }}
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
    CalendarDays,
    Save,
    Dumbbell,
    Activity,
    BedDouble,
} from "lucide-vue-next";

const { secureFetch } = useAuth();

const gymStartDate = ref("");
const calistStartDate = ref("");
const isSavingDates = ref(false);
const dateMsg = ref("");
const dateStatus = ref<"error" | "success">("success");

async function saveStartDates() {
    isSavingDates.value = true;
    dateMsg.value = "";
    try {
        const promises = [];
        if (gymStartDate.value)
            promises.push(
                secureFetch("/api/program/start-date", {
                    method: "POST",
                    body: { mode: "gym", date: gymStartDate.value },
                }),
            );
        if (calistStartDate.value)
            promises.push(
                secureFetch("/api/program/start-date", {
                    method: "POST",
                    body: { mode: "calist", date: calistStartDate.value },
                }),
            );
        await Promise.all(promises);
        dateStatus.value = "success";
        dateMsg.value = "✓ Start dates saved successfully.";
    } catch (e: any) {
        dateStatus.value = "error";
        dateMsg.value = e.data?.message || "Failed to save start dates.";
    } finally {
        isSavingDates.value = false;
    }
}

const ALL_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];
const scheduleMode = ref<"gym" | "calist">("gym");

const defaultSchedule = {
    gym: {
        monday: {
            name: "FULL BODY A",
            focus: "Squat, Bench, Row",
            isRest: false,
        },
        tuesday: {
            name: "FULL BODY B",
            focus: "Deadlift, OHP, Pull-down",
            isRest: true,
        },
        wednesday: {
            name: "FULL BODY C",
            focus: "Leg Press, Dips, Cable Row",
            isRest: false,
        },
        thursday: {
            name: "FULL BODY A",
            focus: "Squat, Bench, Row",
            isRest: true,
        },
        friday: {
            name: "FULL BODY B",
            focus: "Deadlift, OHP, Pull-down",
            isRest: false,
        },
        saturday: {
            name: "FULL BODY C",
            focus: "Leg Press, Dips, Cable Row",
            isRest: true,
        },
        sunday: {
            name: "FULL BODY D",
            focus: "Accessories & Core",
            isRest: true,
        },
    },
    calist: {
        monday: {
            name: "FULL BODY A",
            focus: "Pull-ups & Push-ups",
            isRest: false,
        },
        tuesday: {
            name: "FULL BODY B",
            focus: "Chin-ups & Dips",
            isRest: true,
        },
        wednesday: {
            name: "FULL BODY C",
            focus: "Rows & Pike Push",
            isRest: false,
        },
        thursday: {
            name: "FULL BODY A",
            focus: "Pull-ups & Push-ups",
            isRest: true,
        },
        friday: {
            name: "FULL BODY B",
            focus: "Chin-ups & Dips",
            isRest: false,
        },
        saturday: {
            name: "FULL BODY C",
            focus: "Rows & Pike Push",
            isRest: true,
        },
        sunday: { name: "FULL BODY D", focus: "Skills & Core", isRest: true },
    },
};

const schedule = ref(JSON.parse(JSON.stringify(defaultSchedule)));
const rawConfig = ref({
    gym: {} as Record<string, any>,
    calist: {} as Record<string, any>,
});

const isSavingSchedule = ref(false);
const schedMsg = ref("");
const schedStatus = ref<"error" | "success">("success");

async function loadSettings() {
    try {
        const gymRes = (await secureFetch("/api/program/get?mode=gym").catch(
            () => ({}),
        )) as any;
        if (gymRes?.start_date) gymStartDate.value = gymRes.start_date;
        if (gymRes?.config) {
            rawConfig.value.gym = gymRes.config;
            ALL_DAYS.forEach((day) => {
                if (gymRes.config[day]) {
                    schedule.value.gym[day].name =
                        gymRes.config[day].name || schedule.value.gym[day].name;
                    schedule.value.gym[day].focus =
                        gymRes.config[day].focus ||
                        schedule.value.gym[day].focus;
                    schedule.value.gym[day].isRest =
                        gymRes.config[day].isRest === true;
                }
            });
        }

        const calistRes = (await secureFetch(
            "/api/program/get?mode=calist",
        ).catch(() => ({}))) as any;
        if (calistRes?.start_date) calistStartDate.value = calistRes.start_date;
        if (calistRes?.config) {
            rawConfig.value.calist = calistRes.config;
            ALL_DAYS.forEach((day) => {
                if (calistRes.config[day]) {
                    schedule.value.calist[day].name =
                        calistRes.config[day].name ||
                        schedule.value.calist[day].name;
                    schedule.value.calist[day].focus =
                        calistRes.config[day].focus ||
                        schedule.value.calist[day].focus;
                    schedule.value.calist[day].isRest =
                        calistRes.config[day].isRest === true;
                }
            });
        }
    } catch (e) {
        console.error(e);
    }
}

async function saveSchedule() {
    isSavingSchedule.value = true;
    schedMsg.value = "";
    try {
        const mode = scheduleMode.value;
        const configToSave = { ...rawConfig.value[mode] };

        ALL_DAYS.forEach((day) => {
            configToSave[day] = {
                ...(configToSave[day] || {}),
                name: schedule.value[mode][day].name,
                focus: schedule.value[mode][day].focus,
                isRest: schedule.value[mode][day].isRest,
            };
        });

        await secureFetch("/api/program/save", {
            method: "POST",
            body: { mode, config: configToSave },
        });

        rawConfig.value[mode] = configToSave;
        schedStatus.value = "success";
        schedMsg.value = `✓ Global Schedule for ${mode.toUpperCase()} saved.`;
    } catch (e: any) {
        schedStatus.value = "error";
        schedMsg.value = e.data?.message || "Failed to save schedule.";
    } finally {
        isSavingSchedule.value = false;
    }
}

onMounted(() => {
    loadSettings();
});
</script>
