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
        <!-- Avatar -->
        <div class="flex items-center gap-4">
          <div class="relative group">
            <img
              :src="profile?.photoURL || user.photoURL || ''"
              :alt="profile?.customName || user.displayName || 'User'"
              class="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
            />
            <label
              class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg
                class="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handlePhotoUpload"
              />
            </label>
            <div
              v-if="uploadingPhoto"
              class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"
            >
              <div
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
              ></div>
            </div>
          </div>
          <div>
            <p class="font-bold text-lg">
              {{ profile?.customName || user.displayName }}
            </p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </div>

        <!-- Display Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
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

        <!-- Contact Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Contact Number
          </label>
          <div class="flex gap-3">
            <input
              v-model="editPhone"
              type="tel"
              placeholder="+60123456789"
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-pokemon-red focus:outline-none focus:ring-1 focus:ring-pokemon-red"
            />
            <button
              v-if="editPhone !== profile?.whatsappNumber"
              @click="savePhone"
              :disabled="savingPhone"
              class="bg-pokemon-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ savingPhone ? "..." : "Save" }}
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            Include country code (e.g. +60).
          </p>
        </div>

        <!-- Success Messages -->
        <div v-if="saveSuccess" class="text-green-600 text-sm">
          Profile updated!
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
import type { UserProfile } from "~/composables/useProfile";

const { user, signInWithGoogle } = useAuth();
const { profile, loading, updateProfile, updateCustomName } = useMyProfile();
const { uploadImage } = useStorage();

const editName = ref("");
const editPhone = ref("");
const saving = ref(false);
const savingPhone = ref(false);
const saveSuccess = ref(false);
const uploadingPhoto = ref(false);

watch(
  profile,
  (p: UserProfile | null) => {
    if (p) {
      editName.value = p.customName || p.displayName;
      editPhone.value = p.whatsappNumber || p.phone || "";
    }
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

const savePhone = async () => {
  savingPhone.value = true;
  saveSuccess.value = false;
  try {
    await updateProfile({
      phone: editPhone.value,
      whatsappNumber: editPhone.value,
      usePhoneAsWhatsapp: true,
    });
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } finally {
    savingPhone.value = false;
  }
};

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be under 5MB.");
    return;
  }

  uploadingPhoto.value = true;
  try {
    const photoURL = await uploadImage(file);
    await updateProfile({ photoURL });
  } catch (e: any) {
    alert(e.message || "Failed to upload photo.");
  } finally {
    uploadingPhoto.value = false;
  }
};
</script>
