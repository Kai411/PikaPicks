<template>
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-base font-bold text-ink dark:text-white">
        {{ title }}
        <span
          v-if="count > 0"
          class="ml-1 text-xs font-semibold text-ink-muted dark:text-zinc-400 tabular-nums"
        >
          ({{ count }})
        </span>
      </h2>
    </div>
    <div v-if="count === 0" class="text-sm text-ink-muted dark:text-zinc-400 py-3">
      {{ emptyText }}
      <NuxtLink
        v-if="emptyCta && emptyCtaTo"
        :to="emptyCtaTo"
        class="text-pokemon-red hover:underline ml-1"
      >
        {{ emptyCta }} →
      </NuxtLink>
    </div>
    <div v-else class="space-y-2.5">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  count: number;
  emptyText: string;
  emptyCta?: string;
  emptyCtaTo?: string;
}>();
</script>
