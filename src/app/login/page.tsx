"use client";

import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { BigButton } from "@/components/ui/BigButton";
import { Zap } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/app");
    } catch {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/app");
    } catch {
      setError("Error al iniciar sesión con Google.");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-5 py-8">
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
          <Zap size={32} />
        </span>
        <h1 className="text-2xl font-extrabold text-navy">Entrar a Press</h1>
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
          placeholder="Contraseña"
          required
          className="h-14 rounded-2xl border-2 border-gray-200 px-4 text-lg outline-none focus:border-navy"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <BigButton type="submit" disabled={loading}>Entrar</BigButton>
      </form>

      <div className="relative text-center">
        <span className="bg-surface px-4 text-sm text-muted">O también</span>
        <div className="absolute top-1/2 -z-10 w-full border-t-2 border-gray-200" />
      </div>

      <BigButton variant="ghost" onClick={handleGoogle} disabled={loading}>Entrar con Google</BigButton>
      <Link href="/registro" className="text-center font-semibold text-navy underline">No tengo cuenta todavía</Link>
    </main>
  );
}
