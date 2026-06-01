<template>
  <div class="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border-2 border-separator p-8">
      <h1 class="text-3xl font-black uppercase mb-2">Reset Password</h1>
      <p class="text-sm font-mono text-foreground-text/60 mb-6">
        Enter your username to receive a reset link.
      </p>

      <form @submit.prevent="handleForgot" class="space-y-4">
        <div>
          <label
            class="block text-xs font-bold uppercase tracking-widest text-foreground-text mb-1"
            >Username</label
          >
          <input
            v-model="username"
            type="text"
            class="w-full bg-[#fcfbf7] border-2 border-separator p-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
            required
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
          {{ loading ? "Processing..." : "Send Reset Link" }}
        </button>
      </form>

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
import { ref } from "vue";

const username = ref("");
const loading = ref(false);
const message = ref("");
const errorMsg = ref("");

async function handleForgot() {
  loading.value = true;
  message.value = "";
  errorMsg.value = "";
  try {
    const res = await $fetch("/api/auth/forgot", {
      method: "POST",
      body: { username: username.value },
    });
    message.value = res.message as string;
    username.value = "";
  } catch (err: any) {
    errorMsg.value = err.data?.message || "Request failed";
  } finally {
    loading.value = false;
  }
}
</script>
