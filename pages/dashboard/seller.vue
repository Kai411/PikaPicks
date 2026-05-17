<template>
  <div>
    <div v-if="!user" class="text-center py-12">
      <p class="text-gray-500 text-lg mb-4">Sign in to view your listings.</p>
      <button
        @click="signInWithGoogle"
        class="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
      >
        Sign in with Google
      </button>
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold mb-6">My Listings</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-6 w-6 border-b-2 border-pokemon-red"
        ></div>
      </div>

      <template v-else>
        <!-- Active Auctions -->
        <section class="mb-10">
          <h2 class="text-lg font-semibold mb-4 text-gray-700">
            Active ({{ activeAuctions.length }})
          </h2>
          <div
            v-if="activeAuctions.length === 0"
            class="text-gray-400 text-sm py-4"
          >
            No active listings.
            <NuxtLink
              to="/auctions/create"
              class="text-pokemon-red hover:underline"
              >Create one?</NuxtLink
            >
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="auction in activeAuctions"
              :key="auction.id"
              class="bg-white rounded-xl p-4 border border-gray-200 flex gap-4 items-center"
            >
              <div
                class="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  v-if="auction.imageUrls?.length || auction.imageUrl"
                  :src="auction.imageUrls?.[0] || auction.imageUrl"
                  :alt="auction.cardName"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <NuxtLink
                  :to="`/auctions/${auction.id}`"
                  class="font-semibold text-sm hover:text-pokemon-red transition-colors truncate block"
                >
                  {{ auction.cardName }}
                </NuxtLink>
                <p class="text-xs text-gray-500">{{ auction.title }}</p>
                <div class="flex gap-3 mt-1 text-xs">
                  <span class="text-pokemon-red font-medium"
                    >RM {{ auction.currentPrice.toFixed(2) }}</span
                  >
                  <span class="text-gray-400"
                    >{{ bidCount(auction) }} bid(s)</span
                  >
                  <span class="text-gray-500"
                    >Ends {{ formatTimeLeft(auction.endsAt) }}</span
                  >
                </div>
              </div>
              <NuxtLink
                :to="`/auctions/${auction.id}`"
                class="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-600 transition-colors"
              >
                View
              </NuxtLink>
            </div>
          </div>
        </section>

        <!-- Ended Auctions -->
        <section>
          <h2 class="text-lg font-semibold mb-4 text-gray-700">
            Ended ({{ endedAuctions.length }})
          </h2>
          <div
            v-if="endedAuctions.length === 0"
            class="text-gray-400 text-sm py-4"
          >
            No ended listings yet.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="auction in endedAuctions"
              :key="auction.id"
              class="bg-white rounded-xl p-4 border border-gray-200 flex gap-4 items-center"
            >
              <div
                class="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  v-if="auction.imageUrls?.length || auction.imageUrl"
                  :src="auction.imageUrls?.[0] || auction.imageUrl"
                  :alt="auction.cardName"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <NuxtLink
                  :to="`/auctions/${auction.id}`"
                  class="font-semibold text-sm hover:text-pokemon-red transition-colors truncate block"
                >
                  {{ auction.cardName }}
                </NuxtLink>
                <p class="text-xs text-gray-500">{{ auction.title }}</p>
                <div class="flex gap-3 mt-1 text-xs">
                  <span class="text-pokemon-red font-medium"
                    >RM {{ auction.currentPrice.toFixed(2) }}</span
                  >
                  <span v-if="getWinner(auction)" class="text-green-600">
                    Won by: {{ getWinner(auction)!.bidder }}
                  </span>
                  <span v-else class="text-gray-400">No bids</span>
                </div>
              </div>
              <NuxtLink
                :to="`/auctions/${auction.id}`"
                class="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-600 transition-colors"
              >
                Details
              </NuxtLink>
            </div>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Auction, Bid } from "~/composables/useAuctions";

const { user, signInWithGoogle } = useAuth();
const { auctions, loading } = useAuctions();

const myAuctions = computed(() =>
  auctions.value.filter((a) => a.sellerUid === user.value?.uid),
);

const activeAuctions = computed(() =>
  myAuctions.value
    .filter((a) => a.endsAt > Date.now())
    .sort((a, b) => a.endsAt - b.endsAt),
);

const endedAuctions = computed(() =>
  myAuctions.value
    .filter((a) => a.endsAt <= Date.now())
    .sort((a, b) => b.endsAt - a.endsAt),
);

const bidCount = (auction: Auction) => Object.keys(auction.bids || {}).length;

const getWinner = (auction: Auction): Bid | null => {
  if (!auction.bids) return null;
  const sorted = Object.values(auction.bids).sort(
    (a, b) => b.amount - a.amount,
  );
  return sorted[0] || null;
};

const formatTimeLeft = (endsAt: number) => {
  const diff = endsAt - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `in ${days}d ${hours % 24}h`;
  }
  return `in ${hours}h ${minutes}m`;
};
</script>
