export const useMode = () => {
  const modeCookie = useCookie("training_mode", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  const intensityCookie = useCookie("training_intensity", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  const freqCookie = useCookie("training_frequency", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  const tourCookie = useCookie("has_seen_tour", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  const mode = useState<string>("mode", () => String(modeCookie.value || ""));
  const intensity = useState<string>("intensity", () =>
    String(intensityCookie.value || ""),
  );
  const frequency = useState<number>(
    "frequency",
    () => Number(freqCookie.value) || 0,
  );

  const hasSeenTour = useState<boolean>("has_seen_tour", () => {
    return tourCookie.value === true || tourCookie.value === "true";
  });

  const isGym = computed(() => mode.value === "gym");
  const isCalist = computed(() => mode.value === "calist");
  const isCardio = computed(() => mode.value === "cardio");
  const isCustom = computed(() => mode.value === "custom");

  const hasMode = computed(
    () => mode.value === "gym" || mode.value === "calist",
  );

  const setMode = (
    newMode: string,
    newIntensity: string = "",
    newFreq: number = 0,
  ) => {
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

  const completeTour = () => {
    tourCookie.value = true as any;
    hasSeenTour.value = true;
  };

  const resetTour = () => {
    tourCookie.value = false as any;
    hasSeenTour.value = false;
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
    resetMode,
    hasSeenTour,
    completeTour,
    resetTour,
  };
};
