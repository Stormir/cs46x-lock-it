import { supabase } from "../client";
// auth supabase signup + error
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) console.error("Sign-up failed:", error.message);
  return { data, error };
}
// auth supabase signin + error
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) console.error("Sign-in failed:", error.message);
  return { data, error };
}
// // auth supabase signout + error 
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign-out failed:", error.message);
  return { error };
}
