<template>
    <section>
        <div
            class="flex items-center gap-3 mb-6 border-b-2 border-separator pb-2"
        >
            <UserIcon class="w-6 h-6 text-primary shrink-0" />
            <h2
                class="text-xl md:text-2xl font-black uppercase tracking-widest text-foreground-primary leading-tight"
            >
                Account & Security
            </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div
                class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center h-full"
            >
                <div
                    class="w-20 h-20 bg-primary flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_#27272a] mb-5"
                >
                    <UserIcon class="w-10 h-10 text-white" />
                </div>
                <h3
                    class="text-3xl font-black uppercase tracking-tight text-foreground-primary truncate w-full"
                >
                    {{ user?.username || "Loading..." }}
                </h3>
                <p
                    v-if="user?.created_at"
                    class="font-mono text-xs text-foreground-text mt-4 uppercase tracking-widest border-t border-separator pt-4 w-full"
                >
                    Claimed:
                    <span class="text-primary font-bold">{{
                        new Date(user.created_at).toLocaleDateString("id-ID")
                    }}</span>
                </p>
            </div>

            <div
                class="bg-white border-2 border-separator p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full"
            >
                <h3
                    class="font-black uppercase text-lg mb-6 flex items-center gap-2"
                >
                    <Lock class="w-4 h-4 text-primary" /> Change Password
                </h3>
                <form
                    @submit.prevent="changePassword"
                    class="space-y-5 flex-1 flex flex-col"
                >
                    <div class="group">
                        <label
                            class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2"
                            >Current Password</label
                        >
                        <input
                            v-model="passForm.old"
                            type="password"
                            class="input-pow py-2 w-full text-base font-mono"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div class="group">
                        <label
                            class="block font-mono text-xs uppercase tracking-widest text-foreground-text mb-2"
                            >New Password</label
                        >
                        <input
                            v-model="passForm.new"
                            type="password"
                            class="input-pow py-2 w-full text-base font-mono"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div class="mt-auto pt-4">
                        <div
                            v-if="passMsg"
                            :class="
                                passStatus === 'error'
                                    ? 'text-red-500 bg-red-50 border-red-100'
                                    : 'text-green-700 bg-green-50 border-green-100'
                            "
                            class="text-sm font-bold border p-3 rounded mb-3 text-center"
                        >
                            {{ passMsg }}
                        </div>
                        <button
                            type="submit"
                            :disabled="isChangingPass"
                            class="w-full py-3 bg-foreground-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-50"
                        >
                            {{
                                isChangingPass
                                    ? "Updating..."
                                    : "Update Password"
                            }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { User as UserIcon, Lock } from "lucide-vue-next";

const { secureFetch, user } = useAuth();

const passForm = ref({ old: "", new: "" });
const isChangingPass = ref(false);
const passMsg = ref("");
const passStatus = ref<"error" | "success">("success");

async function changePassword() {
    isChangingPass.value = true;
    passMsg.value = "";
    try {
        await secureFetch("/api/auth/password", {
            method: "POST",
            body: {
                oldPassword: passForm.value.old,
                newPassword: passForm.value.new,
            },
        });
        passStatus.value = "success";
        passMsg.value = "✓ Password updated successfully.";
        passForm.value = { old: "", new: "" };
    } catch (e: any) {
        passStatus.value = "error";
        passMsg.value = e.data?.message || "Failed to update password.";
    } finally {
        isChangingPass.value = false;
    }
}
</script>
