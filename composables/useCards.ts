import { ref as dbRef, push, onValue, update, remove } from "firebase/database";
import { ref, onUnmounted } from "vue";

export interface Card {
  id: string;
  cardName: string;
  cardSet: string;
  condition: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imageUrls: string[];
  seller: string;
  sellerUid: string;
  createdAt: number;
  sold: boolean;
}

export const useCards = () => {
  const { db } = useFirebase();
  const cards = ref<Card[]>([]);
  const loading = ref(true);

  const cardsRef = dbRef(db!, "cards");

  const unsubscribe = onValue(cardsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      cards.value = Object.entries(data).map(([id, card]) => ({
        ...(card as Omit<Card, "id">),
        id,
      }));
    } else {
      cards.value = [];
    }
    loading.value = false;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  const createCard = async (card: Omit<Card, "id" | "createdAt" | "sold">) => {
    const newCard = {
      ...card,
      createdAt: Date.now(),
      sold: false,
    };
    const result = await push(cardsRef, newCard);
    return result.key;
  };

  const markAsSold = async (cardId: string) => {
    const cardRef = dbRef(db!, `cards/${cardId}`);
    await update(cardRef, { sold: true });
  };

  return { cards, loading, createCard, markAsSold };
};
