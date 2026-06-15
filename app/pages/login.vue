<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden"
  >
    <div
      v-if="!isCheckingStatus"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.03] pointer-events-none select-none"
    >
      <span
        class="text-[18rem] md:text-[20rem] font-black font-sans text-primary"
        >{{ needsSetup ? "SETUP" : "LOGIN" }}</span
      >
    </div>

    <div v-if="isCheckingStatus" class="flex flex-col items-center">
      <div class="flex gap-2">
        <span
          class="w-3 h-3 bg-primary rounded-full animate-bounce"
          style="animation-delay: 0ms"
        ></span>
        <span
          class="w-3 h-3 bg-primary rounded-full animate-bounce"
          style="animation-delay: 150ms"
        ></span>
        <span
          class="w-3 h-3 bg-primary rounded-full animate-bounce"
          style="animation-delay: 300ms"
        ></span>
      </div>
      <p
        class="mt-4 font-mono text-xs uppercase tracking-widest text-foreground-text"
      >
        Verifying Instance...
      </p>
    </div>

    <div
      v-else
      class="w-full max-w-md bg-white border-2 border-separator p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10"
    >
      <div class="text-center mb-10">
        <span
          class="font-handwriting text-xl text-primary mb-2 block -rotate-2"
        >
          {{ needsSetup ? "First Time Installation" : "Welcome Back!" }}
        </span>
        <h1
          class="text-4xl font-black uppercase text-foreground-primary tracking-tighter leading-none"
        >
          {{ needsSetup ? "CLAIM SERVER" : "ACCESS LOGS" }}
        </h1>
        <p
          v-if="needsSetup"
          class="mt-4 text-xs font-mono bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 text-left"
        >
          <strong>SECURITY NOTICE:</strong> This instance has no owner. Create
          the admin account now to lock this server.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="group">
          <label
            class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2 group-focus-within:text-primary transition-colors"
          >
            {{ needsSetup ? "Choose Username" : "Username" }}
          </label>
          <input
            v-model="form.username"
            type="text"
            class="input-pow"
            placeholder="athlete_01"
            :disabled="loading"
            required
            autofocus
          />
        </div>

        <div class="group">
          <label
            class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2 group-focus-within:text-primary transition-colors"
          >
            {{ needsSetup ? "Set Password" : "Password" }}
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="input-pow pr-12"
              placeholder="••••••••"
              :disabled="loading"
              required
            />

            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-separator hover:text-primary transition-colors focus:outline-none"
              :disabled="loading"
            >
              <EyeOff v-if="showPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          v-if="errorMsg"
          class="p-3 bg-red-50 border border-red-100 text-red-500 text-sm font-bold text-center rounded"
        >
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full h-16 bg-foreground-primary text-white rounded-xl font-bold text-lg hover:bg-primary transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span v-if="loading" class="flex items-center gap-3">
            <div class="flex gap-1">
              <span
                class="w-2 h-2 bg-white rounded-full animate-bounce"
                style="animation-delay: 0ms"
              ></span>
              <span
                class="w-2 h-2 bg-white rounded-full animate-bounce"
                style="animation-delay: 150ms"
              ></span>
              <span
                class="w-2 h-2 bg-white rounded-full animate-bounce"
                style="animation-delay: 300ms"
              ></span>
            </div>
            <span>Processing...</span>
          </span>
          <span v-else class="flex items-center gap-2">
            {{ needsSetup ? "Lock & Initialize" : "Access Dashboard" }}
            <ArrowRight
              class="w-5 h-5 group-hover:-rotate-45 transition-transform"
            />
          </span>
        </button>
      </form>

      <NuxtLink
        to="/forgot-password"
        class="text-xs hover:text-primary mt-2 block"
        >Lupa Password?</NuxtLink
      >

      <div
        v-if="!needsSetup"
        class="mt-12 pt-8 border-t border-separator text-center"
      >
        <p
          class="font-mono text-[10px] uppercase tracking-widest text-foreground-text mb-4 opacity-60"
        >
          Need Help?
        </p>
        <div class="flex flex-col gap-4">
          <a
            href="https://github.com/szuryuu/bodylog"
            target="_blank"
            class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground-primary hover:text-primary transition-colors group"
          >
            <Github class="w-4 h-4" />
            <span>View Documentation</span>
          </a>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="showSuccess"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div
          class="w-full max-w-sm bg-white border-2 border-foreground-primary p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center animate-bounce-in"
        >
          <div
            class="mx-auto w-16 h-16 bg-green-50 border-2 border-green-100 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-3xl font-black uppercase mb-2">
            {{ needsSetup ? "Instance Secured!" : "Access Granted!" }}
          </h3>
          <p class="font-mono text-sm mb-4 text-foreground-text">
            Loading your workspace...
          </p>
          <div class="flex gap-1 justify-center">
            <span
              class="w-2 h-2 bg-primary rounded-full animate-bounce"
              style="animation-delay: 0ms"
            ></span>
            <span
              class="w-2 h-2 bg-primary rounded-full animate-bounce"
              style="animation-delay: 150ms"
            ></span>
            <span
              class="w-2 h-2 bg-primary rounded-full animate-bounce"
              style="animation-delay: 300ms"
            ></span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ArrowRight, Eye, EyeOff, CheckCircle, Github } from "lucide-vue-next";

const { login, setupAccount, checkAppStatus } = useAuth();

const isCheckingStatus = ref(true);
const needsSetup = ref(false);
const form = ref({ username: "", password: "" });
const loading = ref(false);
const showSuccess = ref(false);
const errorMsg = ref("");
const showPassword = ref(false);

onMounted(async () => {
  isCheckingStatus.value = true;
  const isSetup = await checkAppStatus();
  needsSetup.value = !isSetup;
  isCheckingStatus.value = false;
});

async function handleSubmit() {
  loading.value = true;
  errorMsg.value = "";

  try {
    let success = false;
    if (needsSetup.value) {
      success = await setupAccount(form.value.username, form.value.password);
    } else {
      success = await login(form.value.username, form.value.password);
    }

    if (success) {
      showSuccess.value = true;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigateTo("/");
    }
  } catch (e: any) {
    errorMsg.value = e.message || "Operation failed. Please try again.";
  } finally {
    if (!showSuccess.value) {
      loading.value = false;
    }
  }
}
</script>

<style scoped>
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
