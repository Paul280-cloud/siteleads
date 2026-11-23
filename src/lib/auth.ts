import { supabase } from "./supabase";

export type Role = "owner" | "caller";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  agency_id: string;
};

export async function signUpOwner(params: {
  email: string;
  password: string;
  fullName: string;
  agencyName: string;
}) {
  const { email, password, fullName, agencyName } = params;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, agency_name: agencyName },
    },
  });
  if (error) throw error;
  return data;
}

export async function logIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function logOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getMyProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, agency_id")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data as Profile;
}
