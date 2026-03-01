<template>
    <transition name="fade">
        <div v-if="localIsActive" class="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
            
            <div class="fixed inset-0 z-[180] pointer-events-auto" @click="step === 7 ? finishTour() : nextStep()"></div>
            
            <div v-if="targetRect"
                 class="fixed z-[190] pointer-events-none transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]"
                 :style="{
                     top: step === 5 && windowWidth < 768 ? targetRect.top + 'px' : (targetRect.top - 8) + 'px',
                     left: step === 5 ? targetRect.left + 'px' : (targetRect.left - 8) + 'px',
                     width: step === 5 ? targetRect.width + 'px' : (targetRect.width + 16) + 'px',
                     height: step === 5 ? targetRect.height + 'px' : (targetRect.height + 16) + 'px',
                     borderRadius: step === 5 ? (windowWidth < 768 ? '16px 16px 0 0' : '0') : '8px'
                 }"
            ></div>

            <div v-if="(step <= 4 || step >= 6) && targetRect" 
                 class="fixed z-[200] flex flex-col animate-bounce-in w-[calc(100%-32px)] max-w-[320px] pointer-events-none"
                 :style="getUnifiedTooltipStyle()">
                 
                 <svg v-if="step <= 4" class="w-12 h-12 mb-2 text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                      :style="getArrowStyle()"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                     <path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>
                 </svg>
                 
                 <div class="bg-white border-2 border-foreground-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] pointer-events-auto text-left w-full relative z-10">
                     
                     <button @click.stop="finishTour" class="absolute top-4 right-4 text-foreground-text/40 hover:text-red-500 transition-colors" title="Skip Tour">
                         <X class="w-5 h-5" />
                     </button>

                     <div class="font-mono text-xs text-primary font-bold mb-1">Step {{ step }}/7</div>
                     <h3 class="font-black uppercase text-xl mb-2 pr-6">{{ currentContent.title }}</h3>
                     <p class="font-mono text-xs text-foreground-text mb-6 leading-relaxed" v-html="currentContent.desc"></p>
                     <button @click.stop="nextStep" class="w-full py-3 bg-foreground-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                         {{ step === 7 ? 'Selesai & Eksekusi' : (step === 4 ? 'Buka Editor →' : 'Next →') }}
                     </button>
                 </div>
            </div>

            <div v-if="step === 5 && targetRect" 
                 class="fixed z-[200] flex flex-col md:flex-row items-center animate-bounce-in w-[calc(100%-32px)] max-w-[320px]"
                 :style="getStep5Style()">
                 
                 <div class="bg-white border-2 border-foreground-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full pointer-events-auto text-left relative z-10">
                     
                     <button @click.stop="finishTour" class="absolute top-4 right-4 text-foreground-text/40 hover:text-red-500 transition-colors" title="Skip Tour">
                         <X class="w-5 h-5" />
                     </button>

                     <div class="font-mono text-xs text-primary font-bold mb-1">Step 5/7</div>
                     <h3 class="font-black uppercase text-xl mb-2 pr-6">Drag & Drop</h3>
                     <p class="font-mono text-xs text-foreground-text mb-6 leading-relaxed">
                         Ini Sidebar Editor. <span class="inline md:hidden">Di HP muncul dari bawah.</span><span class="hidden md:inline">Di PC muncul dari kanan.</span><br><br>
                         Ganti urutan, set target repetisi, dan catat alat alternatif (substitusi) di sini. Semua perubahan akan langsung tersimpan.
                     </p>
                     <button @click.stop="nextStep" class="w-full py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-foreground-primary transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:scale-[0.98]">
                         Lanjut ke Settings →
                     </button>
                 </div>

                 <svg class="block md:hidden w-12 h-12 mt-2 text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
                 <svg class="hidden md:block w-16 h-16 ml-4 text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
            </div>

        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

const route = useRoute();
const { isAuthenticated } = useAuth();
const { hasSeenTour, completeTour, hasMode, mode } = useMode();
const isMenuOpen = useState('isMenuOpen', () => false);
const step = ref(1);

const localIsActive = ref(false);

