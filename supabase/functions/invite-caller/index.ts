// Creates a caller account inside the calling owner's own agency.
//
// Security: the caller's identity and agency come from their JWT and the
// profiles table (read with their own token, so RLS applies), never from the
// request body. The service role key is only used after that check passes.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not logged in" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Not logged in" }, 401);

    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("role, agency_id")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !profile || profile.role !== "owner") {
      return json({ error: "Only an agency owner can invite callers" }, 403);
    }

    const { email, fullName, password } = await req.json();

    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return json({ error: "Enter a valid email address" }, 400);
    }
    if (typeof fullName !== "string" || fullName.trim().length === 0) {
      return json({ error: "Enter the caller's full name" }, 400);
    }
    if (typeof password !== "string" || password.length < 6) {
      return json({ error: "Password must be at least 6 characters" }, 400);
    }

    const admin = createClient(url, serviceKey);
    const { data, error } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() },
      app_metadata: { role: "caller", agency_id: profile.agency_id },
    });

    if (error) return json({ error: error.message }, 400);

    return json({ id: data.user.id, email: data.user.email });
  } catch {
    return json({ error: "Something went wrong" }, 500);
  }
});
