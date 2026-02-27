export const useMode = () => {
    const modeCookie = useCookie('training_mode', { maxAge: 60 * 60 * 24 * 365 });
    const intensityCookie = useCookie('training_intensity', { maxAge: 60 * 60 * 24 * 365 });
    const freqCookie = useCookie('training_frequency', { maxAge: 60 * 60 * 24 * 365 });
    const tourCookie = useCookie('has_seen_tour', { maxAge: 60 * 60 * 24 * 365 });

    const mode = useState<string>('mode', () => modeCookie.value || "");
    const intensity = useState<string>('intensity', () => intensityCookie.value || "");
    const frequency = useState<number>('frequency', () => Number(freqCookie.value) || 0);
    const hasSeenTour = useState<boolean>('hasSeenTour', () => !!tourCookie.value);

    const isGym = computed(() => mode.value === 'gym');
    const isCalist = computed(() => mode.value === 'calist');
    const isCardio = computed(() => mode.value === 'cardio');
    const hasMode = computed(() => mode.value !== "" && intensity.value !== "" && frequency.value > 0);

    const setMode = (newMode: string, newIntensity: string, newFreq: number) => {
        modeCookie.value = newMode;
        intensityCookie.value = newIntensity;
        freqCookie.value = String(newFreq);

        mode.value = newMode;
        intensity.value = newIntensity;
        frequency.value = newFreq;
    };

    const completeTour = () => {
        tourCookie.value = 'true';
        hasSeenTour.value = true;
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
        hasMode,
        hasSeenTour,
        setMode,
        completeTour,
        resetMode
    };
};
