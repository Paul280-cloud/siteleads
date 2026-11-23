import { STATUS_LABELS, type LeadStatus } from "../lib/leads";

const COLORS: Record<LeadStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  interested: "bg-amber-100 text-amber-800",
  converted: "bg-green-100 text-green-700",
  not_interested: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
