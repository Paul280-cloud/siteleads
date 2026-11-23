import { supabase } from "./supabase";

export type TeamCaller = {
  id: string;
  full_name: string;
  email: string;
};

// RLS lets an owner read the profiles in their own agency only.
export async function listCallers(): Promise<TeamCaller[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "caller")
    .order("full_name");

  if (error) throw error;
  return data as TeamCaller[];
}

// The invite-caller Edge Function checks the user is an owner and puts the
// new caller in the owner's own agency. We only send what the owner typed.
export async function inviteCaller(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.functions.invoke("invite-caller", {
    body: input,
  });

  if (error) {
    let message = "Could not invite caller";
    const response = (error as { context?: Response }).context;
    if (response && typeof response.json === "function") {
      try {
        const body = await response.json();
        if (body?.error) message = body.error;
      } catch {
        // keep the generic message
      }
    }
    throw new Error(message);
  }

  return data as { id: string; email: string };
}
