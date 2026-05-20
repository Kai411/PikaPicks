<template>
  <div class="min-h-screen bg-canvas dark:bg-canvas-inverse text-ink dark:text-zinc-100 transition-colors">
    <AppNavbar />
    <div
      class="w-full py-1 text-center bg-pokemon-yellow/90 dark:bg-pokemon-yellow/80 text-[11px] font-semibold tracking-wide text-black/80"
    >
      You're on the Beta build of TCGo
    </div>
    <main class="container mx-auto px-4 py-8 pb-28 lg:pb-12">
      <slot />
    </main>
  </div>
</template>
