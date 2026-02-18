import type { LeadStatus } from "@/types/lead";
import { cn } from "@/lib/utils";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
    new: {
        label: "New",
        className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    contacted: {
        label: "Contacted",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    qualified: {
        label: "Qualified",
        className: "bg-green-100 text-green-700 border-green-200",
    },
    lost: {
        label: "Lost",
        className: "bg-red-100 text-red-700 border-red-200",
    },
};

interface LeadStatusBadgeProps {
    status: LeadStatus;
}

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
    const config = statusConfig[status];
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                config.className
            )}
        >
            {config.label}
        </span>
    );
};
