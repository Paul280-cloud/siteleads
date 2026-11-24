import { supabase } from "./supabase";

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "converted"
  | "not_interested";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  converted: "Converted",
  not_interested: "Not interested",
};

export type Lead = {
  id: string;
  business_name: string;
  category: string | null;
  area: string | null;
  phone: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  assignee: { full_name: string } | null;
};

// RLS decides what comes back: owners get every lead in their agency,
// callers get only the leads assigned to them.
export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, business_name, category, area, phone, status, assigned_to, assignee:profiles!assigned_to(full_name)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as Lead[];
}

// Calls the assign_lead() database function (security definer): it checks
// the caller is an owner and that both the lead and the caller belong to
// the owner's own agency before making the change. There is no "unassign"
// in the database function yet, so this only supports assigning to a caller.
export async function assignLead(leadId: string, callerId: string) {
  const { error } = await supabase.rpc("assign_lead", {
    p_lead_id: leadId,
    p_caller_id: callerId,
  });

  if (error) throw error;
}

export async function addLead(input: {
  agencyId: string;
  businessName: string;
  category?: string;
  area?: string;
  phone?: string;
}) {
  const { error } = await supabase.from("leads").insert({
    agency_id: input.agencyId,
    business_name: input.businessName,
    category: input.category || null,
    area: input.area || null,
    phone: input.phone || null,
    source: "manual",
  });

  if (error) throw error;
}
