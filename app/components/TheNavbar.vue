<template>
    <header
        class="fixed inset-x-0 top-0 z-50 border-b border-separator bg-background/95 backdrop-blur-sm"
    >
        <nav class="inner flex justify-between items-center h-20 px-4 md:px-0">
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
                    <span class="font-mono text-primary text-[10px] -mt-3"
                        >00</span
                    >Home
                </NuxtLink>
                <NuxtLink
                    to="/workout"
                    id="nav-log"
                    class="flex items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
                >
                    <span class="font-mono text-primary text-[10px] -mt-3"
                        >01</span
                    >{{ isGym ? "Gym Log" : "Calist Log" }}
                </NuxtLink>
                <NuxtLink
                    to="/weight"
                    id="nav-weight"
                    class="flex items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
                >
                    <span class="font-mono text-primary text-[10px] -mt-3"
                        >02</span
                    >Weigh In
                </NuxtLink>
                <NuxtLink
                    to="/coach"
                    id="nav-coach"
                    class="flex items-center gap-1 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors text-primary"
                >
                    <span class="font-mono text-primary text-[10px] -mt-3"
                        >03</span
                    >AI Coach
                </NuxtLink>
            </div>

            <div class="flex items-center gap-4">
                <div class="hidden md:flex items-center gap-3">
                    <button
                        @click="triggerModeModal"
                        class="flex items-center gap-1.5 px-3 py-1.5 border border-separator rounded-full text-xs font-mono font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
                    >
                        <Dumbbell v-if="isGym" class="w-3 h-3" />
                        <Activity v-else class="w-3 h-3" />
                        {{ isGym ? "GYM" : "CALIST" }}
                    </button>

                    <div v-if="isAuthenticated" class="relative">
                        <button
                            @click="isUserMenuOpen = !isUserMenuOpen"
                            class="flex items-center gap-2 hover:bg-black/5 px-2 py-1.5 rounded transition-colors focus:outline-none"
                        >
                            <span
                                class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                            ></span>
                            <span
                                class="text-xs font-mono font-bold uppercase tracking-wider"
                                >{{ user?.username || "ACCOUNT" }}</span
                            >
                            <ChevronDown
                                class="w-4 h-4 text-foreground-text"
                                :class="{ 'rotate-180': isUserMenuOpen }"
                            />
                        </button>
                        <div
                            v-if="isUserMenuOpen"
                            @click="isUserMenuOpen = false"
                            class="fixed inset-0 z-40"
                        ></div>
                        <transition name="fade">
                            <div
                                v-if="isUserMenuOpen"
                                class="absolute right-0 mt-3 w-48 bg-white border-2 border-foreground-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col"
                            >
                                <NuxtLink
                                    to="/profile"
                                    @click="isUserMenuOpen = false"
                                    class="px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#fcfbf7] transition-colors text-left flex items-center gap-2 border-b border-separator"
                                >
                                    <User class="w-4 h-4" />Profile Settings
                                </NuxtLink>
                                <button
                                    @click="triggerLogout"
                                    class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors text-left flex items-center gap-2"
                                >
                                    <LogOut class="w-4 h-4" />Logout
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
                    <NuxtLink
                        to="/"
                        @click="isMenuOpen = false"
                        class="text-4xl font-black uppercase hover:text-primary transition-colors block"
                    >
                        <span class="text-primary text-sm font-mono mb-1 block"
                            >00</span
                        >HOME
                    </NuxtLink>
                    <NuxtLink
                        to="/workout"
                        id="mob-log"
                        @click="isMenuOpen = false"
                        class="text-4xl font-black uppercase hover:text-primary transition-colors block"
                    >
                        <span class="text-primary text-sm font-mono mb-1 block"
                            >01</span
                        >{{ isGym ? "GYM LOG" : "CALIST LOG" }}
                    </NuxtLink>
                    <NuxtLink
                        to="/weight"
                        id="mob-weight"
                        @click="isMenuOpen = false"
                        class="text-4xl font-black uppercase hover:text-primary transition-colors block"
                    >
                        <span class="text-primary text-sm font-mono mb-1 block"
                            >02</span
                        >WEIGH IN
                    </NuxtLink>
                    <NuxtLink
                        to="/coach"
                        id="mob-coach"
                        @click="isMenuOpen = false"
                        class="text-4xl font-black uppercase hover:text-primary transition-colors block text-primary"
                    >
                        <span class="text-primary text-sm font-mono mb-1 block"
                            >03</span
                        >AI COACH
                    </NuxtLink>
                    <NuxtLink
                        to="/profile"
                        id="mob-profile"
                        @click="isMenuOpen = false"
                        class="text-4xl font-black uppercase hover:text-primary transition-colors block"
                    >
                        <span class="text-primary text-sm font-mono mb-1 block"
                            >04</span
                        >PROFILE
                    </NuxtLink>

                    <div class="h-px bg-separator my-2"></div>

                    <button @click="triggerModeModal" class="text-left">
                        <span
                            class="text-separator text-sm font-mono mb-1 block uppercase tracking-widest"
                            >Current Mode</span
                        >
                        <span
                            class="text-4xl font-black uppercase hover:text-primary transition-colors flex items-center gap-3"
                        >
                            <Dumbbell v-if="isGym" class="w-8 h-8" />
                            <Activity v-else class="w-8 h-8" />
                            {{ isGym ? "GYM" : "CALIST" }}
                        </span>
                        <span class="text-xs font-mono text-primary mt-1 block"
                            >Tap to switch →</span
                        >
                    </button>

                    <div class="h-px bg-separator my-2"></div>

                    <div v-if="isAuthenticated">
                        <button
                            @click="triggerLogout"
                            class="text-4xl font-black uppercase text-red-500 hover:text-red-600 transition-colors w-full text-left"
                        >
                            LOGOUT
                        </button>
                    </div>
                    <NuxtLink
                        v-else
                        to="/login"
                        @click="isMenuOpen = false"
                        class="text-4xl font-black uppercase hover:text-primary transition-colors block"
                    >
                        LOGIN
                    </NuxtLink>
                </div>
            </div>
        </transition>
    </header>
</template>

<script setup lang="ts">
import {
    Menu,
    X,
    LogOut,
    Dumbbell,
    Activity,
    ChevronDown,
    User,
} from "lucide-vue-next";

const { isAuthenticated, user } = useAuth();
const { isGym } = useMode();

const isMenuOpen = useState("isMenuOpen", () => false);
const isUserMenuOpen = ref(false);

const emit = defineEmits(["open-mode-modal", "open-logout-modal"]);

function triggerModeModal() {
    isMenuOpen.value = false;
    emit("open-mode-modal");
}

function triggerLogout() {
    isUserMenuOpen.value = false;
    isMenuOpen.value = false;
    emit("open-logout-modal");
}
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
</style>
