import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, type UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

/**
 * Inicia sesión con Google usando popup (funciona aunque authDomain sea distinto
 * del dominio de Netlify). Si el navegador bloquea el popup, cae a redirect.
 * Devuelve null si se usó redirect (el flujo continúa en getRedirectResult)
 * o si el usuario cerró el popup.
 */
export async function signInWithGoogle(): Promise<UserCredential | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    return await signInWithPopup(auth, provider);
  } catch (err: any) {
    const code: string = err?.code ?? "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return null;
    }
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

/** Mensaje legible para errores comunes de Firebase Auth con Google. */
export function googleErrorMessage(err: any): string {
  switch (err?.code) {
    case "auth/unauthorized-domain":
      return "Este dominio no está autorizado en Firebase. Agrégalo en Authentication > Settings > Authorized domains.";
    case "auth/account-exists-with-different-credential":
      return "Ya existe una cuenta con este correo. Entra con correo y contraseña.";
    case "auth/network-request-failed":
      return "Sin conexión. Revisa tu internet e inténtalo de nuevo.";
    default:
      return "Error al iniciar sesión con Google.";
  }
}
