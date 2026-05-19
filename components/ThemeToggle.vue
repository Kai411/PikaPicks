<template>
  <button
    @click="toggle"
    type="button"
    :aria-label="`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`"
    class="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink/70 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
  >
    <svg
      v-if="resolved === 'dark'"
      class="w-[18px] h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
    <svg
      v-else
      class="w-[18px] h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
const { resolved, toggle } = useTheme();
</script>
