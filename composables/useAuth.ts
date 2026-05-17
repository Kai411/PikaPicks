import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { ref } from "vue";

const user = ref<User | null>(null);
const authLoading = ref(true);
let initialized = false;

export const useAuth = () => {
  const { app } = useFirebase();
  const auth = getAuth(app!);

  if (!initialized) {
    initialized = true;
    onAuthStateChanged(auth, (u) => {
      user.value = u;
      authLoading.value = false;
    });
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, authLoading, signInWithGoogle, signOut };
};
