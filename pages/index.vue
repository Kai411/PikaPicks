<template>
  <div>
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
        class="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-pokemon-red text-white hover:shadow-glow transition-shadow ease-premium"
      >
        List your first card
      </NuxtLink>
    </div>

    <!-- Grid -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5"
    >
      <NuxtLink
        v-for="card in availableCards"
        :key="card.id"
        :to="`/cards/${card.id}`"
        class="group block"
      >
        <article
          class="surface rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow duration-300 ease-premium h-full flex flex-col"
        >
          <!-- White-framed image well: padding around the image so the card
               art doesn't crash into the surrounding tile edge. -->
          <div class="p-2 sm:p-2.5 bg-white dark:bg-white/[0.04]">
            <div
              class="relative aspect-[3/4] rounded-lg bg-canvas-sunken dark:bg-white/[0.02] overflow-hidden"
            >
              <img
                v-if="card.imageUrls?.length || card.imageUrl"
                :src="cdnUrl(card.imageUrls?.[0] || card.imageUrl, 400)"
                :alt="card.cardName"
                loading="lazy"
                class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-premium"
              />
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center text-xs text-ink-soft dark:text-zinc-500"
              >
                No image
              </div>

              <!-- Language badge (top-right) — only for non-English cards -->
              <span
                v-if="card.language && card.language !== 'EN'"
                class="absolute top-1.5 right-1.5 bg-black/75 text-white text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded"
              >
                {{ card.language }}
              </span>

              <!-- Full-width seller band at the bottom of the image -->
              <div
                v-if="card.seller"
                class="absolute bottom-0 left-0 right-0 bg-pokemon-red text-white text-xs font-semibold px-3 py-1.5 truncate text-center"
              >
                {{ card.seller }}
              </div>
            </div>
          </div>

          <!-- Body: flex-1 fills the rest of the cell, mt-auto on the price
               block keeps prices aligned across tiles. Condition chip sits
               directly above the price. -->
          <div class="px-3.5 sm:px-4 pt-2 pb-3.5 sm:pb-4 flex-1 flex flex-col">
            <h3
              class="font-semibold text-[15px] leading-tight text-ink dark:text-white truncate"
            >
              {{ card.cardName }}
            </h3>
            <p
              v-if="card.cardSet"
              class="mt-1 text-xs text-ink-muted dark:text-zinc-400 truncate"
            >
              {{ card.cardSet }}
            </p>

            <div class="mt-auto pt-3">
              <span
                v-if="conditionLabel(card)"
                class="chip"
                :class="conditionTone(card)"
              >
                {{ conditionLabel(card) }}
              </span>
              <div class="mt-2 flex items-end justify-between">
                <div class="min-w-0">
                  <span class="text-[10px] font-semibold uppercase tracking-wider text-ink-soft dark:text-zinc-500">
                    RM
                  </span>
                  <p
                    class="tabular-price font-extrabold text-[17px] leading-none text-ink dark:text-white"
                  >
                    {{ card.price.toFixed(2) }}
                  </p>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
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
        </article>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from "~/composables/useCards";
import { cdnUrl } from "~/composables/useStorage";

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

// Short pill label that always fits on a tile. Ungraded labels in the
// constants list are written as "Near Mint (NM)", "Moderately Played (MP)",
// etc. — strip down to just the abbreviation in the parens. Graded labels
// like "PSA 10" are already short. Sealed becomes "SEALED".
const conditionLabel = (card: Card): string => {
  if (card.productType === "Graded") {
    const provider =
      card.gradingProvider === "Others"
        ? card.customGradingProvider
        : card.gradingProvider;
    return `${provider || ""} ${card.grade || ""}`.trim();
  }
  if (card.productType === "Sealed") return "SEALED";
  const m = (card.condition || "").match(/\(([^)]+)\)/);
  return m ? m[1] : card.condition || "";
};

// Tone modifier for the condition chip above the price — uses the
// chip-gold / chip-accent utility classes for graded / sealed and the
// default chip styling for ungraded.
const conditionTone = (card: Card): string => {
  if (card.productType === "Graded") return "chip-gold";
  if (card.productType === "Sealed") return "chip-accent";
  return "";
};
</script>
