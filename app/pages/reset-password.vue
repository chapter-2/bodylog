<template>
  <div class="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border-2 border-separator p-8">
      <h1 class="text-3xl font-black uppercase mb-2">New Password</h1>
      <p class="text-sm font-mono text-foreground-text/60 mb-6">
        Enter your new password below.
      </p>

      <form v-if="token" @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label
            class="block text-xs font-bold uppercase tracking-widest text-foreground-text mb-1"
            >New Password</label
          >
          <input
            v-model="newPassword"
            type="password"
            class="w-full bg-[#fcfbf7] border-2 border-separator p-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
            required
            minlength="6"
          />
        </div>

        <div
          v-if="message"
          class="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-mono"
        >
          {{ message }}
        </div>
        <div
          v-if="errorMsg"
          class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono"
        >
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-white font-bold uppercase py-3 border-2 border-primary hover:bg-white hover:text-primary transition-colors disabled:opacity-50"
        >
          {{ loading ? "Processing..." : "Update Password" }}
        </button>
      </form>

      <div
        v-else
        class="p-4 bg-red-50 border-2 border-red-200 text-red-700 text-center font-mono text-sm font-bold"
      >
        Invalid or missing reset token.
      </div>

      <div class="mt-6 text-center">
        <NuxtLink
          to="/login"
          class="text-xs font-mono text-foreground-text/60 hover:text-primary"
          >Back to Login</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const route = useRoute();
const token = ref("");
const newPassword = ref("");
const loading = ref(false);
const message = ref("");
const errorMsg = ref("");

onMounted(() => {
  token.value = route.query.token as string;
});

async function handleReset() {
  loading.value = true;
  message.value = "";
  errorMsg.value = "";
  try {
    const res = await $fetch("/api/auth/reset", {
      method: "POST",
      body: { token: token.value, newPassword: newPassword.value },
    });
    message.value = res.message as string;
    setTimeout(() => navigateTo("/login"), 2000);
  } catch (err: any) {
    errorMsg.value = err.data?.message || "Reset failed";
  } finally {
    loading.value = false;
  }
}
</script>
