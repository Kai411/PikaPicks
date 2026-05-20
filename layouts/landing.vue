<template>
  <div class="min-h-screen bg-white">
    <LandingNavbar class="sticky top-0" style="z-index: 2" />
    <div
      class="sticky top-0 w-full py-1 text-center bg-pokemon-yellow text-[12px] font-bold"
    >
      TCGo is currently under closed Beta Testing
    </div>
    <slot />
  </div>
</template>
