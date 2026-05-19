<template>
  <div>
    <!-- Header -->
    <header class="flex items-end justify-between mb-8">
      <div>
        <h1
          class="font-display text-4xl sm:text-5xl font-extrabold tracking-tightest text-ink dark:text-white"
        >
          Shop
        </h1>
        <p class="mt-1 text-sm text-ink-muted dark:text-zinc-400">
          {{ availableCards.length }} card{{
            availableCards.length === 1 ? "" : "s"
          }}
          for sale · curated by Malaysian collectors
        </p>
      </div>

      <NuxtLink
        v-if="user"
        to="/cards/create"
        class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-ink text-white dark:bg-white dark:text-ink hover:opacity-90 transition-opacity"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        List Card
      </NuxtLink>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-24">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-ink/10 border-t-pokemon-red"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="availableCards.length === 0"
      class="surface rounded-2xl py-20 text-center"
    >
      <p class="text-lg font-semibold text-ink dark:text-white">
        No cards listed yet
      </p>
      <p class="mt-1 text-sm text-ink-muted dark:text-zinc-400">
        Be the first collector to list one.
      </p>
      <NuxtLink
        v-if="user"
        to="/cards/create"
        class="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-pokemon-red text-white hover:shadow-glow transition-shadow"
      >
        List your first card
      </NuxtLink>
    </div>

    <!-- Grid -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
    >
      <NuxtLink
        v-for="card in availableCards"
        :key="card.id"
        :to="`/cards/${card.id}`"
        class="group block"
      >
        <div
          class="surface rounded-2xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
        >
          <div
            class="aspect-[3/4] bg-canvas-sunken dark:bg-white/[0.02] flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="card.imageUrls?.length || card.imageUrl"
              :src="card.imageUrls?.[0] || card.imageUrl"
              :alt="card.cardName"
              class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            <span
              v-else
              class="text-xs text-ink-soft dark:text-zinc-500"
              >No image</span
            >
          </div>
          <div class="p-3 sm:p-3.5">
            <h3
              class="font-semibold text-sm text-ink dark:text-white truncate"
            >
              {{ card.cardName }}
            </h3>
            <p
              class="mt-0.5 text-[11px] text-ink-muted dark:text-zinc-400 truncate"
            >
              <span v-if="card.cardSet">{{ card.cardSet }}</span>
              <span v-if="card.cardSet && conditionLabel(card)"> · </span>
              <span>{{ conditionLabel(card) }}</span>
            </p>
            <p
              class="mt-0.5 text-[11px] text-ink-soft dark:text-zinc-500 truncate"
            >
              {{ card.seller }}
            </p>
            <div class="mt-2.5 flex items-center justify-between">
              <p
                class="tabular-price font-bold text-[15px] text-ink dark:text-white"
              >
                <span class="text-ink-soft text-[11px] font-medium mr-0.5"
                  >RM</span
                >{{ card.price.toFixed(2) }}
              </p>
              <div class="flex items-center gap-1.5">
                <span
                  v-if="card.interestedCount > 0"
                  class="text-[10px] text-ink-soft dark:text-zinc-500"
                >
                  🔥 {{ card.interestedCount }}
                </span>
                <FavouriteButton
                  :item-id="card.id"
                  item-type="card"
                  :count="card.favouriteCount || 0"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from "~/composables/useCards";

useHead({
  title: "Shop Pokemon Cards | TCGo Marketplace",
  meta: [
    {
      name: "description",
      content:
        "Browse and buy Pokemon TCG cards from collectors across Malaysia. Find rare cards, vintage sets, and modern releases at fair prices.",
    },
  ],
});

const { user } = useAuth();
const { cards, loading } = useCards();

const availableCards = computed(() =>
  cards.value
    .filter((c: Card) => !c.sold)
    .sort((a: Card, b: Card) => b.createdAt - a.createdAt),
);

const conditionLabel = (card: Card): string => {
  if (card.productType === "Graded") {
    const provider =
      card.gradingProvider === "Others"
        ? card.customGradingProvider
        : card.gradingProvider;
    return `${provider || ""} ${card.grade || ""}`.trim();
  }
  if (card.productType === "Sealed") return "Sealed";
  return card.condition || "";
};
</script>
