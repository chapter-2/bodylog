/** @deprecated Use WorkoutSetGym / WorkoutExercise instead */
export interface WorkoutSet {
  weight: number;
  reps: number;
}

/** @deprecated Use WorkoutExercise instead */
export interface Exercise {
  name: string;
  selectedVariant?: string;
  sets: WorkoutSet[];
  note?: string;
}

/** @deprecated Use WorkoutSession instead */
export interface WorkoutDay {
  week: number;
  day: string;
  date: string;
  time?: string;
  exercises: Exercise[];
  completed: boolean;
  sessionNote?: string;
}

export interface BulkEntry {
  week: number;
  date: string;
  weight: number;
  notes?: string;
}

/** @deprecated Use WorkoutSession instead */
export interface GymSession {
  week: number;
  day: string;
  date: string;
  time?: string;
  exercises: Exercise[];
  completed: boolean;
  sessionNote?: string;
}

export interface GymProgram {
  monday: Exercise[];
  tuesday: Exercise[];
  wednesday: Exercise[];
  friday: Exercise[];
  saturday: Exercise[];
}

// ─── Calisthenics types ───
/** @deprecated Use WorkoutExercise instead */
export interface CalistExercisePayload {
  name: string;
  sets: string[];
  note: string;
}

/** @deprecated Use WorkoutSession instead */
export interface CalistSession {
  week: number;
  day: string;
  date: string;
  time?: string;
  exercises: CalistExercisePayload[];
  completed: boolean;
  sessionNote?: string;
}

// ─── Unified types (replace old types above) ───

export type ExerciseType = 'gym' | 'calist' | 'cardio';

export interface WorkoutSetGym { weight: number; reps: number; }
export interface WorkoutSetCalist { value: number; unit: 'reps' | 's'; }

export interface WorkoutExercise {
  name: string;
  type: ExerciseType;
  variants?: string[];
  selectedVariant?: string;
  subs?: { label: string; value: string }[];
  selectedSub?: string;
  sets: WorkoutSetGym[] | WorkoutSetCalist[];
  targetReps?: number;
  holdType?: 'reps' | 'hold';
  note?: string;
  showNote?: boolean;
}

export interface WorkoutSession {
  week: number;
  day: string;
  date: string;
  time?: string;
  exercises: WorkoutExercise[];
  completed: boolean;
  sessionNote?: string;
}
