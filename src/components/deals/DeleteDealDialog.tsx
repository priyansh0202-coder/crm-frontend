import { useState } from "react";
import { deleteDeal } from "@/api/deals";
import type { Deal } from "@/types/deal";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";

interface DeleteDealDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    deal: Deal | null;
}

export const DeleteDealDialog = ({ open, onOpenChange, onSuccess, deal }: DeleteDealDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deal) return;
        setLoading(true);
        setError(null);
        try {
            await deleteDeal(deal._id);
            onOpenChange(false);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to delete deal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Deal</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the deal for{" "}
                        <span className="font-semibold">{deal?.lead?.name}</span>? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
