import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";

// pending  → buyer placed order, seller hasn't confirmed
// confirmed → seller confirmed via WhatsApp (manual flow)
// paid     → reserved for future escrow flow (Stripe success)
// shipped  → seller dispatched (tracking optional)
// delivered → buyer confirmed receipt
// cancelled → either party cancelled before shipment
export type CompiledOrderStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type CompiledPaymentMethod = "manual" | "stripe";

export interface CompiledOrderItem {
  cardId: string;
  cardName: string;
  cardSet: string;
  condition: string;
  imageUrl: string;
  price: number;
  shippingWM: number;
  shippingEM: number;
}

export interface CompiledOrder {
  id: string;
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  sellerUid: string;
  sellerName: string;
  items: CompiledOrderItem[];
  // Sum of item prices.
  subtotal: number;
  // Max of items' shipping fees — one combined shipment.
  shippingWM: number;
  shippingEM: number;
  // Buyer-selected region; total is computed from this.
  region: "WM" | "EM";
  shipping: number;
  total: number;
  status: CompiledOrderStatus;
  paymentMethod: CompiledPaymentMethod;
  createdAt: number;
  confirmedAt?: number;
  paidAt?: number;
  shippedAt?: number;
  deliveredAt?: number;
  cancelledAt?: number;
  cancelReason?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  // Reserved for future escrow integration.
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  payoutStatus?: "pending" | "queued" | "processing" | "paid" | "failed";
  payoutEligibleAt?: number;
}

export interface CompiledOrderInputItem {
  cardId: string;
  cardName: string;
  cardSet: string;
  condition: string;
  imageUrl: string;
  price: number;
  shippingWM: number;
  shippingEM: number;
  sellerUid: string;
  sellerName: string;
}

const STATUS_LABEL: Record<CompiledOrderStatus, string> = {
  pending: "Awaiting Seller",
  confirmed: "Confirmed",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<CompiledOrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-zinc-400",
};

export const compiledOrderStatusLabel = (s: CompiledOrderStatus) =>
  STATUS_LABEL[s] ?? s;
export const compiledOrderStatusColor = (s: CompiledOrderStatus) =>
  STATUS_COLOR[s] ?? "";

const buyerCompiledOrders = ref<CompiledOrder[]>([]);
const sellerCompiledOrders = ref<CompiledOrder[]>([]);
const loadingBuyer = ref(false);
const loadingSeller = ref(false);
let buyerUnsub: Unsubscribe | null = null;
let sellerUnsub: Unsubscribe | null = null;

// Group input items by sellerUid → one CompiledOrder per seller.
export const groupItemsBySeller = (
  items: CompiledOrderInputItem[],
): Record<string, CompiledOrderInputItem[]> => {
  const groups: Record<string, CompiledOrderInputItem[]> = {};
  for (const item of items) {
    if (!groups[item.sellerUid]) groups[item.sellerUid] = [];
    groups[item.sellerUid].push(item);
  }
  return groups;
};