// ─── PERBAIKAN FATAL: Engine yang tidak memicu reactivity loop! ───
const evaluateTour = () => {
    if (!hasMode.value || route.path === '/login' || !isAuthenticated.value) return;

    if (!localIsActive.value && !hasSeenTour.value) {
        // Gunakan jeda waktu untuk membiarkan komponen Navbar selesai dimuat di DOM
        setTimeout(() => {
            localIsActive.value = true;
            step.value = 1;
            
            // RAHASIA: Set cookie SECARA MANUAL tanpa menyentuh hasSeenTour.value
            // Ini mencegah Vue membunuh layar Onboarding secara tiba-tiba!
            const tourCookie = useCookie('has_seen_tour', { path: '/', maxAge: 60 * 60 * 24 * 365 });
            tourCookie.value = 'true' as any;
        }, 800); 

    } else if (hasSeenTour.value && route.query.tour) {
        // Membersihkan URL jika user me-refresh di tengah rute dengan query "tour"
        const query = { ...route.query };
        delete query.tour;
        navigateTo({ query }, { replace: true });
    }
};

onMounted(() => {
    evaluateTour();
});

watch([hasMode, isAuthenticated, () => route.path], () => {
    evaluateTour();
});
// ─────────────────────────────────────────────────────────────────

const contents = [
    { title: '01. Eksekusi Harian', desc: 'Ini medan tempurmu. Buka tiap hari latihan untuk mencatat progres beban dan repetisi.' },
    { title: '02. Weigh-In', desc: 'Set targetmu (Bulk/Cut/Maintain) dan pantau deviasi berat badan mingguanmu secara presisi di sini.' },
    { title: '03. AI Coach', desc: 'Ekspor datamu ke CSV. Biarkan AI menganalisis letak plateau atau kesalahan rasio volume latihanmu.' },
    { title: 'Program Editor', desc: 'Perhatikan tombol yang disorot ini. Klik untuk mengkustomisasi program (<i>drag-and-drop</i> urutan, ubah alat, set reps).' },
    { title: 'Drag & Drop', desc: 'Placeholder' }, 
    { title: '04. Program Dates', desc: '<span class="text-primary font-bold">PENTING:</span> Atur tanggal mulai programmu di sini. Sistem akan menghitung Week 1, Week 2, dst secara otomatis berdasarkan tanggal ini.' },
    { title: '05. Weekly Schedule', desc: '<span class="text-primary font-bold">PENTING:</span> Atur hari apa saja kamu latihan (ON) dan libur (OFF). Data tidak akan hilang meskipun harinya dimatikan.' }
];
const currentContent = computed(() => contents[step.value - 1] || contents[0]);

const targetRect = ref<{ top: number; left: number; right: number; bottom: number; width: number; height: number } | null>(null);
const windowWidth = ref(1024);
let positionInterval: ReturnType<typeof setInterval> | null = null;

const targetId = computed(() => {
    const isMob = windowWidth.value < 768;
    if (step.value === 1) return isMob ? 'mob-log' : 'nav-log';
    if (step.value === 2) return isMob ? 'mob-weight' : 'nav-weight';
    if (step.value === 3) return isMob ? 'mob-coach' : 'nav-coach';
    if (step.value === 4) return 'tour-edit-btn';
    if (step.value === 5) return 'program-editor-sidebar';
    if (step.value === 6) return 'tour-start-dates';
    if (step.value === 7) return 'tour-weekly-schedule';
    return null;
});

const updatePosition = () => {
    if (typeof window === 'undefined') return;
    windowWidth.value = window.innerWidth;
    if (!targetId.value) return;
    
    const el = document.getElementById(targetId.value);
    if (el) {
        targetRect.value = el.getBoundingClientRect();
    }
};

