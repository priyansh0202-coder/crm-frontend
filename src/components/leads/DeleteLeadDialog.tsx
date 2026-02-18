import { useState } from "react";
import { deleteLead } from "@/api/leads";
import type { Lead } from "@/types/lead";
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

interface DeleteLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    lead: Lead | null;
}

export const DeleteLeadDialog = ({ open, onOpenChange, onSuccess, lead }: DeleteLeadDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!lead) return;
        setLoading(true);
        setError(null);

        try {
            await deleteLead(lead._id);
            onOpenChange(false);
            onSuccess();
        } catch (err: any) {
            const backendError = err.response?.data;
            setError(backendError?.message || "Failed to delete lead. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Lead</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <span className="font-semibold">{lead?.name}</span>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
