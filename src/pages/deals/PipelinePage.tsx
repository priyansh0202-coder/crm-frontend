import { useState, useEffect, useCallback } from "react";
import { getDeals, updateDealStage } from "@/api/deals";
import type { Deal, DealStage } from "@/types/deal";
import { DeleteDealDialog } from "@/components/deals/DeleteDealDialog";
import { DEAL_STAGES, stageConfig } from "@/components/deals/DealStageBadge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    AlertCircle,
    Trash2,
    RefreshCw,
    DollarSign,
    Calendar,
    GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

interface KanbanCardProps {
    deal: Deal;
    onDelete: (deal: Deal) => void;
    isUpdating: boolean;
}

const KanbanCard = ({ deal, onDelete, isUpdating }: KanbanCardProps) => {

    return (
        <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("dealId", deal._id)}
            className={cn(
                "bg-background rounded-lg border p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all",
                isUpdating && "opacity-50 pointer-events-none"
            )}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <GripVertical className="h-3 w-3" />
                    <span className="text-xs">Deal</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(deal)}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>

            <p className="font-semibold text-sm mb-1">{deal.lead?.name || "Unknown Lead"}</p>

            <div className="flex items-center gap-1 text-primary font-bold text-base mb-2">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(deal.value)}
            </div>

            {deal.expectedCloseDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                    })}
                </div>
            )}

            {isUpdating && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Moving...
                </div>
            )}
        </div>
    );
};

interface KanbanColumnProps {
    stage: DealStage;
    deals: Deal[];
    onDrop: (dealId: string, stage: DealStage) => void;
    onDelete: (deal: Deal) => void;
    updatingId: string | null;
}

const KanbanColumn = ({ stage, deals, onDrop, onDelete, updatingId }: KanbanColumnProps) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const config = stageConfig[stage];
    const columnTotal = deals.reduce((sum, d) => sum + d.value, 0);

    return (
        <div
            className={cn(
                "flex flex-col rounded-xl border bg-muted/30 min-h-[500px] transition-colors",
                isDragOver && "bg-primary/5 border-primary/30"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const dealId = e.dataTransfer.getData("dealId");
                if (dealId) onDrop(dealId, stage);
            }}
        >
            {/* Column Header */}
            <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
                        <span className="font-semibold text-sm">{stage}</span>
                    </div>
                    <span className="text-xs font-medium bg-background border rounded-full px-2 py-0.5">
                        {deals.length}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{formatCurrency(columnTotal)}</p>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 p-2 flex-1">
                {deals.map((deal) => (
                    <KanbanCard
                        key={deal._id}
                        deal={deal}
                        onDelete={onDelete}
                        isUpdating={updatingId === deal._id}
                    />
                ))}
                {deals.length === 0 && (
                    <div className={cn(
                        "flex-1 flex items-center justify-center rounded-lg border-2 border-dashed min-h-[100px] text-xs text-muted-foreground",
                        isDragOver ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20"
                    )}>
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
};

export const PipelinePage = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDeals();
            setDeals(data.deals);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch deals.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    const handleDrop = async (dealId: string, newStage: DealStage) => {
        const deal = deals.find((d) => d._id === dealId);
        if (!deal || deal.stage === newStage) return;

        setUpdatingId(dealId);
        // Optimistic update
        setDeals((prev) => prev.map((d) => d._id === dealId ? { ...d, stage: newStage } : d));

        try {
            await updateDealStage(dealId, { stage: newStage });
        } catch (err: any) {
            // Revert on failure
            setDeals((prev) => prev.map((d) => d._id === dealId ? { ...d, stage: deal.stage } : d));
            alert(err.response?.data?.message || "Failed to update stage.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = (deal: Deal) => {
        setSelectedDeal(deal);
        setDeleteOpen(true);
    };

    const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
        acc[stage] = deals.filter((d) => d.stage === stage);
        return acc;
    }, {} as Record<DealStage, Deal[]>);

    const totalPipeline = deals.reduce((sum, d) => sum + d.value, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
                    <AlertCircle className="h-10 w-10" />
                    <p className="text-sm font-medium">{error}</p>
                    <Button variant="outline" onClick={fetchDeals}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Sales Pipeline</h1>
                    <p className="text-muted-foreground mt-1">
                        {deals.length} deal{deals.length !== 1 ? "s" : ""} · Total pipeline:{" "}
                        <span className="font-semibold text-foreground">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalPipeline)}
                        </span>
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchDeals}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Tip */}
            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                <GripVertical className="h-3 w-3" />
                Drag and drop cards to move deals between stages
            </p>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DEAL_STAGES.map((stage) => (
                    <KanbanColumn
                        key={stage}
                        stage={stage}
                        deals={dealsByStage[stage]}
                        onDrop={handleDrop}
                        onDelete={handleDelete}
                        updatingId={updatingId}
                    />
                ))}
            </div>

            <DeleteDealDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onSuccess={fetchDeals}
                deal={selectedDeal}
            />
        </div>
    );
};

export default PipelinePage;
