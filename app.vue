<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <NuxtRouteAnnouncer />
    <AppNavbar class="sticky top-0" style="z-index: 2" />
    <main class="container mx-auto px-4 py-8">
      <NuxtPage />
    </main>
  </div>
</template>
