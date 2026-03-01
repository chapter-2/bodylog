export const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const gymProgramDefaults: Record<string, any> = {
    monday: { isRest: false, name: "FULL BODY A", focus: "Squat, Bench, Row", exercises: [
        { name: "Barbell Squat", sets: 4, targetReps: 8, equipment: ["Barbell", "Smith Machine"] },
        { name: "Barbell Bench Press", sets: 4, targetReps: 8, equipment: ["Barbell", "Dumbbell"] },
        { name: "Barbell Row", sets: 3, targetReps: 10, equipment: ["Barbell", "Machine"] },
        { name: "Overhead Press", sets: 3, targetReps: 10, equipment: ["Barbell", "Dumbbell"] },
        { name: "Bicep Curl", sets: 3, targetReps: 12, equipment: ["Cable", "Dumbbell"] },
    ]},
    tuesday: { isRest: true, name: "FULL BODY B", focus: "Deadlift, OHP, Pull-down", exercises: [
        { name: "Deadlift / RDL", sets: 4, targetReps: 8, equipment: ["Barbell", "Dumbbell"] },
        { name: "Incline Dumbbell Press", sets: 3, targetReps: 10, equipment: ["Dumbbell", "Barbell"] },
        { name: "Lat Pulldown", sets: 3, targetReps: 10, equipment: ["Cable", "Machine"] },
        { name: "Lateral Raise", sets: 3, targetReps: 15, equipment: ["Dumbbell", "Cable"] },
        { name: "Tricep Pushdown", sets: 3, targetReps: 12, equipment: ["Cable"] },
    ]},
    wednesday: { isRest: false, name: "FULL BODY C", focus: "Leg Press, Dips, Cable Row", exercises: [
        { name: "Leg Press", sets: 4, targetReps: 10, equipment: ["Machine"] },
        { name: "Dips / Machine Press", sets: 3, targetReps: 10, equipment: ["Machine", "Bodyweight"] },
        { name: "Seated Cable Row", sets: 3, targetReps: 10, equipment: ["Cable", "Machine"] },
        { name: "Leg Curl", sets: 3, targetReps: 12, equipment: ["Machine"] },
        { name: "Face Pull", sets: 3, targetReps: 15, equipment: ["Cable"] },
    ]},
    thursday: { isRest: true, name: "FULL BODY A", focus: "Squat, Bench, Row", exercises: [
        { name: "Barbell Squat", sets: 4, targetReps: 8, equipment: ["Barbell", "Smith Machine"] },
        { name: "Barbell Bench Press", sets: 4, targetReps: 8, equipment: ["Barbell", "Dumbbell"] },
        { name: "Barbell Row", sets: 3, targetReps: 10, equipment: ["Barbell", "Machine"] },
        { name: "Overhead Press", sets: 3, targetReps: 10, equipment: ["Barbell", "Dumbbell"] },
        { name: "Bicep Curl", sets: 3, targetReps: 12, equipment: ["Cable", "Dumbbell"] },
    ]},
    friday: { isRest: false, name: "FULL BODY B", focus: "Deadlift, OHP, Pull-down", exercises: [
        { name: "Deadlift / RDL", sets: 4, targetReps: 8, equipment: ["Barbell", "Dumbbell"] },
        { name: "Incline Dumbbell Press", sets: 3, targetReps: 10, equipment: ["Dumbbell", "Barbell"] },
        { name: "Lat Pulldown", sets: 3, targetReps: 10, equipment: ["Cable", "Machine"] },
        { name: "Lateral Raise", sets: 3, targetReps: 15, equipment: ["Dumbbell", "Cable"] },
        { name: "Tricep Pushdown", sets: 3, targetReps: 12, equipment: ["Cable"] },
    ]},
    saturday: { isRest: true, name: "FULL BODY C", focus: "Leg Press, Dips, Cable Row", exercises: [
        { name: "Leg Press", sets: 4, targetReps: 10, equipment: ["Machine"] },
        { name: "Dips / Machine Press", sets: 3, targetReps: 10, equipment: ["Machine", "Bodyweight"] },
        { name: "Seated Cable Row", sets: 3, targetReps: 10, equipment: ["Cable", "Machine"] },
        { name: "Leg Curl", sets: 3, targetReps: 12, equipment: ["Machine"] },
        { name: "Face Pull", sets: 3, targetReps: 15, equipment: ["Cable"] },
    ]},
    sunday: { isRest: true, name: "FULL BODY D", focus: "Accessories & Core", exercises: [
        { name: "Bulgarian Split Squat", sets: 3, targetReps: 10, equipment: ["Dumbbell", "Bodyweight"] },
        { name: "Push-up", sets: 3, targetReps: 15, equipment: ["Bodyweight"] },
        { name: "Pull-up", sets: 3, targetReps: 8, equipment: ["Bodyweight", "Machine"] },
        { name: "Hanging Leg Raise", sets: 3, targetReps: 12, equipment: ["Bodyweight"] },
        { name: "Calf Raise", sets: 3, targetReps: 15, equipment: ["Machine", "Dumbbell"] },
    ]}
};

