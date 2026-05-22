# TCGo Roadmap

Last updated: 2026-05-21. Living doc — edit as priorities shift.

## Competitive landscape

| Platform | Positioning | Killer feature |
|----------|-------------|----------------|
| [Collektr](https://collektr.co/) | "Asia's premier live bidding platform" | Livestream auctions, PSA grading submission, multi-category (TCG + Funko + sneakers + watches) |
| [Hoopi](https://www.hoopi.xyz/) | TCG-only, gamification-heavy | Live Breaking (live box openings), Hoopi Coins currency, Leaderboards, Mystery boxes |
| [Acorn TCG](https://www.acorntcg.com/) / [Dex](https://apps.apple.com/us/app/dex-for-tcg-collectors/id1555489854) / [Omi](https://tcgscanneromi.com/) | Collection trackers | Scan-to-own (not scan-to-sell), set completion tracking |
| [TCGplayer](https://play.google.com/store/apps/details?id=com.tcgplayer.tcgplayer) | Market data + marketplace (US) | Market price reference, watchlists, historical pricing |

## TCGo's existing moats (don't lose these)

- **AI-powered scanner with multi-field auto-fill** — rarity / variant / edition / artist / language all extracted from a photo. Competitors require manual entry.
- **Japanese card support** — language detection, JP set number preserved, English name translation.
- **Multi-TCG support** — Pokémon, One Piece, Digimon, MTG, Yu-Gi-Oh!, DBS, Lorcana, Other. Filter pills on shop.
- **WhatsApp-native seller contact** — lower friction in MY/SG market than in-app chat alone.
- **Membership tier system** — free 20 scans/month, premium unlimited. Schema + UI already shipped; manual flip via Firestore for now.
- **PWA-installable** — no app store needed.

---

## Tier 1 — Competitive differentiators

These close the gap with Collektr / Hoopi where they're winning.

### 1. Wishlist / want-list with alerts
- Buyer: "I'm looking for Charizard ex 215/197 under RM 200"
- When a matching listing goes live → push notification
- Filterable by name, set, condition floor, max price, language
- **Why first**: highest engagement multiplier per line of code. Pure data + push. Closes the discovery loop.

### 2. Collection tracker (scan-to-own)
- New surface: "My Collection" — cards you own, not listed
- Same scanner pipeline; just routes to a personal inventory instead of a draft listing
- Show total collection value (from market reference, see #4)
- Set completion bars ("42/189 Scarlet & Violet")
- Want-list and Collection share data with Marketplace listings (sell from your collection in one tap)
- **Why second**: turns scanner from a sell-tool into an always-open app. Big retention play.

### 3. Live breaks / live auctions
- WebRTC stream + real-time chat + bidding overlay
- Sellers host live box openings, viewers chime in / bid on pulls
- Could lean on Cloudflare Stream or Mux for video infra
- **Why deferred**: 3–4 week build (streaming, moderation, payments-during-live). Make-or-break is having seller/streamer pipeline, not tech. Revisit when 2 sellers are clamoring for it.

### 4. Market price reference per card
- Show "Market value: RM 80–110" next to a listing's asking price
- Source: [TCGdex](https://tcgdex.dev/) (free, multilingual, JP support) or [JustTCG](https://justtcg.com/) (commercial, fuller JP)
- Anchors both buyers and sellers — and adds collection valuation for #2
- **Effort**: 1 day if TCGdex is good enough, 1 week if we need JustTCG with billing

---

## Tier 2 — Ergonomic wins

### 5. In-app messaging
- Native chat between buyer/seller (currently everything goes to WhatsApp)
- Preserves history, enables disputes, future-proofs escrow / payments
- WhatsApp deep-link stays as a fallback
- **Why**: trust + operational visibility. Today we can't see communication for disputes.

### 6. Seller ratings & reviews
- Buyer rates after a completed sale (1–5 stars + optional text)
- Shows on seller profile + above the "Contact Seller" CTA
- Trust score is internal; reviews are public and human
- **Note**: needs lifecycle status (active → reserved → sold → completed) to know when to ask for a review. The `status` enum is already in the schema; the transitions aren't yet.

### 7. Set completion tracking
- Tile on collection / profile: "Sword & Shield 42/189", "Surging Sparks 12/191", etc.
- Reuses set name + number data we already capture
- Pairs with #2 (collection tracker) — both share the underlying inventory
- Discovery hook: tap a set → see incomplete cards → see what's listed

### 8. Native push notifications
- Outbid on an auction → push
- Wishlist match → push (see #1)
- New message → push (see #5)
- Web Push API + service worker is already in place (PWA); just need permission + payload routing.

### 9. Trade offers (peer-to-peer)
- "Offer my X for your Y" with optional cash on top
- Pre-internet TCG culture in MY/SG is trade-heavy — this taps real behavior
- Sellers can accept / counter / reject
- Needs: trade-request entity, in-app chat (#5) for negotiation

### 10. Bundle / multi-card lots
- One listing, multiple cards, single shipping cost
- Buyer browses bundle contents before contacting
- Sellers asked for this everywhere I've seen
- **Effort**: small — schema supports it already (imageUrls is an array; just need a `bundleItems[]` field or treat each card in the bundle as inventory under one listing)

---

## Tier 3 — Nice-to-have / future

### 11. Stories
- 24-hour "new arrivals" reels from sellers
- Instagram-style discovery, drives habit
- Useful once we have 50+ active sellers

### 12. Loyalty coins
- Earn points on completed sales / purchases
- Redeem for fee discounts, premium upgrade trial, featured-listing slots
- Hoopi's model is "Hoopi Coins + Hoopi Mall" — could be a margin lever later

### 13. PSA / CGC submission service
- Take a cut of the grading fee, handle MY → US logistics
- Collektr offers this; substantial revenue lever for high-end collectors
- High operational lift — leave until volume justifies it

### 14. AR card preview
- Tilt phone to see the holo/foil effect on a card
- Gimmick but viral on social

### 15. Pre-orders / group buys
- Pool buyers to hit bulk pricing on sealed product
- Common pattern in MY/SG via Facebook groups; we can formalize it

### 16. Grading recommendation
- "This Charizard at NM condition might be worth grading — PSA 9 estimate RM 1,200, PSA 10 estimate RM 4,500"
- Uses market reference (#4) + condition heuristic
- Up-sells the grading service (#13)

---

## Open schema fields already shipped (no UI yet)

These exist on `Card` + `Auction` interfaces but don't have user-facing surfaces. Ship the surfaces when feature lands:

- `era` — auto-derive from set, surface as filter
- `tags[]` — free-form, becomes useful with search + wishlist (#1)
- `defects[]` — condition transparency
- `certNumber` — graded slabs (#13 grading service)
- `viewCount` — engagement metric for sellers
- `status` lifecycle — needed for reviews (#6) and reserved-listings flow

---

## Engineering hygiene (background work)

- Move `nuxt: "3.13.2"` pin → unblock Nuxt 3.21+ when the vite-node IPC bug is fixed
- Replace stripped `bids` on auctions list with a Firestore-side aggregate (current `bidCount` is computed on each listener tick)
- TCG type filter on `/auctions` page (mirror of shop filter)
- Auction page filter pills for rarity / variant
- Admin tool to flip user tier (free ↔ premium) without Firebase Console
