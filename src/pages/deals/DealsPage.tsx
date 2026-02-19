import { useState, useEffect, useCallback } from "react";
import { getDeals, updateDealStage } from "@/api/deals";
import type { Deal, DealStage, DealFilters } from "@/types/deal";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { DEAL_STAGES } from "@/components/deals/DealStageBadge";
import { DeleteDealDialog } from "@/components/deals/DeleteDealDialog";
import {
    Loader2,
    AlertCircle,
    Trash2,
    DollarSign,
    Handshake,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const DealsPage = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DealFilters>({ stage: "" });
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDeals(filters);
            setDeals(data.deals);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch deals.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    const handleStageChange = async (deal: Deal, newStage: DealStage) => {
        setUpdatingId(deal._id);
        try {
            await updateDealStage(deal._id, { stage: newStage });
            setDeals((prev) =>
                prev.map((d) => (d._id === deal._id ? { ...d, stage: newStage } : d))
            );
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update stage.");
        } finally {
            setUpdatingId(null);
        }
    };

    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const wonValue = deals.filter((d) => d.stage === "Won").reduce((sum, d) => sum + d.value, 0);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Deals</h1>
                    <p className="text-muted-foreground mt-1">{deals.length} deal{deals.length !== 1 ? "s" : ""}</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchDeals} disabled={loading}>
                    <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pipeline Value</p>
                            <p className="text-2xl font-bold">{loading ? "—" : formatCurrency(totalValue)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <Handshake className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Won Value</p>
                            <p className="text-2xl font-bold text-green-600">{loading ? "—" : formatCurrency(wonValue)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Win Rate</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {loading || deals.length === 0
                                    ? "—"
                                    : `${Math.round((deals.filter((d) => d.stage === "Won").length / deals.length) * 100)}%`}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <Select
                            value={filters.stage || "all"}
                            onValueChange={(v) => setFilters({ stage: v === "all" ? "" : (v as DealStage) })}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stages</SelectItem>
                                {DEAL_STAGES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-sm font-medium">{error}</p>
                            <Button variant="outline" size="sm" onClick={fetchDeals}>Try Again</Button>
                        </div>
                    ) : deals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                            <Handshake className="h-10 w-10" />
                            <p className="text-sm font-medium">No deals found</p>
                            <p className="text-xs">Create deals from the Lead Detail page.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lead</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Stage</TableHead>
                                    <TableHead className="hidden md:table-cell">Close Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deals.map((deal) => (
                                    <TableRow key={deal._id}>
                                        <TableCell className="font-medium">{deal.lead?.name || "—"}</TableCell>
                                        <TableCell className="font-semibold text-primary">
                                            {formatCurrency(deal.value)}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={deal.stage}
                                                onValueChange={(v) => handleStageChange(deal, v as DealStage)}
                                                disabled={updatingId === deal._id}
                                            >
                                                <SelectTrigger className="w-[140px] h-8">
                                                    {updatingId === deal._id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <SelectValue />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DEAL_STAGES.map((s) => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            {deal.expectedCloseDate
                                                ? new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric",
                                                })
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => { setSelectedDeal(deal); setDeleteOpen(true); }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <DeleteDealDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onSuccess={fetchDeals}
                deal={selectedDeal}
            />
        </div>
    );
};

export default DealsPage;
