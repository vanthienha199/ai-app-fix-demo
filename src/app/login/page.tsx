"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [pw, setPw] = useState("");
  const router = useRouter();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === "pawsadmin2024") {
      localStorage.setItem("auth", "true");
      router.push("/dashboard");
    } else {
      alert("Wrong password");
    }
  }
  return (
    <form onSubmit={submit} className="mt-20 w-[400px] mx-auto bg-white p-6 rounded-xl shadow space-y-3">
      <h1 className="text-2xl font-bold">Staff login</h1>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full border rounded p-2" placeholder="Password" />
      <button className="w-full bg-blue-600 text-white rounded p-2">Log in</button>
    </form>
  );
}
