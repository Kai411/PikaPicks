import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  increment,
  type Unsubscribe,
} from "firebase/firestore";
import { ref } from "vue";

export interface Card {
  id: string;
  cardName: string;
  cardSet: string;
  cardNumber: string;
  productType: string;
  condition: string;
  gradingProvider: string;
  grade: string;
  customGradingProvider: string;
  description: string;
  price: number;
  shippingWM: number;
  shippingEM: number;
  imageUrl: string;
  imageUrls: string[];
  seller: string;
  sellerUid: string;
  createdAt: number;
  sold: boolean;
  interestedCount: number;
  favouriteCount: number;
}

// Module-level singleton. Previously each call opened a new Firestore
// listener — five pages called useCards(), so five identical subscriptions
// were active any time the user navigated through the app.
const cards = ref<Card[]>([]);
const loading = ref(true);
let initialized = false;
let unsubscribe: Unsubscribe | null = null;

const initialize = () => {
  if (initialized) return;
  initialized = true;
  const { firestore } = useFirebase();
  const cardsCollection = collection(firestore!, "cards");
  const q = query(cardsCollection, orderBy("createdAt", "desc"));
  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      cards.value = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<Card, "id">),
        id: d.id,
      }));
      loading.value = false;
    },
    (error) => {
      console.error("[useCards] listener error:", error);
      loading.value = false;
    },
  );
};

export const useCards = () => {
  const { firestore } = useFirebase();
  initialize();

  const cardsCollection = collection(firestore!, "cards");

  const createCard = async (
    card: Omit<
      Card,
      "id" | "createdAt" | "sold" | "interestedCount" | "favouriteCount"
    >,
  ) => {
    const newCard = {
      ...card,
      createdAt: Date.now(),
      sold: false,
      interestedCount: 0,
      favouriteCount: 0,
    };
    const docRef = await addDoc(cardsCollection, newCard);
    return docRef.id;
  };

  const markAsSold = async (cardId: string) => {
    const cardDoc = doc(firestore!, "cards", cardId);
    await updateDoc(cardDoc, { sold: true });
  };

  const markInterested = async (cardId: string) => {
    const cardDoc = doc(firestore!, "cards", cardId);
    await updateDoc(cardDoc, { interestedCount: increment(1) });
  };

  return { cards, loading, createCard, markAsSold, markInterested };
};
