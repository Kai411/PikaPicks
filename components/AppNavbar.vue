<template>
  <nav class="bg-white border-b border-gray-200 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <NuxtLink to="/" class="text-xl font-bold text-pokemon-red">
          Cards &amp; Coins
        </NuxtLink>
        <div class="flex items-center gap-5">
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            active-class="!text-pokemon-red"
          >
            Shop
          </NuxtLink>
          <NuxtLink
            to="/auctions"
            class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            active-class="!text-pokemon-red"
          >
            Auctions
          </NuxtLink>
          <NuxtLink
            v-if="user"
            to="/dashboard/seller"
            class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            active-class="!text-pokemon-red"
          >
            My Listings
          </NuxtLink>
          <NuxtLink
            v-if="user"
            to="/dashboard/buyer"
            class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            active-class="!text-pokemon-red"
          >
            My Bids
          </NuxtLink>

          <!-- Cart -->
          <NuxtLink
            to="/cart"
            class="relative text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 bg-pokemon-red text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>

          <!-- Sell buttons -->
          <div v-if="user" class="flex gap-2">
            <NuxtLink
              to="/cards/create"
              class="bg-pokemon-blue text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Sell Card
            </NuxtLink>
            <NuxtLink
              to="/auctions/create"
              class="bg-pokemon-red text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Auction
            </NuxtLink>
          </div>

          <!-- Auth -->
          <div
            v-if="authLoading"
            class="w-8 h-8 rounded-full bg-gray-200 animate-pulse"
          ></div>
          <div v-else-if="user" class="flex items-center gap-2">
            <NuxtLink
              :to="`/profile/${user.uid}`"
              class="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                :src="user.photoURL || ''"
                :alt="user.displayName || 'User'"
                class="w-8 h-8 rounded-full border border-gray-200"
              />
            </NuxtLink>
            <button
              @click="signOut"
              class="text-gray-400 hover:text-gray-600 text-xs"
            >
              Logout
            </button>
          </div>
          <button
            v-else
            @click="signInWithGoogle"
            class="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { user, authLoading, signInWithGoogle, signOut } = useAuth();
const { cartCount } = useCart();
</script>
