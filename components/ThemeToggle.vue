<template>
  <button
    type="button"
    role="switch"
    :aria-checked="resolved === 'dark'"
    :aria-label="`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`"
    @click="toggle"
    class="relative inline-flex items-center w-[52px] h-7 rounded-full transition-colors duration-300 ease-premium shrink-0"
    :class="
      resolved === 'dark'
        ? 'bg-pokemon-red'
        : 'bg-black/[0.10] dark:bg-white/[0.12]'
    "
  >
    <span
      class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.10)] transition-transform duration-300 ease-premium flex items-center justify-center"
      :class="resolved === 'dark' ? 'translate-x-6' : 'translate-x-0'"
    >
      <!-- Sun (light mode) -->
      <svg
        v-if="resolved !== 'dark'"
        class="w-3.5 h-3.5 text-amber-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
      <!-- Moon (dark mode) -->
      <svg
        v-else
        class="w-3.5 h-3.5 text-pokemon-red"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
const { resolved, toggle } = useTheme();
</script>
