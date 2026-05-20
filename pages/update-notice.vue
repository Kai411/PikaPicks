<script setup lang="ts">
definePageMeta({
  layout: "landing",
});

useHead({
  title: "TCGo Marketplace - Buy, Sell & Auction Pokemon Cards in Malaysia",
});
</script>

<template>
  <div class="w-[90%] sm:w-[60%] mx-auto pt-8 pb-[120px]">
    <h1>TCGo Updates</h1>

    <div class="updates">
      <div class="header">
        <hr class="my-8" />
        <h1>V 0.1.0</h1>
        <p class="italic mt-2">Date: May 21, 2026</p>

        <br />
        <strong>Major changes:</strong>
        <ul>
          <li>Queued scanner for create listing</li>
          <li>Improved marketplace UI</li>
        </ul>
      </div>

      <div class="header">
        <hr class="my-8" />
        <h1>V 0.0.5</h1>
        <p class="italic mt-2">Date: May 19, 2026</p>

        <br />
        <strong>Launch of beta access.</strong>
      </div>

      <div class="header">
        <hr class="my-8" />
        <h1>V 0.0.4</h1>
        <p class="italic mt-2">Date: May 17, 2026</p>

        <br />
        <strong>New Feature:</strong>
        <ul>
          <li>TCGo Landing Page</li>
          <li>Privacy Policy</li>
        </ul>
      </div>

      <div class="header">
        <hr class="my-8" />
        <h1>V 0.0.3</h1>
        <p class="italic mt-2">Date: May 16, 2026</p>

        <br />
        <strong>New Feature:</strong>
        <ul>
          <li>Google login</li>
          <li>Profile management</li>
        </ul>
      </div>

      <div class="header">
        <hr class="my-8" />
        <h1>V 0.0.2</h1>
        <p class="italic mt-2">Date: May 15, 2026</p>

        <br />
        <strong>New Feature:</strong>
        <ul>
          <li>Sales listing</li>
          <li>Real-time live bidding</li>
        </ul>
      </div>

      <div class="header">
        <hr class="my-8" />
        <h1>V 0.0.1</h1>
        <p class="italic mt-2">Date: May 14, 2026</p>

        <br />
        <strong>First prototype of TCGo Marketplace</strong>
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
