import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads } from "@/api/leads";
import type { Lead, LeadStatus, LeadFilters } from "@/types/lead";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { EditLeadDialog } from "@/components/leads/EditLeadDialog";
import { DeleteLeadDialog } from "@/components/leads/DeleteLeadDialog";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Users,
} from "lucide-react";

export const LeadsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<LeadFilters>({ search: "", status: "", page: 1, limit: 10 });
    const [searchInput, setSearchInput] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLeads(filters);
            setLeads(data.leads);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch leads.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleStatusFilter = (value: string) => {
        setFilters((prev) => ({ ...prev, status: value === "all" ? "" : (value as LeadStatus), page: 1 }));
    };

    const handleEdit = (lead: Lead) => {
        setSelectedLead(lead);
        setEditOpen(true);
    };

    const handleDelete = (lead: Lead) => {
        setSelectedLead(lead);
        setDeleteOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Leads</h1>
                    <p className="text-muted-foreground mt-1">
                        {total} lead{total !== 1 ? "s" : ""} total
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Lead
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-9"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <Select onValueChange={handleStatusFilter} defaultValue="all">
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
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
                            <Button variant="outline" size="sm" onClick={fetchLeads}>
                                Try Again
                            </Button>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                            <Users className="h-10 w-10" />
                            <p className="text-sm font-medium">No leads found</p>
                            <Button size="sm" onClick={() => setCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create your first lead
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                                    <TableHead className="hidden lg:table-cell">Company</TableHead>
                                    <TableHead>Status</TableHead>
                                    {user?.id !== undefined && (
                                        <TableHead className="hidden sm:table-cell">Assigned To</TableHead>
                                    )}
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map((lead) => (
                                    <TableRow key={lead._id}>
                                        <TableCell className="font-medium">{lead.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">{lead.phone}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-muted-foreground">{lead.company || "—"}</TableCell>
                                        <TableCell>
                                            <LeadStatusBadge status={lead.status} />
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                                            {lead.assignedTo?.name || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/leads/${lead._id}`)}
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(lead)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(lead)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Page {filters.page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={(filters.page ?? 1) <= 1}
                            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={(filters.page ?? 1) >= totalPages}
                            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={fetchLeads} />
            <EditLeadDialog open={editOpen} onOpenChange={setEditOpen} onSuccess={fetchLeads} lead={selectedLead} />
            <DeleteLeadDialog open={deleteOpen} onOpenChange={setDeleteOpen} onSuccess={fetchLeads} lead={selectedLead} />
        </div>
    );
};

export default LeadsPage;
