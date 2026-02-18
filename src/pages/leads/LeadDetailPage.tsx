import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeadById } from "@/api/leads";
import type { Lead } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { EditLeadDialog } from "@/components/leads/EditLeadDialog";
import { DeleteLeadDialog } from "@/components/leads/DeleteLeadDialog";
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Pencil,
    Trash2,
    Mail,
    Phone,
    Building2,
    User,
    Calendar,
} from "lucide-react";

export const LeadDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const fetchLead = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getLeadById(id);
            setLead(data.lead);
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 403) {
                setError("Access denied. You don't have permission to view this lead.");
            } else if (status === 404) {
                setError("Lead not found.");
            } else {
                setError(err.response?.data?.message || "Failed to fetch lead.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLead();
    }, [id]);

    const handleEditSuccess = () => {
        fetchLead();
    };

    const handleDeleteSuccess = () => {
        navigate("/leads");
    };

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
                <Button variant="ghost" onClick={() => navigate("/leads")} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Leads
                </Button>
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
                    <AlertCircle className="h-10 w-10" />
                    <p className="text-base font-medium">{error}</p>
                    <Button variant="outline" onClick={() => navigate("/leads")}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (!lead) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Back + Actions */}
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => navigate("/leads")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Leads
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Lead Header */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-2xl">{lead.name}</CardTitle>
                            {lead.company && (
                                <p className="text-muted-foreground mt-1 flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    {lead.company}
                                </p>
                            )}
                        </div>
                        <LeadStatusBadge status={lead.status} />
                    </div>
                </CardHeader>
            </Card>

            {/* Lead Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
                        Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{lead.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium">{lead.phone}</p>
                        </div>
                    </div>
                    {lead.company && (
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Company</p>
                                <p className="text-sm font-medium">{lead.company}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Assigned To</p>
                            <p className="text-sm font-medium">
                                {lead.assignedTo?.name || "—"}{" "}
                                {lead.assignedTo?.email && (
                                    <span className="text-muted-foreground">({lead.assignedTo.email})</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Created At</p>
                            <p className="text-sm font-medium">
                                {new Date(lead.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <EditLeadDialog open={editOpen} onOpenChange={setEditOpen} onSuccess={handleEditSuccess} lead={lead} />
            <DeleteLeadDialog open={deleteOpen} onOpenChange={setDeleteOpen} onSuccess={handleDeleteSuccess} lead={lead} />
        </div>
    );
};

export default LeadDetailPage;
