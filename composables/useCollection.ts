import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { effectScope, ref, watch } from "vue";

export interface CollectionCard {
  id: string;
  ownerUid: string;
  cardName: string;
  cardSet: string;
  cardNumber: string;
  rarity: string;
  imageUrl: string;
  tcgApiId: string;
  scannedImageUrl: string;
  createdAt: number;
}

// Module-level singleton for the current user's personal collection.
const cards = ref<CollectionCard[]>([]);
const loading = ref(true);
let initialized = false;
let unsubscribe: Unsubscribe | null = null;
let currentUserId: string | null = null;

export const useCollection = () => {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const collectionRef = collection(firestore!, "userCollection");

  if (!initialized) {
    initialized = true;
    // Detached effect scope keeps the watch alive across navigations.
    effectScope(true).run(() => {
    watch(
      user,
      (u) => {
        if ((u?.uid || null) === currentUserId) return;
        currentUserId = u?.uid || null;
        unsubscribe?.();
        unsubscribe = null;
        if (u) {
          // Single-field where() with no orderBy avoids needing a composite
          // index in Firestore. Sorting happens client-side below.
          const q = query(collectionRef, where("ownerUid", "==", u.uid));
          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              cards.value = snapshot.docs
                .map((d) => ({
                  ...(d.data() as Omit<CollectionCard, "id">),
                  id: d.id,
                }))
                .sort((a, b) => b.createdAt - a.createdAt);
              loading.value = false;
            },
            (error) => {
              // Most likely cause: Firestore security rules blocking reads
              // on userCollection for this user.
              console.error("[useCollection] snapshot error:", error);
              loading.value = false;
            },
          );
        } else {
          cards.value = [];
          loading.value = false;
        }
      },
      { immediate: true },
    );
    });
  }

  const addCard = async (
    card: Omit<CollectionCard, "id" | "ownerUid" | "createdAt">,
  ) => {
    if (!user.value) throw new Error("Must be signed in");
    try {
      const docRef = await addDoc(collectionRef, {
        ...card,
        ownerUid: user.value.uid,
        createdAt: Date.now(),
      });
      console.log("[useCollection] added card:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("[useCollection] addCard failed:", error);
      throw error;
    }
  };

  const removeCard = async (cardId: string) => {
    await deleteDoc(doc(firestore!, "userCollection", cardId));
  };

  return { cards, loading, addCard, removeCard };
};
