"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth-errors";
import { initialState, parseState, type State } from "@/lib/domain";

type Props = {
  state: State;
  onIdentity: (id: string | null, data: State) => void;
  onLoading: (loading: boolean) => void;
};

export default function AccountPanel({ state, onIdentity, onLoading }: Props) {
  const [open, setOpen] = useState(false);
  const [signup, setSignup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const callbacks = useRef({ onIdentity, onLoading });
  callbacks.current = { onIdentity, onLoading };
  const identity = useRef<string | null>(null);
  const generation = useRef(0);
  const supabase = getSupabase();

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    async function restore(next: User | null) {
      if (!active || identity.current === next?.id) return;
      const token = ++generation.current;
      identity.current = next?.id ?? null;
      setUser(next); setLoaded(false); setRevision(null);
      callbacks.current.onLoading(true);
      callbacks.current.onIdentity(next?.id ?? null, structuredClone(initialState));
      try {
        let data = structuredClone(initialState);
        if (next) {
          const result = await supabase!.from("workspaces").select("data,revision").eq("user_id", next.id).maybeSingle();
          if (result.error) throw result.error;
          if (result.data) {
            const parsed = parseState(JSON.stringify(result.data.data));
            if (!parsed) throw new Error("Data akun belum dapat dibaca. Data di server tetap aman.");
            data = parsed;
            if (active && token === generation.current) setRevision(result.data.revision);
          }
        } else {
          // Restore guest notes separately; signed-in data never overwrites them.
          data = parseState(localStorage.getItem("arah.workspace.v1")) ?? data;
        }
        if (active && token === generation.current) {
          callbacks.current.onIdentity(next?.id ?? null, data);
          setLoaded(true);
          setMessage(next ? "Akun terhubung. Gunakan Simpan ke akun setelah mengubah catatan." : "");
        }
      } catch {
        if (active && token === generation.current) setMessage("Data akun belum dapat dimuat. Coba keluar lalu masuk lagi; penyimpanan ke akun sementara dinonaktifkan.");
      } finally {
        if (active && token === generation.current) callbacks.current.onLoading(false);
      }
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Let the auth callback finish before performing further Supabase requests.
      setTimeout(() => { void restore(session?.user ?? null); }, 0);
    });
    return () => { active = false; generation.current++; data.subscription.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true); setMessage("");
    try {
      const result = signup
        ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) {
        setMessage(authErrorMessage(result.error, signup));
      } else {
        setPassword("");
        setMessage(signup && !result.data.session ? "Periksa email untuk mengonfirmasi akun, lalu masuk di sini." : "Berhasil masuk. Memuat catatan akun…");
      }
    } catch { setMessage("Koneksi terputus. Silakan coba lagi."); }
    finally { setBusy(false); }
  }

  async function save() {
    if (!supabase || !user || busy || !loaded) return;
    setBusy(true); setMessage("");
    try {
      const result = revision === null
        ? await supabase.from("workspaces").insert({ user_id: user.id, data: state }).select("revision").single()
        : await supabase.from("workspaces").update({ data: state }).eq("user_id", user.id).eq("revision", revision).select("revision").maybeSingle();
      if (result.error || !result.data) {
        setMessage("Belum tersimpan. Koneksi mungkin terganggu atau catatan sudah berubah di perangkat lain. Ekspor catatanmu sebelum memuat ulang.");
        return;
      }
      setRevision(result.data.revision);
      setMessage("Profil, peluang tersimpan, tugas, progres, dan refleksi sudah disimpan ke akun.");
    } catch { setMessage("Koneksi terputus. Catatan belum tersimpan ke akun."); }
    finally { setBusy(false); }
  }

  async function logout() {
    if (!supabase || busy) return;
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    if (error) setMessage("Belum bisa keluar. Periksa koneksi lalu coba lagi.");
    setBusy(false);
  }

  return <>
    <button className="account-trigger" onClick={() => setOpen(true)}>{user ? "Akun" : "Masuk"}</button>
    <dialog ref={dialog} className="account-dialog" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
      <div className="account-heading"><span className="account-eyebrow">RUANG BERTUMBUHMU</span><button aria-label="Tutup panel akun" onClick={() => setOpen(false)}>×</button></div>
      <h2>{user ? "Catatanmu, di mana saja." : signup ? "Mulai perjalananmu." : "Selamat datang kembali."}</h2>
      {!supabase ? <p role="status">Layanan akun sedang disiapkan. Kamu masih bisa memakai ruang lokal.</p> : user ? <>
        <p className="account-email">{user.email}</p>
        <p>Catatan akun dimuat saat masuk. Setelah mengubah profil atau progres, simpan melalui tombol di bawah.</p>
        <button className="button primary full" disabled={busy || !loaded} onClick={save}>{busy ? "Menyimpan…" : "Simpan ke akun"}</button>
        <button className="button outline full" disabled={busy} onClick={logout}>Keluar</button>
      </> : <form onSubmit={submit}>
        <p>{signup ? "Buat akun untuk menyimpan profil dan progres lintas perangkat." : "Masuk untuk melanjutkan catatan yang tersimpan di akunmu."}</p>
        <label>Email<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {signup && <small>Gunakan minimal 8 karakter. Konfirmasi akun melalui email sebelum masuk.</small>}
        <button className="button primary full" disabled={busy}>{busy ? "Sebentar…" : signup ? "Daftar akun" : "Masuk"}</button>
        <button type="button" className="account-switch" disabled={busy} onClick={() => { setSignup(!signup); setMessage(""); }}>{signup ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}</button>
      </form>}
      {message && <p className="account-message" role="status">{message}</p>}
    </dialog>
  </>;
}
