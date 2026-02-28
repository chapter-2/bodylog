export const useMode = () => {
    const modeCookie = useCookie('training_mode', { maxAge: 60 * 60 * 24 * 365 });
    const intensityCookie = useCookie('training_intensity', { maxAge: 60 * 60 * 24 * 365 });
    const freqCookie = useCookie('training_frequency', { maxAge: 60 * 60 * 24 * 365 });
    
    const mode = useState<string>('mode', () => modeCookie.value || "");
    const intensity = useState<string>('intensity', () => intensityCookie.value || "");
    const frequency = useState<number>('frequency', () => Number(freqCookie.value) || 0);

    const isGym = computed(() => mode.value === 'gym');
    const isCalist = computed(() => mode.value === 'calist');
    const isCardio = computed(() => mode.value === 'cardio');
    const isCustom = computed(() => mode.value === 'custom');
    
    // Untuk mode custom, kita bypass cek intensity/frequency di root
    const hasMode = computed(() => mode.value !== "" && (mode.value === 'custom' || (intensity.value !== "" && frequency.value > 0)));

    const setMode = (newMode: string, newIntensity: string = "", newFreq: number = 0) => {
        modeCookie.value = newMode;
        intensityCookie.value = newIntensity;
        freqCookie.value = String(newFreq);

        mode.value = newMode;
        intensity.value = newIntensity;
        frequency.value = newFreq;
    };

    const resetMode = () => {
        setMode("", "", 0);
    };

    return {
        mode,
        intensity,
        frequency,
        isGym,
        isCalist,
        isCardio,
        isCustom,
        hasMode,
        setMode,
        resetMode
    };
};
