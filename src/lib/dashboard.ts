import { supabase } from "./supabase";
import type { LeadStatus } from "./leads";

export type DashboardStats = {
  total: number;
  conversionRate: number; // converted / (total - new), 0 when there's nothing to divide by
  addedThisWeek: number;
  byStatus: Record<LeadStatus, number>;
  perCaller: {
    callerId: string;
    fullName: string;
    assigned: number;
    converted: number;
  }[];
};

type Row = {
  status: LeadStatus;
  assigned_to: string | null;
  created_at: string;
  assignee: { full_name: string } | null;
};

// RLS already scopes this to the owner's own agency.
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from("leads")
    .select("status, assigned_to, created_at, assignee:profiles!assigned_to(full_name)");

  if (error) throw error;
  const rows = data as unknown as Row[];

  const byStatus: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    interested: 0,
    converted: 0,
    not_interested: 0,
  };

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let addedThisWeek = 0;

  const perCallerMap = new Map<
    string,
    { callerId: string; fullName: string; assigned: number; converted: number }
  >();

  for (const row of rows) {
    byStatus[row.status] += 1;

    if (new Date(row.created_at).getTime() >= weekAgo) {
      addedThisWeek += 1;
    }

    if (row.assigned_to) {
      const existing = perCallerMap.get(row.assigned_to) ?? {
        callerId: row.assigned_to,
        fullName: row.assignee?.full_name ?? "Unknown",
        assigned: 0,
        converted: 0,
      };
      existing.assigned += 1;
      if (row.status === "converted") existing.converted += 1;
      perCallerMap.set(row.assigned_to, existing);
    }
  }

  const total = rows.length;
  const nonNew = total - byStatus.new;
  const conversionRate = nonNew > 0 ? byStatus.converted / nonNew : 0;

  return {
    total,
    conversionRate,
    addedThisWeek,
    byStatus,
    perCaller: Array.from(perCallerMap.values()).sort((a, b) =>
      a.fullName.localeCompare(b.fullName),
    ),
  };
}
