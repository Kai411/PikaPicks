import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { effectScope, ref, watch } from "vue";

export interface Favourite {
  id: string;
  userId: string;
  itemId: string;
  itemType: "card" | "auction";
  createdAt: number;
}

// Module-level singleton: every call to useFavourites() shares this ref
// instead of opening its own subscription. With many FavouriteButton
// instances on a page (one per card tile), this was the worst offender —
// 50 cards meant 50 identical Firestore listeners.
const favourites = ref<Favourite[]>([]);
let initialized = false;
let unsubscribe: Unsubscribe | null = null;
let currentUserId: string | null = null;

export const useFavourites = () => {
  const { firestore } = useFirebase();
  const { user } = useAuth();

  if (!initialized) {
    initialized = true;
    // Detached effect scope so the watch outlives the component that first
    // called this composable. Otherwise the watch is bound to that
    // component's setup and dies on unmount.
    effectScope(true).run(() => {
      watch(
        user,
        (u) => {
          if ((u?.uid || null) === currentUserId) return;
          currentUserId = u?.uid || null;
          unsubscribe?.();
          unsubscribe = null;
          if (u) {
            const q = query(
              collection(firestore!, "favourites"),
              where("userId", "==", u.uid),
            );
            unsubscribe = onSnapshot(
              q,
              (snapshot) => {
                favourites.value = snapshot.docs.map((d) => ({
                  ...(d.data() as Omit<Favourite, "id">),
                  id: d.id,
                }));
              },
              (error) => {
                console.error("[useFavourites] listener error:", error);
              },
            );
          } else {
            favourites.value = [];
          }
        },
        { immediate: true },
      );
    });
  }

  const isFavourited = (itemId: string): boolean =>
    favourites.value.some((f) => f.itemId === itemId);

  const toggleFavourite = async (
    itemId: string,
    itemType: "card" | "auction",
  ) => {
    if (!user.value) return;

    const existing = favourites.value.find((f) => f.itemId === itemId);
    const itemCollection = itemType === "card" ? "cards" : "auctions";

    if (existing) {
      await deleteDoc(doc(firestore!, "favourites", existing.id));
      try {
        await updateDoc(doc(firestore!, itemCollection, itemId), {
          favouriteCount: increment(-1),
        });
      } catch {}
    } else {
      const favId = `${user.value.uid}_${itemId}`;
      await setDoc(doc(firestore!, "favourites", favId), {
        userId: user.value.uid,
        itemId,
        itemType,
        createdAt: Date.now(),
      });
      try {
        await updateDoc(doc(firestore!, itemCollection, itemId), {
          favouriteCount: increment(1),
        });
      } catch {}
    }
  };

  const getFavouriteCards = () => favourites.value.filter((f) => f.itemType === "card");
  const getFavouriteAuctions = () =>
    favourites.value.filter((f) => f.itemType === "auction");

  return {
    favourites,
    isFavourited,
    toggleFavourite,
    getFavouriteCards,
    getFavouriteAuctions,
  };
};

// Fetch another user's favourites (per-uid — stays per-call by design).
export const useUserFavourites = (uid: string) => {
  const { firestore } = useFirebase();
  const userFavourites = ref<Favourite[]>([]);
  const loading = ref(true);

  const q = query(
    collection(firestore!, "favourites"),
    where("userId", "==", uid),
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      userFavourites.value = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<Favourite, "id">),
        id: d.id,
      }));
      loading.value = false;
    },
    () => {
      loading.value = false;
    },
  );

  onUnmounted(() => {
    unsubscribe();
  });

  return { userFavourites, loading };
};