export const calistProgramDefaults: Record<string, any> = {
    monday: { isRest: false, name: "FULL BODY A", focus: "Pull-ups & Push-ups", exercises: [
        { name: "Pull-up", type: "reps", setCount: 4, targetReps: 8, equipment: ["Pull-up Bar"], subs: [{label: "Pull-up", value: "Pull-up"}, {label: "Band Assisted", value: "Band Pull-up"}] },
        { name: "Push-up", type: "reps", setCount: 4, targetReps: 12, equipment: ["Floor"], subs: [{label: "Standard", value: "Push-up"}, {label: "Knee Push-up", value: "Knee Push-up"}] },
        { name: "Pistol Squat Progression", type: "reps", setCount: 3, targetReps: 8, equipment: ["Floor"] },
        { name: "Hollow Body Hold", type: "hold", setCount: 3, targetReps: 30, equipment: ["Floor"] },
    ]},
    tuesday: { isRest: true, name: "FULL BODY B", focus: "Chin-ups & Dips", exercises: [
        { name: "Chin-up", type: "reps", setCount: 3, targetReps: 8, equipment: ["Pull-up Bar"] },
        { name: "Parallel Bar Dips", type: "reps", setCount: 3, targetReps: 10, equipment: ["Dip Bar", "Parallettes"] },
        { name: "Walking Lunges", type: "reps", setCount: 3, targetReps: 12, equipment: ["Floor"] },
        { name: "L-Sit Progression", type: "hold", setCount: 3, targetReps: 15, equipment: ["Parallettes", "Floor"] },
    ]},
    wednesday: { isRest: false, name: "FULL BODY C", focus: "Rows & Pike Push", exercises: [
        { name: "Inverted Row", type: "reps", setCount: 3, targetReps: 10, equipment: ["Rings", "Pull-up Bar"] },
        { name: "Pike Push-up", type: "reps", setCount: 3, targetReps: 8, equipment: ["Floor"] },
        { name: "Nordic Curl Negatives", type: "reps", setCount: 3, targetReps: 5, equipment: ["Floor"] },
        { name: "Plank", type: "hold", setCount: 3, targetReps: 60, equipment: ["Floor"] },
    ]},
    thursday: { isRest: true, name: "FULL BODY A", focus: "Pull-ups & Push-ups", exercises: [
        { name: "Pull-up", type: "reps", setCount: 4, targetReps: 8, equipment: ["Pull-up Bar"], subs: [{label: "Pull-up", value: "Pull-up"}, {label: "Band Assisted", value: "Band Pull-up"}] },
        { name: "Push-up", type: "reps", setCount: 4, targetReps: 12, equipment: ["Floor"], subs: [{label: "Standard", value: "Push-up"}, {label: "Knee Push-up", value: "Knee Push-up"}] },
        { name: "Pistol Squat Progression", type: "reps", setCount: 3, targetReps: 8, equipment: ["Floor"] },
        { name: "Hollow Body Hold", type: "hold", setCount: 3, targetReps: 30, equipment: ["Floor"] },
    ]},
    friday: { isRest: false, name: "FULL BODY B", focus: "Chin-ups & Dips", exercises: [
        { name: "Chin-up", type: "reps", setCount: 3, targetReps: 8, equipment: ["Pull-up Bar"] },
        { name: "Parallel Bar Dips", type: "reps", setCount: 3, targetReps: 10, equipment: ["Dip Bar", "Parallettes"] },
        { name: "Walking Lunges", type: "reps", setCount: 3, targetReps: 12, equipment: ["Floor"] },
        { name: "L-Sit Progression", type: "hold", setCount: 3, targetReps: 15, equipment: ["Parallettes", "Floor"] },
    ]},
    saturday: { isRest: true, name: "FULL BODY C", focus: "Rows & Pike Push", exercises: [
        { name: "Inverted Row", type: "reps", setCount: 3, targetReps: 10, equipment: ["Rings", "Pull-up Bar"] },
        { name: "Pike Push-up", type: "reps", setCount: 3, targetReps: 8, equipment: ["Floor"] },
        { name: "Nordic Curl Negatives", type: "reps", setCount: 3, targetReps: 5, equipment: ["Floor"] },
        { name: "Plank", type: "hold", setCount: 3, targetReps: 60, equipment: ["Floor"] },
    ]},
    sunday: { isRest: true, name: "FULL BODY D", focus: "Skills & Core", exercises: [
        { name: "Handstand Practice", type: "hold", setCount: 3, targetReps: 30, equipment: ["Floor"] },
        { name: "Front Lever Progression", type: "hold", setCount: 3, targetReps: 15, equipment: ["Parallettes", "Pull-up Bar"] },
        { name: "Arch Body Hold", type: "hold", setCount: 3, targetReps: 30, equipment: ["Floor"] },
        { name: "Skin the Cat", type: "reps", setCount: 3, targetReps: 5, equipment: ["Rings", "Pull-up Bar"] },
    ]}
};
