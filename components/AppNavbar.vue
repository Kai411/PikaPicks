<template>
  <!-- Top bar (sticky, glassy) -->
  <nav class="sticky top-0 z-40 glass">
    <div
      class="container mx-auto px-4 h-14 lg:h-16 flex items-center justify-between"
    >
      <!-- Logo -->
      <NuxtLink to="/landing" class="flex items-center">
        <img
          src="~/assets/images/tcgo_sprites.png"
          alt="TCGo"
          class="h-9 lg:h-11 w-auto"
        />
      </NuxtLink>

      <!-- Desktop nav -->
      <div class="hidden lg:flex items-center gap-1">
        <NuxtLink
          v-for="link in desktopLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 rounded-full text-sm font-medium text-ink/70 dark:text-zinc-300 hover:text-ink dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          active-class="!text-ink dark:!text-white bg-black/[0.04] dark:bg-white/[0.06]"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <!-- Right cluster -->
      <div class="flex items-center gap-1.5 lg:gap-2">
        <ThemeToggle />

        <!-- Desktop sell CTAs -->
        <div v-if="user" class="hidden lg:flex items-center gap-2 ml-1">
          <NuxtLink
            to="/cards/create"
            class="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-ink text-white dark:bg-white dark:text-ink hover:opacity-90 transition-opacity"
          >
            Sell
          </NuxtLink>
          <NuxtLink
            to="/auctions/create"
            class="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-pokemon-red text-white hover:shadow-glow transition-shadow"
          >
            Auction
          </NuxtLink>
        </div>

        <!-- Auth -->
        <div
          v-if="authLoading"
          class="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 animate-pulse"
        />
        <NuxtLink
          v-else-if="user"
          :to="`/profile/${user.uid}`"
          class="ml-1 flex items-center hover:opacity-80 transition-opacity"
        >
          <img
            :src="profile?.photoURL || user.photoURL || ''"
            :alt="profile?.customName || user.displayName || 'User'"
            class="w-9 h-9 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
          />
        </NuxtLink>
        <button
          v-else
          @click="signInWithGoogle"
          class="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-ink text-white dark:bg-white dark:text-ink hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile bottom tab bar -->
  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-black/[0.06] dark:border-white/[0.08]"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="grid grid-cols-4 h-16">
      <NuxtLink
        v-for="tab in mobileTabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink/60 dark:text-zinc-400"
        :class="
          tab.accent
            ? 'text-pokemon-red dark:text-pokemon-red'
            : 'active:text-ink dark:active:text-white'
        "
        :active-class="
          tab.accent
            ? '!text-pokemon-red'
            : '!text-ink dark:!text-white'
        "
      >
        <div
          :class="
            tab.accent
              ? 'w-11 h-11 -mt-2 rounded-full bg-pokemon-red text-white flex items-center justify-center shadow-glow'
              : 'w-6 h-6 flex items-center justify-center'
          "
        >
          <component :is="tab.icon" class="w-5 h-5" />
        </div>
        <span :class="tab.accent ? '-mt-0.5' : ''">{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { h, computed } from "vue";

const { user, authLoading, signInWithGoogle } = useAuth();
const { profile } = useMyProfile();
const { isAdmin } = useAdmin();

const desktopLinks = computed(() => {
  const links = [
    { to: "/", label: "Shop" },
    { to: "/auctions", label: "Auctions" },
  ];
  if (user.value) {
    links.push(
      { to: "/dashboard/seller", label: "Listings" },
      { to: "/dashboard/buyer", label: "Bids" },
    );
  }
  if (isAdmin.value) links.push({ to: "/admin/reports", label: "Admin" });
  return links;
});

// Inline icons as render functions — keeps the template lean and avoids deps.
const stroke = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};
const IconShop = () =>
  h("svg", { viewBox: "0 0 24 24", ...stroke }, [
    h("path", { d: "M3 9l1.5-5h15L21 9" }),
    h("path", { d: "M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" }),
    h("path", { d: "M9 13h6" }),
  ]);
const IconGavel = () =>
  h("svg", { viewBox: "0 0 24 24", ...stroke }, [
    h("path", { d: "M14 4l6 6-3 3-6-6 3-3z" }),
    h("path", { d: "M11 7l-7 7 3 3 7-7" }),
    h("path", { d: "M3 21h12" }),
  ]);
const IconPlus = () =>
  h("svg", { viewBox: "0 0 24 24", ...stroke }, [
    h("path", { d: "M12 5v14M5 12h14" }),
  ]);
const IconUser = () =>
  h("svg", { viewBox: "0 0 24 24", ...stroke }, [
    h("circle", { cx: "12", cy: "8", r: "4" }),
    h("path", { d: "M4 21a8 8 0 0 1 16 0" }),
  ]);

const mobileTabs = computed(() => {
  const tabs: {
    to: string;
    label: string;
    icon: any;
    accent?: boolean;
  }[] = [
    { to: "/", label: "Shop", icon: IconShop },
    { to: "/auctions", label: "Auctions", icon: IconGavel },
  ];
  if (user.value) {
    tabs.push({
      to: "/cards/create",
      label: "Sell",
      icon: IconPlus,
      accent: true,
    });
    tabs.push({
      to: `/profile/${user.value.uid}`,
      label: "Profile",
      icon: IconUser,
    });
  } else {
    // Pad so the grid stays 4-col and Sign In sits in the action slot.
    tabs.push({ to: "/cards/create", label: "Sell", icon: IconPlus, accent: true });
    tabs.push({ to: "/profile", label: "Sign in", icon: IconUser });
  }
  return tabs;
});
</script>
