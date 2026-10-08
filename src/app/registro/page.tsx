"use client";

import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { BigButton } from "@/components/ui/BigButton";
import { Zap } from "lucide-react";

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function initUser(token: string) {
    await fetch("/api/subscription", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push("/app");
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return setError("Debes aceptar los términos para continuar.");
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      await initUser(token);
    } catch (err: any) {
      setError(err.message.includes("email-already-in-use") ? "El correo ya está registrado." : "Error al registrarse.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!accepted) return setError("Debes aceptar los términos para continuar.");
    setLoading(true);
    setError("");
    try {
      const p = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, p);
      const token = await cred.user.getIdToken();
      await initUser(token);
    } catch {
      setError("Error con Google.");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-5 py-8">
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
          <Zap size={32} />
        </span>
        <h1 className="text-2xl font-extrabold text-navy">Crear mi cuenta</h1>
        <p className="text-muted">15 días gratis, sin tarjeta.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input
          type="checkbox"
          id="legal"
          className="mt-1 h-5 w-5 rounded border-gray-300 text-navy focus:ring-navy"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <label htmlFor="legal" className="text-sm text-muted">
          Acepto los{" "}
          <Link href="/terminos" className="text-navy underline">Términos de Servicio</Link> y la{" "}
          <Link href="/privacidad" className="text-navy underline">Política de Privacidad</Link>.
        </label>
      </div>

      {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

      <form onSubmit={handleEmail} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          required
          className="h-14 rounded-2xl border-2 border-gray-200 px-4 text-lg outline-none focus:border-navy"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña (mínimo 6 letras)"
          required
          minLength={6}
          className="h-14 rounded-2xl border-2 border-gray-200 px-4 text-lg outline-none focus:border-navy"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <BigButton type="submit" disabled={loading}>Registrarme con correo</BigButton>
      </form>

      <div className="relative text-center">
        <span className="bg-surface px-4 text-sm text-muted">O también</span>
        <div className="absolute top-1/2 -z-10 w-full border-t-2 border-gray-200" />
      </div>

      <BigButton variant="ghost" onClick={handleGoogle} disabled={loading}>Continuar con Google</BigButton>
      <Link href="/login" className="text-center font-semibold text-navy underline">Ya tengo cuenta</Link>
    </main>
  );
}
