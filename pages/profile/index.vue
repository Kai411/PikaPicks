<template>
  <div class="max-w-xl mx-auto">
    <div v-if="!user" class="text-center py-12">
      <p class="text-gray-500 text-lg mb-4">Sign in to manage your profile.</p>
      <button
        @click="signInWithGoogle"
        class="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
      >
        Sign in with Google
      </button>
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold mb-6">My Profile</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-6 w-6 border-b-2 border-pokemon-red"
        ></div>
      </div>

      <div
        v-else
        class="bg-white rounded-xl p-6 border border-gray-200 space-y-6"
      >
        <div class="flex items-center gap-4">
          <img
            :src="user.photoURL || ''"
            :alt="profile?.customName || user.displayName || 'User'"
            class="w-16 h-16 rounded-full border-2 border-gray-200"
          />
          <div>
            <p class="font-bold text-lg">
              {{ profile?.customName || user.displayName }}
            </p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Display Name</label
          >
          <div class="flex gap-3">
            <input
              v-model="editName"
              type="text"
              maxlength="30"
              placeholder="Your display name"
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-pokemon-red focus:outline-none focus:ring-1 focus:ring-pokemon-red"
            />
            <button
              @click="saveName"
              :disabled="
                saving || !editName.trim() || editName === profile?.customName
              "
              class="bg-pokemon-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? "Saving..." : "Save" }}
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            This name will be shown on your bids and listings.
          </p>
        </div>

        <div v-if="saveSuccess" class="text-green-600 text-sm">
          Name updated successfully!
        </div>

        <div class="pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            Your public profile:
            <NuxtLink
              :to="`/profile/${user.uid}`"
              class="text-pokemon-red hover:underline"
            >
              View profile →
            </NuxtLink>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { user, signInWithGoogle } = useAuth();
const { profile, loading, updateCustomName } = useMyProfile();

const editName = ref("");
const saving = ref(false);
const saveSuccess = ref(false);

watch(
  profile,
  (p) => {
    if (p) editName.value = p.customName || p.displayName;
  },
  { immediate: true },
);

const saveName = async () => {
  if (!editName.value.trim()) return;
  saving.value = true;
  saveSuccess.value = false;
  try {
    await updateCustomName(editName.value.trim());
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } finally {
    saving.value = false;
  }
};
</script>
