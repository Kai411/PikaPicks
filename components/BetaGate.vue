<script setup lang="ts">
const route = useRoute();
const { user } = useAuth();
const { profile, loading } = useMyProfile();

// Pages that unverified users still need access to
const allowedPaths = ["/profile"];

const showGate = computed(() => {
  // Not logged in or still loading — don't block
  if (!user.value || loading.value) return false;
  // Allow access to certain pages (e.g. profile for screenshot)
  if (
    allowedPaths.some((p) => route.path === p || route.path.startsWith(p + "/"))
  )
    return false;
  // Logged in but not verified — show gate
  return !profile.value?.whatsappVerified;
});
</script>

<template>
  <div
    v-if="showGate"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-900/90 backdrop-blur-sm"
  >
    <div
      class="max-w-md w-[90%] text-center p-8 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl border border-gray-200 dark:border-zinc-700"
    >
      <p class="text-lg font-semibold text-gray-900 dark:text-white">
        Oops! Seems like you're not verified for beta access yet.
      </p>
      <p class="mt-3 text-sm text-gray-600 dark:text-zinc-400">
        Please click the button below to read the instructions to verify your
        beta access.
      </p>
      <NuxtLink
        to="/beta"
        class="mt-6 inline-block px-6 py-3 rounded-xl text-sm font-semibold bg-pokemon-red text-white hover:bg-red-700 transition-colors"
      >
        Verify Beta Access
      </NuxtLink>
    </div>
  </div>
</template>
