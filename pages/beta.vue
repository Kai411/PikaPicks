<script setup lang="ts">
definePageMeta({
  layout: "landing",
});

useHead({
  title: "TCGo Marketplace - Buy, Sell & Auction Pokemon Cards in Malaysia",
});

const { user, signInWithGoogle } = useAuth();
const router = useRouter();

const handleLogin = async () => {
  await signInWithGoogle();
  router.push("/profile");
};
</script>

<template>
  <div class="w-[90%] sm:w-[60%] mx-auto pt-8 pb-[120px]">
    <h1>TCGo Beta Access</h1>

    <div class="updates">
      <div class="header">
        <hr class="my-8" />
        <h1>Participation of beta access</h1>

        <br />
        <strong
          >Access to the TCGo Marketplace beta is limited to invited members
          only.</strong
        >
        <br />
        <br />
        <p class="text-pokemon-red font-bold">IMPORTANT</p>
        <p class="font-bold">
          To verify your account, invited members must submit the following via
          WhatsApp to +60129224545
        </p>
        <ul>
          <li>A screenshot of your TCGo profile page</li>
          <li>
            Proof that you are a member of
            <span class="underline">Chim's WhatsApp Community</span>
          </li>
        </ul>

        <br />
        <p>
          Only verified members will be granted access to the marketplace beta.
          <br />
          Unverified users may have their access removed without prior notice.
        </p>

        <br />
        <NuxtLink
          v-if="user"
          to="/profile"
          class="inline-block px-6 py-3 rounded-xl text-sm font-semibold bg-pokemon-red text-white hover:bg-red-700 transition-colors"
        >
          Go to My Profile
        </NuxtLink>
        <button
          v-else
          @click="handleLogin"
          class="inline-block px-6 py-3 rounded-xl text-sm font-semibold bg-pokemon-red text-white hover:bg-red-700 transition-colors"
        >
          Create Account / Log in
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  @apply text-3xl font-bold;
}

h2 {
  @apply text-2xl font-bold;
}

ul {
  list-style: disc;
  margin-left: 30px;
}

.content-container {
  @apply flex flex-col gap-8;
}
</style>
