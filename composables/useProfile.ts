import { ref as dbRef, onValue, set, get } from "firebase/database";
import { ref, onUnmounted } from "vue";

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  customName: string;
  createdAt: number;
}

export const useProfile = (uid?: string) => {
  const { db } = useFirebase();
  const profile = ref<UserProfile | null>(null);
  const loading = ref(true);

  let unsubscribe: (() => void) | null = null;

  const listen = (targetUid: string) => {
    loading.value = true;
    const profileRef = dbRef(db!, `users/${targetUid}`);
    unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        profile.value = { ...data, uid: targetUid };
      } else {
        profile.value = null;
      }
      loading.value = false;
    });
  };

  if (uid) {
    listen(uid);
  }

  onUnmounted(() => {
    unsubscribe?.();
  });

  return { profile, loading, listen };
};

export const useMyProfile = () => {
  const { db } = useFirebase();
  const { user } = useAuth();
  const profile = ref<UserProfile | null>(null);
  const loading = ref(true);

  let unsubscribe: (() => void) | null = null;

  watch(
    user,
    (u) => {
      if (u) {
        const profileRef = dbRef(db!, `users/${u.uid}`);
        unsubscribe = onValue(profileRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            profile.value = { ...data, uid: u.uid };
          } else {
            // Auto-create profile on first sign-in
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || "Anonymous",
              photoURL: u.photoURL || "",
              customName: u.displayName || "Anonymous",
              createdAt: Date.now(),
            };
            set(profileRef, newProfile);
            profile.value = newProfile;
          }
          loading.value = false;
        });
      } else {
        profile.value = null;
        loading.value = false;
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    unsubscribe?.();
  });

  const updateCustomName = async (newName: string) => {
    if (!user.value) return;
    const profileRef = dbRef(db!, `users/${user.value.uid}`);
    await set(profileRef, {
      ...profile.value,
      customName: newName,
    });
  };

  return { profile, loading, updateCustomName };
};
