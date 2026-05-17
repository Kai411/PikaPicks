export default defineNuxtRouteMiddleware((to) => {
  // Don't redirect if already on setup page
  if (to.path === "/profile/setup") return;

  const { user } = useAuth();
  const { isNewUser, loading } = useMyProfile();

  // Wait until auth and profile are loaded
  if (!user.value || loading.value) return;

  // Redirect new users to profile setup
  if (isNewUser.value) {
    return navigateTo("/profile/setup");
  }
});
