export const useMode = () => {
    const modeCookie = useCookie('app_mode', {
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
    });

    const mode = useState<string>('appMode', () => modeCookie.value || '');

    const setMode = (newMode: 'gym' | 'calist') => {
        modeCookie.value = newMode;
        mode.value = newMode;
    };

    const isGym = computed(() => mode.value === 'gym');
    const isCalist = computed(() => mode.value === 'calist');
    const hasMode = computed(() => !!mode.value);

    return { mode, setMode, isGym, isCalist, hasMode };
};
