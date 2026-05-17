import {
  getAuth,
  PhoneAuthProvider,
  linkWithCredential,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

export const usePhoneVerification = () => {
  const { app } = useFirebase();
  const { user } = useAuth();
  const { updateProfile } = useMyProfile();

  const sending = ref(false);
  const verifying = ref(false);
  const error = ref("");
  const codeSent = ref(false);

  const initRecaptcha = (buttonId: string) => {
    const auth = getAuth(app!);
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: "invisible",
      });
    }
  };

  const sendCode = async (phoneNumber: string, buttonId: string) => {
    if (!user.value) throw new Error("Not authenticated");

    sending.value = true;
    error.value = "";

    try {
      const auth = getAuth(app!);
      initRecaptcha(buttonId);

      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier!,
      );

      // Store verificationId for later use
      confirmationResult = {
        verificationId,
        confirm: async (code: string) => {
          const credential = PhoneAuthProvider.credential(verificationId, code);
          return await linkWithCredential(user.value!, credential);
        },
      } as any;

      codeSent.value = true;
    } catch (e: any) {
      // If phone is already linked, try a different approach
      if (e.code === "auth/provider-already-linked") {
        // Already verified
        await updateProfile({
          whatsappVerified: true,
          whatsappNumber: phoneNumber,
        });
        codeSent.value = false;
        error.value = "";
        return "already-verified";
      }
      error.value = getErrorMessage(e.code);
      // Reset recaptcha on error
      recaptchaVerifier = null;
    } finally {
      sending.value = false;
    }
  };

  const verifyCode = async (
    code: string,
    phoneNumber: string,
  ): Promise<boolean> => {
    if (!confirmationResult) {
      error.value = "No verification in progress. Send a code first.";
      return false;
    }

    verifying.value = true;
    error.value = "";

    try {
      await confirmationResult.confirm(code);

      // Mark profile as verified
      await updateProfile({
        whatsappNumber: phoneNumber,
        whatsappVerified: true,
      });

      // Cleanup
      confirmationResult = null;
      recaptchaVerifier = null;

      return true;
    } catch (e: any) {
      if (e.code === "auth/invalid-verification-code") {
        error.value = "Invalid code. Please try again.";
      } else if (e.code === "auth/code-expired") {
        error.value = "Code expired. Please request a new one.";
        codeSent.value = false;
      } else if (e.code === "auth/provider-already-linked") {
        // Phone already linked — just mark as verified
        await updateProfile({
          whatsappVerified: true,
          whatsappNumber: phoneNumber,
        });
        return true;
      } else {
        error.value = getErrorMessage(e.code);
      }
      return false;
    } finally {
      verifying.value = false;
    }
  };

  const reset = () => {
    codeSent.value = false;
    error.value = "";
    confirmationResult = null;
    recaptchaVerifier = null;
  };

  return { sendCode, verifyCode, reset, sending, verifying, error, codeSent };
};

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-phone-number":
      return "Invalid phone number. Use format: +60123456789";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/quota-exceeded":
      return "SMS quota exceeded. Try again tomorrow.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA failed. Please try again.";
    case "auth/provider-already-linked":
      return "This phone is already linked to your account.";
    case "auth/credential-already-in-use":
      return "This phone number is already used by another account.";
    default:
      return `Verification failed (${code}). Please try again.`;
  }
}