function getUnifiedTooltipStyle() {
    if (!targetRect.value) return {};
    const isMob = windowWidth.value < 768;
    
    if (step.value >= 6) {
        let top = targetRect.value.top + 40; 
        if (top < 80) top = 80; 
        
        let left = '16px';
        if (!isMob) {
            left = (targetRect.value.left + Math.max(16, targetRect.value.width / 2 - 160)) + 'px';
        }
        return { top: top + 'px', left, right: 'auto' };
    }

    let top = targetRect.value.bottom + (step.value === 4 ? 16 : 8);
    if (isMob) {
        return { top: top + 'px', left: '16px' }; 
    } else {
        let left = targetRect.value.left + (targetRect.value.width / 2) - 160;
        if (left < 16) left = 16;
        if (left + 320 > windowWidth.value - 16) left = windowWidth.value - 336;
        
        if (step.value === 4) {
            let right = Math.max(16, windowWidth.value - targetRect.value.right - 10);
            return { top: top + 'px', right: right + 'px' };
        }
        return { top: top + 'px', left: left + 'px' };
    }
}

function getArrowStyle() {
    if (!targetRect.value) return {};
    const isMob = windowWidth.value < 768;
    const targetCenter = targetRect.value.left + (targetRect.value.width / 2);
    
    if (isMob) {
        let translateX = targetCenter - 40; 
        if (translateX < 10) translateX = 10;
        if (translateX > 270) translateX = 270;
        return { transform: `translateX(${translateX}px)` };
    } else {
        if (step.value === 4) {
            return { alignSelf: 'flex-end', marginRight: '24px' };
        } else {
            let tooltipLeft = targetRect.value.left + (targetRect.value.width / 2) - 160;
            if (tooltipLeft < 16) tooltipLeft = 16;
            if (tooltipLeft + 320 > windowWidth.value - 16) tooltipLeft = windowWidth.value - 336;
            
            let translateX = targetCenter - tooltipLeft - 24; 
            if (translateX < 10) translateX = 10;
            if (translateX > 270) translateX = 270;
            return { transform: `translateX(${translateX}px)` };
        }
    }
}

function getStep5Style() {
    if (!targetRect.value) return {};
    const isMob = windowWidth.value < 768;
    if (isMob) {
        let top = targetRect.value.top - 270; 
        if (top < 16) top = 16;
        return { top: top + 'px', left: '16px' };
    } else {
        let right = windowWidth.value - targetRect.value.left + 16;
        return { top: '30vh', right: right + 'px' };
    }
}

watch([step, localIsActive], async ([newStep, isActive]) => {
    if (typeof window === 'undefined') return;
    
    // HANYA kontrol menu dan scroll JIKA TOUR SEDANG AKTIF
    if (isActive) {
        const isMob = window.innerWidth < 768;

        if (newStep <= 3 && isMob) {
            isMenuOpen.value = true;
        } else {
            isMenuOpen.value = false;
        }

        setTimeout(() => {
            if (targetId.value) {
                const el = document.getElementById(targetId.value);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (newStep <= 3 && !isMob) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 300);

        if (positionInterval) clearInterval(positionInterval);
        let attempts = 0;
        positionInterval = setInterval(() => {
            updatePosition();
            attempts++;
            if (attempts > 60 && positionInterval && step.value < 4) {
                clearInterval(positionInterval);
            }
        }, 50);
        
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true); 
    } else {
        // Bersihkan listener jika tour tidak aktif
        if (positionInterval) clearInterval(positionInterval);
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        }
    }
}, { immediate: true });

onUnmounted(() => {
    if (positionInterval) clearInterval(positionInterval);
    if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
    }
});

async function nextStep() {
    if (step.value === 3) {
        step.value = 4;
        const targetPath = mode.value === 'gym' ? '/gym' : '/calist';
        await navigateTo(`${targetPath}?tour=step4`);
    } else if (step.value === 4) {
        step.value = 5;
        const targetPath = mode.value === 'gym' ? '/gym' : '/calist';
        await navigateTo(`${targetPath}?tour=step5`);
    } else if (step.value === 5) {
        step.value = 6;
        await navigateTo('/profile?tour=step6');
    } else if (step.value < 7) {
        step.value++;
    } else {
        finishTour();
    }
}

function finishTour() {
    localIsActive.value = false;
    completeTour(); // Sinkronisasi state global sekarang aman dilakukan
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes bounceIn {
    0% { transform: scale(0.9); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in { animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>
