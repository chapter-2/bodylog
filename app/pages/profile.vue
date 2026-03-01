<template>
    <div class="min-h-screen bg-background pb-20">
        <div class="inner py-10 md:py-16 px-4 md:px-8">
            <div class="mb-12 border-b-2 border-foreground-primary pb-6 text-center md:text-left">
                <span class="font-handwriting text-xl text-primary mb-1 block">Instance Management</span>
                <h1 class="text-4xl md:text-6xl font-black uppercase text-foreground-primary tracking-tighter">
                    Settings
                </h1>
            </div>

            <div class="max-w-5xl mx-auto space-y-16">
                <ProfileAccountSecurity />
                <ProfileProtocolConfig />
                <ProfileSystemData />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ProfileAccountSecurity from '~/components/profile/ProfileAccountSecurity.vue';
import ProfileProtocolConfig from '~/components/profile/ProfileProtocolConfig.vue';
import ProfileSystemData from '~/components/profile/ProfileSystemData.vue';

const { isAuthenticated, checkAuth } = useAuth();

onMounted(async () => {
    await checkAuth();
    if (!isAuthenticated.value) navigateTo('/login');
});
</script>
