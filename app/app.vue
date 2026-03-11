<template>
    <div
        class="min-h-screen flex flex-col font-sans text-foreground-primary overflow-x-hidden"
    >
        <TheNavbar
            @open-mode-modal="showModeModal = true"
            @open-logout-modal="showLogoutModal = true"
        />

        <main class="flex-1 pt-20 w-full max-w-[100vw] overflow-x-hidden">
            <NuxtPage />
        </main>

        <TheFooter />

        <ModeSelectorModal
            :show="showModeModal"
            @close="showModeModal = false"
        />

        <ConfirmLogoutModal
            :show="showLogoutModal"
            @close="showLogoutModal = false"
            @confirm="handleLogout"
        />

        <OnboardingTour />
        <GlobalTimer />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { isAuthenticated, logout, checkAuth } = useAuth();
const { hasMode } = useMode();

const showLogoutModal = ref(false);
const showModeModal = ref(false);
const isAuthChecked = ref(false);

function handleLogout() {
    logout();
    showLogoutModal.value = false;
    navigateTo("/");
}

watchEffect(() => {
    if (
        isAuthChecked.value &&
        !hasMode.value &&
        isAuthenticated.value &&
        route.path !== "/login"
    ) {
        showModeModal.value = true;
    } else {
        showModeModal.value = false;
    }
});

onMounted(async () => {
    await checkAuth();
    isAuthChecked.value = true;
});
</script>
