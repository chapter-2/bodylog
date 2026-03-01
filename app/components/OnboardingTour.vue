<template>
    <transition name="fade">
        <div
            v-if="localIsActive"
            class="fixed inset-0 z-[200] pointer-events-none overflow-hidden"
        >
            <div
                class="fixed inset-0 z-[180] pointer-events-auto"
                @click="step === 7 ? finishTour() : nextStep()"
            ></div>

            <div
                v-if="targetRect"
                class="fixed z-[190] pointer-events-none transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]"
                :style="{
                    top:
                        step === 5 && windowWidth < 768
                            ? targetRect.top + 'px'
                            : targetRect.top - 8 + 'px',
                    left:
                        step === 5
                            ? targetRect.left + 'px'
                            : targetRect.left - 8 + 'px',
                    width:
                        step === 5
                            ? targetRect.width + 'px'
                            : targetRect.width + 16 + 'px',
                    height:
                        step === 5
                            ? targetRect.height + 'px'
                            : targetRect.height + 16 + 'px',
                    borderRadius:
                        step === 5
                            ? windowWidth < 768
                                ? '16px 16px 0 0'
                                : '0'
                            : '8px',
                }"
            ></div>

            <div
                v-if="(step <= 4 || step >= 6) && targetRect"
                class="fixed z-[200] flex flex-col animate-bounce-in w-[calc(100%-32px)] max-w-[320px] pointer-events-none"
                :style="getTourTooltipStyle(step, targetRect, windowWidth)"
            >
                <svg
                    v-if="step <= 4"
                    class="w-12 h-12 mb-2 text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                    :style="getTourArrowStyle(step, targetRect, windowWidth)"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                </svg>

                <div
                    class="bg-white border-2 border-foreground-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] pointer-events-auto text-left w-full relative z-10"
                >
                    <button
                        @click.stop="finishTour"
                        class="absolute top-4 right-4 text-foreground-text/40 hover:text-red-500 transition-colors"
                        title="Skip Tour"
                    >
                        <X class="w-5 h-5" />
                    </button>
                    <div class="font-mono text-xs text-primary font-bold mb-1">
                        Step {{ step }}/7
                    </div>
                    <h3 class="font-black uppercase text-xl mb-2 pr-6">
                        {{ currentContent.title }}
                    </h3>
                    <p
                        class="font-mono text-xs text-foreground-text mb-6 leading-relaxed"
                        v-html="currentContent.desc"
                    ></p>
                    <button
                        @click.stop="nextStep"
                        class="w-full py-3 bg-foreground-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                    >
                        {{
                            step === 7
                                ? "Selesai & Eksekusi"
                                : step === 4
                                  ? "Buka Editor →"
                                  : "Next →"
                        }}
                    </button>
                </div>
            </div>

            <div
                v-if="step === 5 && targetRect"
                class="fixed z-[200] flex flex-col md:flex-row items-center animate-bounce-in w-[calc(100%-32px)] max-w-[320px]"
                :style="getTourStep5Style(targetRect, windowWidth)"
            >
                <div
                    class="bg-white border-2 border-foreground-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full pointer-events-auto text-left relative z-10"
                >
                    <button
                        @click.stop="finishTour"
                        class="absolute top-4 right-4 text-foreground-text/40 hover:text-red-500 transition-colors"
                        title="Skip Tour"
                    >
                        <X class="w-5 h-5" />
                    </button>
                    <div class="font-mono text-xs text-primary font-bold mb-1">
                        Step 5/7
                    </div>
                    <h3 class="font-black uppercase text-xl mb-2 pr-6">
                        {{ currentContent.title }}
                    </h3>
                    <p
                        class="font-mono text-xs text-foreground-text mb-6 leading-relaxed"
                        v-html="currentContent.desc"
                    ></p>
                    <button
                        @click.stop="nextStep"
                        class="w-full py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-foreground-primary transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:scale-[0.98]"
                    >
                        Lanjut ke Settings →
                    </button>
                </div>

                <svg
                    class="block md:hidden w-12 h-12 mt-2 text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                </svg>
                <svg
                    class="hidden md:block w-16 h-16 ml-4 text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] rotate-90"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                </svg>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { X } from "lucide-vue-next";