export const useCompiledOrders = () => {
  const { firestore } = useFirebase();
  const { user } = useAuth();

  // Note: sorted client-side so a single-field equality query is enough —
  // no composite Firestore index needed for (sellerUid|buyerUid + createdAt).
  const listenBuyerCompiledOrders = () => {
    if (!user.value || !firestore) return;
    buyerUnsub?.();
    loadingBuyer.value = true;
    const q = query(
      collection(firestore, "compiledOrders"),
      where("buyerUid", "==", user.value.uid),
    );
    buyerUnsub = onSnapshot(
      q,
      (snap) => {
        buyerCompiledOrders.value = snap.docs
          .map((d) => ({ ...d.data(), id: d.id }) as CompiledOrder)
          .sort((a, b) => b.createdAt - a.createdAt);
        loadingBuyer.value = false;
      },
      (err) => {
        console.error("[useCompiledOrders] buyer listener error:", err);
        loadingBuyer.value = false;
      },
    );
  };

  const listenSellerCompiledOrders = () => {
    if (!user.value || !firestore) return;
    sellerUnsub?.();
    loadingSeller.value = true;
    const q = query(
      collection(firestore, "compiledOrders"),
      where("sellerUid", "==", user.value.uid),
    );
    sellerUnsub = onSnapshot(
      q,
      (snap) => {
        sellerCompiledOrders.value = snap.docs
          .map((d) => ({ ...d.data(), id: d.id }) as CompiledOrder)
          .sort((a, b) => b.createdAt - a.createdAt);
        loadingSeller.value = false;
      },
      (err) => {
        console.error("[useCompiledOrders] seller listener error:", err);
        loadingSeller.value = false;
      },
    );
  };

  // Create one CompiledOrder per seller — or, if the buyer already has an
  // open (pending) order with that seller, append new items into it instead
  // of creating a duplicate. This is the "compile across sessions" behaviour
  // so a buyer can keep adding cards from the same seller until they're ready
  // to settle up via WhatsApp. Buyer name is captured from the auth profile
  // so the seller can recognise them.
  const createCompiledOrders = async (
    items: CompiledOrderInputItem[],
    region: "WM" | "EM",
    buyerDisplayName: string,
  ): Promise<CompiledOrder[]> => {
    if (!user.value || !firestore) throw new Error("Not authenticated");
    if (!items.length) return [];

    const groups = groupItemsBySeller(items);
    const results: CompiledOrder[] = [];

    for (const sellerUid of Object.keys(groups)) {
      const group = groups[sellerUid];
      const newItems: CompiledOrderItem[] = group.map((g) => ({
        cardId: g.cardId,
        cardName: g.cardName,
        cardSet: g.cardSet,
        condition: g.condition,
        imageUrl: g.imageUrl,
        price: g.price,
        shippingWM: g.shippingWM,
        shippingEM: g.shippingEM,
      }));

      // Look for an open (pending) order between this buyer and seller.
      // Query by buyerUid only (single-field, no composite index needed) and
      // filter the rest client-side.
      const existingQ = query(
        collection(firestore, "compiledOrders"),
        where("buyerUid", "==", user.value.uid),
      );
      const existingSnap = await getDocs(existingQ);
      const openOrder = existingSnap.docs
        .map((d) => ({ ...d.data(), id: d.id }) as CompiledOrder)
        .find((o) => o.sellerUid === sellerUid && o.status === "pending");

      if (openOrder) {
        // Merge: dedupe by cardId so adding the same card twice is a no-op.
        const existingCardIds = new Set(openOrder.items.map((i) => i.cardId));
        const toAdd = newItems.filter((i) => !existingCardIds.has(i.cardId));
        if (toAdd.length === 0) {
          results.push(openOrder);
          continue;
        }
        const mergedItems = [...openOrder.items, ...toAdd];
        const subtotal = mergedItems.reduce((s, i) => s + i.price, 0);
        const shippingWM = mergedItems.reduce(
          (m, i) => Math.max(m, i.shippingWM ?? 0),
          0,
        );
        const shippingEM = mergedItems.reduce(
          (m, i) => Math.max(m, i.shippingEM ?? 0),
          0,
        );
        // Preserve the region the original order was placed under — the
        // buyer chose it once and the seller already saw it on WhatsApp.
        const shipping = openOrder.region === "WM" ? shippingWM : shippingEM;
        const patch = {
          items: mergedItems,
          subtotal,
          shippingWM,
          shippingEM,
          shipping,
          total: subtotal + shipping,
        };
        await updateDoc(doc(firestore, "compiledOrders", openOrder.id), patch);
        results.push({ ...openOrder, ...patch });
        continue;
      }

      // No open order — create a new one.
      const ref = doc(collection(firestore, "compiledOrders"));
      const subtotal = newItems.reduce((s, i) => s + i.price, 0);
      const shippingWM = newItems.reduce(
        (m, i) => Math.max(m, i.shippingWM ?? 0),
        0,
      );
      const shippingEM = newItems.reduce(
        (m, i) => Math.max(m, i.shippingEM ?? 0),
        0,
      );
      const shipping = region === "WM" ? shippingWM : shippingEM;
      const order: CompiledOrder = {
        id: ref.id,
        buyerUid: user.value.uid,
        buyerName: buyerDisplayName || user.value.displayName || "Buyer",
        buyerEmail: user.value.email || "",
        sellerUid,
        sellerName: group[0].sellerName,
        items: newItems,
        subtotal,
        shippingWM,
        shippingEM,
        region,
        shipping,
        total: subtotal + shipping,
        status: "pending",
        paymentMethod: "manual",
        createdAt: Date.now(),
      };
      await setDoc(ref, order);
      results.push(order);
    }
    return results;
  };

  // Confirming an order locks in the sale — mark every card in the order as
  // sold so it disappears from the shop. We batch the order update and the
  // card updates so partial failures can't leave cards listed as both
  // "in an active order" and "for sale".
  const markConfirmed = async (orderId: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, "compiledOrders", orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return;
    const order = snap.data() as CompiledOrder;

    const batch = writeBatch(firestore);
    const now = Date.now();
    batch.update(orderRef, {
      status: "confirmed",
      confirmedAt: now,
    });
    for (const item of order.items) {
      batch.update(doc(firestore, "cards", item.cardId), {
        sold: true,
        soldAt: now,
      });
    }
    await batch.commit();
  };

  const markShipped = async (
    orderId: string,
    trackingNumber?: string,
    carrier?: string,
  ) => {
    if (!firestore) return;
    const patch: Record<string, unknown> = {
      status: "shipped",
      shippedAt: Date.now(),
    };
    if (trackingNumber) patch.trackingNumber = trackingNumber;
    if (carrier) patch.shippingCarrier = carrier;
    await updateDoc(doc(firestore, "compiledOrders", orderId), patch);
  };

  const markDelivered = async (orderId: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, "compiledOrders", orderId), {
      status: "delivered",
      deliveredAt: Date.now(),
    });
  };

  const cancelOrder = async (orderId: string, reason?: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, "compiledOrders", orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return;
    const order = snap.data() as CompiledOrder;

    const batch = writeBatch(firestore);
    batch.update(orderRef, {
      status: "cancelled",
      cancelledAt: Date.now(),
      cancelReason: reason || "",
    });
    // If cards were marked sold during confirm/paid, list them again.
    // Pending orders never marked cards; shipped/delivered are past the
    // point where automatic rollback is safe.
    if (order.status === "confirmed" || order.status === "paid") {
      for (const item of order.items) {
        batch.update(doc(firestore, "cards", item.cardId), {
          sold: false,
          soldAt: null,
        });
      }
    }
    await batch.commit();
  };

  const updateRegion = async (orderId: string, region: "WM" | "EM") => {
    if (!firestore) return;
    const snap = await getDoc(doc(firestore, "compiledOrders", orderId));
    if (!snap.exists()) return;
    const order = snap.data() as CompiledOrder;
    const shipping = region === "WM" ? order.shippingWM : order.shippingEM;
    await updateDoc(doc(firestore, "compiledOrders", orderId), {
      region,
      shipping,
      total: order.subtotal + shipping,
    });
  };

  const getCompiledOrder = async (
    orderId: string,
  ): Promise<CompiledOrder | null> => {
    if (!firestore) return null;
    const snap = await getDoc(doc(firestore, "compiledOrders", orderId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as CompiledOrder;
  };

  return {
    buyerCompiledOrders,
    sellerCompiledOrders,
    loadingBuyer,
    loadingSeller,
    listenBuyerCompiledOrders,
    listenSellerCompiledOrders,
    createCompiledOrders,
    markConfirmed,
    markShipped,
    markDelivered,
    cancelOrder,
    updateRegion,
    getCompiledOrder,
  };
};
