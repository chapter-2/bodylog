import { ref, computed } from "vue";

const timerSeconds = ref(0);
const timerActive = ref(false);
const isRinging = ref(false);
const showOnWorkoutPage = ref(false);
const timerPosition = ref<"top" | "bottom">("bottom");

let timerInterval: ReturnType<typeof setInterval> | null = null;
let ringInterval: ReturnType<typeof setInterval> | null = null;
let audioCtx: any = null;
let targetEndTime: number | null = null;

export function useTimer() {
  const formattedTime = computed(() => {
    const m = Math.floor(timerSeconds.value / 60)
      .toString()
      .padStart(2, "0");
    const s = (timerSeconds.value % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  });

  function requestNotificationPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }

  function showNotification() {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("Waktu Istirahat Selesai!", {
        body: "Kembali bekerja. Jangan terlalu lama istirahat.",
        icon: "/favicon.svg",
        requireInteraction: true,
      });
    }
  }

  function initAudio() {
    if (!audioCtx && typeof window !== "undefined") {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playAlarmBeep() {
    if (!audioCtx) return;
    try {
      const playNote = (freq: number, startDelay: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const startTime = audioCtx.currentTime + startDelay;
        gain.gain.setValueAtTime(0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      playNote(880, 0, 0.15);
      playNote(1046.5, 0.2, 0.15);
    } catch (e) {}
  }

  function triggerAlarm() {
    isRinging.value = true;
    playAlarmBeep();
    showNotification();
    if (typeof navigator !== "undefined" && "vibrate" in navigator)
      navigator.vibrate([200, 100, 200]);

    ringInterval = setInterval(() => {
      playAlarmBeep();
      if (typeof navigator !== "undefined" && "vibrate" in navigator)
        navigator.vibrate([200, 100, 200]);
    }, 1000);
  }

  function stopAlarm() {
    isRinging.value = false;
    timerSeconds.value = 0;
    targetEndTime = null;
    if (ringInterval) {
      clearInterval(ringInterval);
      ringInterval = null;
    }
  }

  function addTime(secs: number) {
    if (timerActive.value && targetEndTime) {
      targetEndTime += secs * 1000;
      timerSeconds.value = Math.max(
        0,
        Math.ceil((targetEndTime - Date.now()) / 1000),
      );
    } else {
      timerSeconds.value += secs;
    }
  }

  function toggleTimer() {
    initAudio();
    requestNotificationPermission();

    if (timerActive.value) {
      if (timerInterval) clearInterval(timerInterval);
      timerActive.value = false;
      targetEndTime = null;
    } else {
      if (timerSeconds.value === 0) timerSeconds.value = 90;
      timerActive.value = true;

      targetEndTime = Date.now() + timerSeconds.value * 1000;

      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        if (!targetEndTime) return;
        const remaining = Math.ceil((targetEndTime - Date.now()) / 1000);

        if (remaining > 0) {
          timerSeconds.value = remaining;
        } else {
          timerSeconds.value = 0;
          if (timerInterval) clearInterval(timerInterval);
          timerActive.value = false;
          targetEndTime = null;
          triggerAlarm();
        }
      }, 250);
    }
  }

  function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerActive.value = false;
    timerSeconds.value = 0;
    targetEndTime = null;
    stopAlarm();
  }

  function togglePosition() {
    timerPosition.value = timerPosition.value === "top" ? "bottom" : "top";
  }

  return {
    timerSeconds,
    timerActive,
    isRinging,
    showOnWorkoutPage,
    formattedTime,
    timerPosition,
    addTime,
    toggleTimer,
    resetTimer,
    stopAlarm,
    togglePosition,
  };
}
