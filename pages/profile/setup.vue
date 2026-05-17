<template>
  <div class="max-w-md mx-auto py-12">
    <div class="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
      <h1 class="text-2xl font-bold text-center mb-2">Welcome to PikaPicks!</h1>
      <p class="text-gray-500 text-center text-sm mb-8">
        Set up your profile before you start trading.
      </p>

      <!-- Profile Picture -->
      <div class="flex flex-col items-center mb-6">
        <div
          class="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 mb-3"
        >
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="Profile preview"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
        </div>
        <label
          class="text-sm text-pokemon-blue font-medium cursor-pointer hover:underline"
        >
          {{ previewUrl ? "Change photo" : "Upload photo" }}
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
        </label>
      </div>

      <!-- Display Name -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Display Name
        </label>
        <input
          v-model="displayName"
          type="text"
          maxlength="30"
          placeholder="What should we call you?"
          class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-pokemon-red focus:outline-none focus:ring-1 focus:ring-pokemon-red"
        />
        <p class="text-xs text-gray-400 mt-1">
          This name will appear on your listings and bids.
        </p>
      </div>

      <!-- Contact Number -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Contact Number (WhatsApp)
        </label>
        <input
          v-model="phone"
          type="tel"
          placeholder="+60123456789"
          class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-pokemon-red focus:outline-none focus:ring-1 focus:ring-pokemon-red"
        />
        <p class="text-xs text-gray-400 mt-1">
          Include country code (e.g. +60). Used for buyer/seller communication.
        </p>
      </div>

      <!-- Error -->
      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

      <!-- Submit -->
      <button
        @click="saveProfile"
        :disabled="saving || !displayName.trim()"
        class="w-full bg-pokemon-red text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ saving ? "Saving..." : "Get Started" }}
      </button>

      <!-- Skip -->
      <button
        @click="skipSetup"
        class="w-full mt-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
      >
        Skip for now
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth();
const { profile, updateProfile } = useMyProfile();
const { uploadImage } = useStorage();
const router = useRouter();

const displayName = ref("");
const phone = ref("");
const selectedFile = ref<File | null>(null);
const previewUrl = ref("");
const saving = ref(false);
const error = ref("");

// Pre-fill with Google display name if available
watch(
  user,
  (u: any) => {
    if (u && !displayName.value) {
      displayName.value = u.displayName || "";
      if (u.photoURL) previewUrl.value = u.photoURL;
    }
  },
  { immediate: true },
);

// Redirect if not logged in
watch(
  user,
  (u: any) => {
    if (u === null) {
      router.replace("/");
    }
  },
  { immediate: true },
);

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    error.value = "Image must be under 5MB.";
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  error.value = "";
};

const saveProfile = async () => {
  if (!displayName.value.trim()) return;

  saving.value = true;
  error.value = "";

  try {
    let photoURL = profile.value?.photoURL || user.value?.photoURL || "";

    if (selectedFile.value) {
      photoURL = await uploadImage(selectedFile.value);
    }

    await updateProfile({
      customName: displayName.value.trim(),
      photoURL,
      phone: phone.value,
      whatsappNumber: phone.value,
      usePhoneAsWhatsapp: true,
    });

    router.replace("/");
  } catch (e: any) {
    error.value = e.message || "Something went wrong. Try again.";
  } finally {
    saving.value = false;
  }
};

const skipSetup = () => {
  router.replace("/");
};
</script>
