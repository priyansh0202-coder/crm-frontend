import { useState } from "react";
import { createDeal } from "@/api/deals";
import type { CreateDealPayload, DealStage } from "@/types/deal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { DEAL_STAGES } from "./DealStageBadge";

interface CreateDealDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    leadId: string;
    leadName: string;
}

const initialForm = {
    value: "",
    stage: "Prospect" as DealStage,
    expectedCloseDate: "",
};

export const CreateDealDialog = ({
    open,
    onOpenChange,
    onSuccess,
    leadId,
    leadName,
}: CreateDealDialogProps) => {
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload: CreateDealPayload = {
            leadId,
            value: Number(formData.value),
            stage: formData.stage,
            expectedCloseDate: formData.expectedCloseDate || undefined,
        };

        try {
            await createDeal(payload);
            setFormData(initialForm);
            onOpenChange(false);
            onSuccess();
        } catch (err: any) {
            const backendError = err.response?.data;
            let errorMessage = "Something went wrong. Please try again.";
            if (backendError?.message) errorMessage = backendError.message;
            else if (Array.isArray(backendError?.errors))
                errorMessage = backendError.errors.map((e: any) => e.msg).join(", ");
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Deal</DialogTitle>
                    <DialogDescription>
                        Creating a deal for lead: <span className="font-semibold">{leadName}</span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="value">Deal Value ($) *</Label>
                            <Input
                                id="value"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g. 5000"
                                required
                                value={formData.value}
                                onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                                disabled={loading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Stage</Label>
                            <Select
                                value={formData.stage}
                                onValueChange={(v) => setFormData((p) => ({ ...p, stage: v as DealStage }))}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEAL_STAGES.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                            <Input
                                id="expectedCloseDate"
                                type="date"
                                value={formData.expectedCloseDate}
                                onChange={(e) => setFormData((p) => ({ ...p, expectedCloseDate: e.target.value }))}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Deal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
