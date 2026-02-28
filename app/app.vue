<template>
    <div
        class="min-h-screen flex flex-col font-sans text-foreground-primary overflow-x-hidden"
    >
        <header
            class="fixed inset-x-0 top-0 z-50 border-b border-separator bg-background/95 backdrop-blur-sm"
        >
            <nav
                class="inner flex justify-between items-center h-20 px-4 md:px-0"
            >
                <NuxtLink
                    to="/"
                    class="font-black text-2xl tracking-tighter hover:text-primary transition-colors shrink-0"
                >
                    BODYLOG
                </NuxtLink>

                <div class="hidden md:flex items-center gap-8">
                    <NuxtLink
                        to="/"
                        class="flex items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
                    >
                        <span class="font-mono text-primary text-[10px] -mt-3">00</span>
                        Home
                    </NuxtLink>
                    <NuxtLink
                        v-if="isGym"
                        to="/gym"
                        class="flex items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
                    >
                        <span class="font-mono text-primary text-[10px] -mt-3">01</span>
                        Gym Log
                    </NuxtLink>
                    <NuxtLink
                        v-else
                        to="/calist"
                        class="flex items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
                    >
                        <span class="font-mono text-primary text-[10px] -mt-3">01</span>
                        Calist Log
                    </NuxtLink>
                    <NuxtLink
                        to="/weight"
                        class="flex items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
                    >
                        <span class="font-mono text-primary text-[10px] -mt-3">02</span>
                        Weigh In
                    </NuxtLink>
                    <NuxtLink
                        to="/coach"
                        class="flex items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors text-primary"
                    >
                        <span class="font-mono text-primary text-[10px] -mt-3">03</span>
                        AI Coach
                    </NuxtLink>
                </div>

                <div class="flex items-center gap-4">
                    <div class="hidden md:flex items-center gap-3">
                        <button
                            @click="showModeModal = true"
                            class="flex items-center gap-1.5 px-3 py-1.5 border border-separator rounded-full text-xs font-mono font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
                            :title="isCalist ? 'Mode: Calisthenics — klik untuk ganti' : 'Mode: Gym — klik untuk ganti'"
                        >
                            <Dumbbell v-if="isGym" class="w-3 h-3" />
                            <Activity v-else class="w-3 h-3" />
                            {{ isGym ? 'GYM' : 'CALIST' }}
                        </button>

                        <div v-if="isAuthenticated" class="relative">
                            <button
                                @click="isUserMenuOpen = !isUserMenuOpen"
                                class="flex items-center gap-2 hover:bg-black/5 px-2 py-1.5 rounded transition-colors focus:outline-none"
                            >
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span class="text-xs font-mono font-bold uppercase tracking-wider">{{ user?.username || 'ACCOUNT' }}</span>
                                <ChevronDown class="w-4 h-4 text-foreground-text" :class="{'rotate-180': isUserMenuOpen}" />
                            </button>

                            <div v-if="isUserMenuOpen" @click="isUserMenuOpen = false" class="fixed inset-0 z-40"></div>

                            <transition name="fade">
                                <div v-if="isUserMenuOpen" class="absolute right-0 mt-3 w-48 bg-white border-2 border-foreground-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col">
                                    <NuxtLink 
                                        to="/profile" 
                                        @click="isUserMenuOpen = false"
                                        class="px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#fcfbf7] transition-colors text-left flex items-center gap-2 border-b border-separator"
                                    >
                                        <User class="w-4 h-4" />
                                        Profile Settings
                                    </NuxtLink>
                                    <button 
                                        @click="handleLogoutClick" 
                                        class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors text-left flex items-center gap-2"
                                    >
                                        <LogOut class="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </transition>
                        </div>
                        
                        <NuxtLink
                            v-else
                            to="/login"
                            class="px-4 py-2 border border-black rounded font-bold text-xs uppercase hover:bg-black hover:text-white transition-colors"
                        >
                            Login
                        </NuxtLink>
                    </div>

                    <button
                        @click="isMenuOpen = !isMenuOpen"
                        class="md:hidden p-2 hover:bg-black/5 rounded-lg transition-colors focus:outline-none"
                    >
                        <Menu v-if="!isMenuOpen" class="w-8 h-8" />
                        <X v-else class="w-8 h-8" />
                    </button>
                </div>
            </nav>

            <transition name="menu">
                <div
                    v-if="isMenuOpen"
                    class="md:hidden absolute top-20 left-0 w-full bg-background border-b border-separator h-[calc(100vh-5rem)] overflow-y-auto z-40"
                >
                    <div class="inner py-8 flex flex-col gap-6 px-4">
                        <NuxtLink to="/" @click="isMenuOpen = false" class="text-4xl font-black uppercase hover:text-primary transition-colors block">
                            <span class="text-primary text-sm font-mono mb-1 block">00</span>HOME
                        </NuxtLink>
                        <NuxtLink v-if="isGym" to="/gym" @click="isMenuOpen = false" class="text-4xl font-black uppercase hover:text-primary transition-colors block">
                            <span class="text-primary text-sm font-mono mb-1 block">01</span>GYM LOG
                        </NuxtLink>
                        <NuxtLink v-else to="/calist" @click="isMenuOpen = false" class="text-4xl font-black uppercase hover:text-primary transition-colors block">
                            <span class="text-primary text-sm font-mono mb-1 block">01</span>CALIST LOG
                        </NuxtLink>
                        <NuxtLink to="/weight" @click="isMenuOpen = false" class="text-4xl font-black uppercase hover:text-primary transition-colors block">
                            <span class="text-primary text-sm font-mono mb-1 block">02</span>WEIGH IN
                        </NuxtLink>
                        <NuxtLink to="/coach" @click="isMenuOpen = false" class="text-4xl font-black uppercase hover:text-primary transition-colors block text-primary">
                            <span class="text-primary text-sm font-mono mb-1 block">03</span>AI COACH
                        </NuxtLink>
                        <NuxtLink v-if="isAuthenticated" to="/profile" @click="isMenuOpen = false" class="text-4xl font-black uppercase hover:text-primary transition-colors block">
                            <span class="text-primary text-sm font-mono mb-1 block">04</span>PROFILE
                        </NuxtLink>

                        <div class="h-px bg-separator my-2"></div>

                        <button @click="isMenuOpen = false; showModeModal = true" class="text-left">
                            <span class="text-separator text-sm font-mono mb-1 block uppercase tracking-widest">Current Mode</span>
                            <span class="text-4xl font-black uppercase hover:text-primary transition-colors flex items-center gap-3">
                                <Dumbbell v-if="isGym" class="w-8 h-8" />
                                <Activity v-else class="w-8 h-8" />
                                {{ isGym ? 'GYM' : 'CALIST' }}
                            </span>
                            <span class="text-xs font-mono text-primary mt-1 block">Tap to switch →</span>
                        </button>

                        <div class="h-px bg-separator my-2"></div>

                        <div v-if="isAuthenticated">
                            <button @click="handleLogoutClick" class="text-4xl font-black uppercase text-red-500 hover:text-red-600 transition-colors w-full text-left">
                                LOGOUT
                            </button>
                        </div>
                        <NuxtLink v-else to="/login" @click="isMenuOpen = false" class="text-4xl font-black uppercase hover:text-primary transition-colors block">
                            LOGIN
                        </NuxtLink>
                    </div>
                </div>
            </transition>
        </header>

        <main class="flex-1 pt-20 w-full max-w-[100vw] overflow-x-hidden">
            <NuxtPage />
        </main>

        <footer
            class="py-12 text-center text-foreground-text border-t border-separator bg-background"
        >
            <div class="inner flex flex-col items-center gap-4">
                <p class="font-handwriting text-2xl">
                    Consistency beats intensity.
                </p>
                <p class="text-xs font-mono opacity-60 uppercase tracking-widest">
                    © 2026 BodyLog
                </p>
            </div>
        </footer>

        <transition name="fade">
            <div
                v-if="showModeModal"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            >
                <div class="w-full max-w-lg bg-white border-2 border-foreground-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative animate-bounce-in">
                    <div class="p-8 border-b border-separator">
                        <span class="font-handwriting text-primary text-xl block mb-1">Selamat datang!</span>
                        <h3 class="text-4xl font-black uppercase text-foreground-primary">
                            Pilih Mode Latihan
                        </h3>
                        <p class="font-mono text-xs text-foreground-text mt-2 opacity-70">
                            Bisa diganti kapan saja lewat tombol di navbar.
                        </p>
                    </div>

                    <div class="grid grid-cols-2 divide-x divide-separator">
                        <button
                            @click="selectMode('gym')"
                            class="p-8 text-left hover:bg-[#fcfbf7] transition-colors group flex flex-col gap-4"
                        >
                            <Dumbbell class="w-10 h-10 text-primary group-hover:-rotate-12 transition-transform" :stroke-width="1.5" />
                            <div>
                                <h4 class="text-2xl font-black uppercase text-foreground-primary group-hover:text-primary transition-colors">
                                    GYM
                                </h4>
                                <p class="font-mono text-xs text-foreground-text mt-2 leading-relaxed opacity-80">
                                    Barbell, mesin, & dumbbell. Program 12 minggu dengan progressive overload.
                                </p>
                            </div>
                            <span class="font-mono text-xs text-primary font-bold uppercase tracking-widest mt-auto">
                                Pilih →
                            </span>
                        </button>

                        <button
                            @click="selectMode('calist')"
                            class="p-8 text-left hover:bg-[#fcfbf7] transition-colors group flex flex-col gap-4"
                        >
                            <Activity class="w-10 h-10 text-primary group-hover:scale-110 transition-transform" :stroke-width="1.5" />
                            <div>
                                <h4 class="text-2xl font-black uppercase text-foreground-primary group-hover:text-primary transition-colors">
                                    CALIST
                                </h4>
                                <p class="font-mono text-xs text-foreground-text mt-2 leading-relaxed opacity-80">
                                    Pull-up bar, parallettes, & band. Program rumahan menuju planche.
                                </p>
                            </div>
                            <span class="font-mono text-xs text-primary font-bold uppercase tracking-widest mt-auto">
                                Pilih →
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div
                v-if="showLogoutModal"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
                <div
                    class="w-full max-w-sm bg-white border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative animate-bounce-in"
                >
                    <div
                        class="mx-auto w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center mb-6"
                    >
                        <LogOut class="w-8 h-8 text-red-500" />
                    </div>
                    <h3 class="text-3xl font-black uppercase mb-2">
                        Logging Out?
                    </h3>
                    <p
                        class="font-mono text-sm mb-8 text-foreground-text leading-relaxed"
                    >
                        Your session will be ended. Make sure you've saved your
                        gains.
                    </p>
                    <div class="flex flex-col gap-3">
                        <button
                            @click="confirmLogout"
                            class="w-full py-4 bg-foreground-primary text-white border-2 border-foreground-primary font-bold text-lg uppercase hover:bg-red-600 hover:border-red-600 transition-all active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                        >
                            Yes, I'm Done
                        </button>
                        <button
                            @click="showLogoutModal = false"
                            class="w-full py-4 bg-transparent border-2 border-separator text-foreground-text font-bold text-lg uppercase hover:border-foreground-primary hover:text-foreground-primary transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { Menu, X, LogOut, Dumbbell, Activity, ChevronDown, User } from "lucide-vue-next";
const { isAuthenticated, logout, checkAuth, user } = useAuth();
const { isGym, isCalist, hasMode, setMode, mode, intensity, frequency } = useMode();

const isMenuOpen = ref(false);
const showLogoutModal = ref(false);
const showModeModal = ref(false);
const isUserMenuOpen = ref(false);

function handleLogoutClick() {
    isUserMenuOpen.value = false;
    isMenuOpen.value = false;
    showLogoutModal.value = true;
}

function confirmLogout() {
    logout();
    showLogoutModal.value = false;
    navigateTo("/");
}

function selectMode(newMode: 'gym' | 'calist') {
    setMode(newMode, intensity.value || 'intermediate', frequency.value || 5);
    showModeModal.value = false;
    if (newMode === 'gym') {
        navigateTo('/gym');
    } else {
        navigateTo('/calist');
    }
}

onMounted(() => {
    checkAuth();
    if (!hasMode.value) {
        showModeModal.value = true;
    }
});
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
    transition: all 0.3s ease-in-out;
}
.menu-enter-from,
.menu-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
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
    animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
