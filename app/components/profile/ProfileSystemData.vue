<template>
    <section>
        <div
            class="flex items-center gap-3 mb-6 border-b-2 border-separator pb-2"
        >
            <DatabaseBackup class="w-6 h-6 text-primary shrink-0" />
            <h2
                class="text-xl md:text-2xl font-black uppercase tracking-widest text-foreground-primary leading-tight"
            >
                System & Data
            </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
                class="bg-[#fcfbf7] border-2 border-separator p-8 flex flex-col justify-between hover:border-primary transition-colors group"
            >
                <div>
                    <h3 class="font-black uppercase text-lg mb-2">
                        Data Export
                    </h3>
                    <p
                        class="font-mono text-sm text-foreground-text mb-6 leading-relaxed"
                    >
                        Unduh history latihan dan berat badanmu dalam format CSV
                        terpisah agar kolom tabel rapi saat dibuka di
                        Spreadsheet.
                    </p>
                </div>
                <div class="flex flex-col gap-3">
                    <button
                        @click="downloadBackup('workouts')"
                        :disabled="isDownloading"
                        class="w-full py-3 bg-white border-2 border-foreground-primary text-foreground-primary font-bold text-xs uppercase tracking-wider hover:bg-foreground-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Download class="w-4 h-4 shrink-0" />
                        <span>{{
                            isDownloading
                                ? "Exporting..."
                                : "Export Workouts (CSV)"
                        }}</span>
                    </button>
                    <button
                        @click="downloadBackup('weight')"
                        :disabled="isDownloading"
                        class="w-full py-3 bg-white border-2 border-foreground-primary text-foreground-primary font-bold text-xs uppercase tracking-wider hover:bg-foreground-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Download class="w-4 h-4 shrink-0" />
                        <span>{{
                            isDownloading
                                ? "Exporting..."
                                : "Export Weight Log (CSV)"
                        }}</span>
                    </button>
                </div>
            </div>

            <div
                class="bg-[#fcfbf7] border-2 border-separator p-8 flex flex-col justify-between hover:border-primary transition-colors group"
            >
                <div>
                    <h3 class="font-black uppercase text-lg mb-2">
                        Tutorial Preferences
                    </h3>
                    <p
                        class="font-mono text-sm text-foreground-text mb-6 leading-relaxed"
                    >
                        Lupa cara menggunakan aplikasi ini? Tekan tombol di
                        bawah untuk mengaktifkan ulang Onboarding Tour.
                    </p>
                </div>
                <button
                    @click="handleResetTour"
                    class="w-full py-3 bg-white border-2 border-foreground-primary text-foreground-primary font-bold text-sm uppercase tracking-wider hover:bg-foreground-primary hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <RefreshCw class="w-4 h-4 shrink-0" />
                    <span>Replay Tour</span>
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DatabaseBackup, Download, RefreshCw } from "lucide-vue-next";

const { secureFetch } = useAuth();
const { resetTour } = useMode();

const isDownloading = ref(false);

function handleResetTour() {
    resetTour();
    navigateTo("/");
}

async function downloadBackup(type: "workouts" | "weight") {
    isDownloading.value = true;
    try {
        const res = await secureFetch("/api/export/all");
        let csv = "";
        const escape = (val: any) => {
            if (val === null || val === undefined) return "";
            const str = String(val);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        let filename = "";

        if (type === "workouts") {
            csv =
                "MODE,WEEK,DAY,DATE,TIME,EXERCISE_NAME,SET1,SET2,SET3,SET4,COMPLETED,EXERCISE_NOTES,SESSION_NOTES\n";
            (res.gym_sessions || []).forEach((row: any) => {
                csv += `GYM,${escape(row.week)},${escape(row.day)},${escape(row.date)},${escape(row.time)},${escape(row.exercise_name)},${escape(row.set1)},${escape(row.set2)},${escape(row.set3)},${escape(row.set4)},${escape(row.completed)},${escape(row.notes)},${escape(row.session_note)}\n`;
            });
            (res.calist_sessions || []).forEach((row: any) => {
                csv += `CALISTHENICS,${escape(row.week)},${escape(row.day)},${escape(row.date)},${escape(row.time)},${escape(row.exercise_name)},${escape(row.set1)},${escape(row.set2)},${escape(row.set3)},${escape(row.set4)},${escape(row.completed)},${escape(row.notes)},${escape(row.session_note)}\n`;
            });
            filename = `bodylog_workouts_${new Date().toISOString().split("T")[0]}.csv`;
        } else {
            csv = "WEEK,DATE,WEIGHT_KG,NOTES\n";
            (res.weight_entries || []).forEach((row: any) => {
                csv += `${escape(row.week)},${escape(row.date)},${escape(row.weight)},${escape(row.notes)}\n`;
            });
            filename = `bodylog_weight_${new Date().toISOString().split("T")[0]}.csv`;
        }

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const el = document.createElement("a");
        el.setAttribute("href", url);
        el.setAttribute("download", filename);
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
        URL.revokeObjectURL(url);
    } catch {
        alert("Failed to download CSV backup.");
    } finally {
        isDownloading.value = false;
    }
}
</script>
