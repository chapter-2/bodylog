export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface Exercise {
  name: string;           
  selectedVariant?: string; 
  sets: WorkoutSet[];
  note?: string;          
}

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
