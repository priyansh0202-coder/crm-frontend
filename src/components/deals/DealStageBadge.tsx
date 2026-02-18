import type { DealStage } from "@/types/deal";
import { cn } from "@/lib/utils";

export const stageConfig: Record<DealStage, { label: string; className: string; color: string }> = {
    Prospect: {
        label: "Prospect",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        color: "bg-blue-500",
    },
    Negotiation: {
        label: "Negotiation",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        color: "bg-yellow-500",
    },
    Won: {
        label: "Won",
        className: "bg-green-100 text-green-700 border-green-200",
        color: "bg-green-500",
    },
    Lost: {
        label: "Lost",
        className: "bg-red-100 text-red-700 border-red-200",
        color: "bg-red-500",
    },
};

export const DEAL_STAGES: DealStage[] = ["Prospect", "Negotiation", "Won", "Lost"];

interface DealStageBadgeProps {
    stage: DealStage;
}

export const DealStageBadge = ({ stage }: DealStageBadgeProps) => {
    const config = stageConfig[stage];
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
