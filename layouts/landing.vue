<template>
  <!-- Landing layout is intentionally LIGHT-ONLY (marketing surface).
       text-ink on the root pins child color to the light-mode value so
       the body's `dark:text-zinc-100` rule can't bleed in when the user
       has dark mode enabled app-wide. -->
  <div class="min-h-screen bg-white text-ink">
    <LandingNavbar class="sticky top-0" style="z-index: 2" />
    <div
      class="sticky top-0 w-full py-1 text-center bg-pokemon-yellow text-white text-[12px] font-bold"
    >
      TCGo is currently under closed Beta Testing
    </div>
    <slot />
  </div>
</template>