const route = useRoute();
const { isAuthenticated } = useAuth();
const { hasSeenTour, completeTour, hasMode, mode } = useMode();
const isMenuOpen = useState("isMenuOpen", () => false);

const step = ref(1);
const localIsActive = ref(false);
const targetRect = ref<any>(null);
const windowWidth = ref(1024);
let positionInterval: ReturnType<typeof setInterval> | null = null;

const currentContent = computed(
    () => TOUR_CONTENTS[step.value - 1] || TOUR_CONTENTS[0],
);
const targetId = computed(() =>
    getTourTargetId(step.value, windowWidth.value < 768),
);

const updatePosition = () => {
    if (typeof window === "undefined") return;
    windowWidth.value = window.innerWidth;
    if (!targetId.value) return;
    const el = document.getElementById(targetId.value);
    if (el) targetRect.value = el.getBoundingClientRect();
};

const evaluateTour = () => {
    if (!hasMode.value || route.path === "/login" || !isAuthenticated.value)
        return;
    if (!localIsActive.value && !hasSeenTour.value) {
        setTimeout(() => {
            localIsActive.value = true;
            step.value = 1;
            const tourCookie = useCookie("has_seen_tour", {
                path: "/",
                maxAge: 60 * 60 * 24 * 365,
            });
            tourCookie.value = "true" as any;
        }, 800);
    } else if (hasSeenTour.value && route.query.tour) {
        const query = { ...route.query };
        delete query.tour;
        navigateTo({ query }, { replace: true });
    }
};

onMounted(() => evaluateTour());
watch([hasMode, isAuthenticated, () => route.path], () => evaluateTour());

watch(
    [step, localIsActive],
    async ([newStep, isActive]) => {
        if (typeof window === "undefined") return;
        if (isActive) {
            const isMob = window.innerWidth < 768;
            isMenuOpen.value = newStep <= 3 && isMob;

            setTimeout(() => {
                if (targetId.value) {
                    const el = document.getElementById(targetId.value);
                    if (el)
                        el.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                } else if (newStep <= 3 && !isMob) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }, 300);

            if (positionInterval) clearInterval(positionInterval);
            let attempts = 0;
            positionInterval = setInterval(() => {
                updatePosition();
                attempts++;
                if (attempts > 60 && positionInterval && step.value < 4)
                    clearInterval(positionInterval);
            }, 50);

            window.addEventListener("resize", updatePosition);
            window.addEventListener("scroll", updatePosition, true);
        } else {
            if (positionInterval) clearInterval(positionInterval);
            if (typeof window !== "undefined") {
                window.removeEventListener("resize", updatePosition);
                window.removeEventListener("scroll", updatePosition, true);
            }
        }
    },
    { immediate: true },
);

onUnmounted(() => {
    if (positionInterval) clearInterval(positionInterval);
    if (typeof window !== "undefined") {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
    }
});

async function nextStep() {
    if (step.value === 3) {
        step.value = 4;
        await navigateTo(
            `${mode.value === "gym" ? "/gym" : "/calist"}?tour=step4`,
        );
    } else if (step.value === 4) {
        step.value = 5;
        await navigateTo(
            `${mode.value === "gym" ? "/gym" : "/calist"}?tour=step5`,
        );
    } else if (step.value === 5) {
        step.value = 6;
        await navigateTo("/profile?tour=step6");
    } else if (step.value < 7) {
        step.value++;
    } else {
        finishTour();
    }
}

function finishTour() {
    localIsActive.value = false;
    completeTour();
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
@keyframes bounceIn {
    0% {
        transform: scale(0.9);
        opacity: 0;
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
.animate-bounce-in {
    animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
