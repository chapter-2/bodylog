export type Intensity = 'beginner' | 'intermediate' | 'advanced';
export type Mode = 'gym' | 'calist' | 'cardio';

export interface ExerciseDef {
    name: string;
    sets: number;
    target: string; 
}

export interface DayTemplate {
    day: string;
    focus: string;
    exercises: ExerciseDef[];
}

const INDO_DAYS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];

export function generateProgram(mode: Mode, intensity: Intensity, frequency: number): DayTemplate[] {
    const program: DayTemplate[] = [];
    
    // Base Set Modifier based on Intensity
    const setMod = intensity === 'beginner' ? 2 : (intensity === 'intermediate' ? 3 : 4);
    
    // Rep/Target string generator
    const getTarget = (m: Mode, isHold: boolean = false) => {
        if (m === 'cardio') return "30 mins";
        if (m === 'calist') return isHold ? "15s hold" : "10 reps";
        return "- kg × 10"; 
    };

    // Helper to pick exercises
    const getExercises = (focusType: string): ExerciseDef[] => {
        if (mode === 'cardio') {
            return [{ name: "Treadmill / Lari", sets: 1, target: intensity === 'advanced' ? "60 mins" : "30 mins" }];
        }

        if (mode === 'gym') {
            switch(focusType) {
                case 'Upper': return [
                    { name: "Barbell Bench Press", sets: setMod, target: getTarget('gym') },
                    { name: "Lat Pulldown", sets: setMod, target: getTarget('gym') },
                    { name: "Overhead Press", sets: setMod, target: getTarget('gym') }
                ];
                case 'Lower': return [
                    { name: "Squat / Leg Press", sets: setMod + 1, target: getTarget('gym') },
                    { name: "Leg Curl", sets: setMod, target: getTarget('gym') },
                    { name: "Calf Raise", sets: setMod, target: getTarget('gym') }
                ];
                case 'Push': return [
                    { name: "Barbell Bench Press", sets: setMod, target: getTarget('gym') },
                    { name: "Incline Dumbbell Press", sets: setMod, target: getTarget('gym') },
                    { name: "Tricep Pushdown", sets: setMod, target: getTarget('gym') }
                ];
                case 'Pull': return [
                    { name: "Pull-Up / Lat Pulldown", sets: setMod, target: getTarget('gym') },
                    { name: "Barbell Row", sets: setMod, target: getTarget('gym') },
                    { name: "Bicep Curl", sets: setMod, target: getTarget('gym') }
                ];
                default: return [
                    { name: "Full Body Compound", sets: setMod, target: getTarget('gym') }
                ];
            }
        } else {
            // Calisthenics
            switch(focusType) {
                case 'Upper': return [
                    { name: "Pull-Up", sets: setMod, target: getTarget('calist') },
                    { name: "Dips", sets: setMod, target: getTarget('calist') },
                    { name: "L-Sit", sets: setMod, target: getTarget('calist', true) }
                ];
                case 'Lower': return [
                    { name: "Pistol Squat Progression", sets: setMod, target: getTarget('calist') },
                    { name: "Lunges", sets: setMod, target: getTarget('calist') }
                ];
                default: return [
                    { name: "Push-Up", sets: setMod, target: getTarget('calist') },
                    { name: "Plank", sets: setMod, target: getTarget('calist', true) }
                ];
            }
        }
    };

    // Determine Split Strategy based on frequency
    let splits: string[] = [];
    if (frequency <= 3) splits = ["Upper", "REST", "Lower", "REST", "Upper", "REST", "REST"];
    else if (frequency === 4) splits = ["Upper", "Lower", "REST", "Upper", "Lower", "REST", "REST"];
    else if (frequency === 5) splits = ["Push", "Pull", "Lower", "REST", "Upper", "Lower", "REST"];
    else splits = ["Push", "Pull", "Lower", "Push", "Pull", "Lower", "REST"];

    // Build the 7-day structure
    for (let i = 0; i < 7; i++) {
        const focus = splits[i];
        if (focus === "REST") {
            program.push({ day: INDO_DAYS[i], focus: "REST", exercises: [] });
        } else {
            program.push({ day: INDO_DAYS[i], focus: focus, exercises: getExercises(focus) });
        }
    }

    return program;
}
