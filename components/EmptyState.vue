<template>
  <div class="surface rounded-2xl py-16 px-6 text-center">
    <p class="text-base font-semibold text-ink dark:text-white">
      {{ headline }}
    </p>
    <p
      v-if="caption"
      class="mt-1 text-sm text-ink-muted dark:text-zinc-400 max-w-md mx-auto"
    >
      {{ caption }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  headline: string;
  caption?: string;
}>();
</script>
