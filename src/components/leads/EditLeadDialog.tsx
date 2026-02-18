import { useState, useEffect } from "react";
import { updateLead } from "@/api/leads";
import type { Lead, UpdateLeadPayload, LeadStatus } from "@/types/lead";
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

interface EditLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    lead: Lead | null;
}

export const EditLeadDialog = ({ open, onOpenChange, onSuccess, lead }: EditLeadDialogProps) => {
    const [formData, setFormData] = useState<UpdateLeadPayload>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company || "",
                status: lead.status,
            });
        }
    }, [lead]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleStatusChange = (value: LeadStatus) => {
        setFormData((prev) => ({ ...prev, status: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lead) return;
        setLoading(true);
        setError(null);

        try {
            await updateLead(lead._id, formData);
            onOpenChange(false);
            onSuccess();
        } catch (err: any) {
            const backendError = err.response?.data;
            let errorMessage = "Something went wrong. Please try again.";
            if (backendError?.message) {
                errorMessage = backendError.message;
            } else if (backendError?.errors && Array.isArray(backendError.errors)) {
                errorMessage = backendError.errors.map((e: any) => e.msg).join(", ");
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Lead</DialogTitle>
                    <DialogDescription>Update the lead details below.</DialogDescription>
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
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" required value={formData.name || ""} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" type="email" required value={formData.email || ""} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input id="phone" required value={formData.phone || ""} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company">Company</Label>
                            <Input id="company" value={formData.company || ""} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleStatusChange(v as LeadStatus)} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
