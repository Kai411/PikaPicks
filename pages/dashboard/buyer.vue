<script setup lang="ts">
// Old URL — keep working but route users to the unified /activity page.
definePageMeta({
  middleware: [
    () => navigateTo("/activity?tab=bidding", { replace: true }),
  ],
});
</script>

<template>
  <div />
</template>
