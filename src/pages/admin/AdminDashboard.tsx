import { useState, useEffect } from "react";
import { getAllUsers, getSalesUsersWithLeads } from "@/api/users";
import type { UserRecord, SalesUserWithLeads } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    Loader2,
    Users,
    ShieldCheck,
    UserCheck,
    ChevronDown,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RoleBadge = ({ role }: { role: "admin" | "user" }) => (
    <span
        className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            role === "admin"
                ? "bg-orange-100 text-orange-700 border-orange-200"
                : "bg-blue-100 text-blue-700 border-blue-200"
        )}
    >
        {role === "admin" ? (
            <ShieldCheck className="h-3 w-3" />
        ) : (
            <UserCheck className="h-3 w-3" />
        )}
        {role === "admin" ? "Admin" : "Sales"}
    </span>
);

const LeadStatusDot = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        new: "bg-blue-500",
        contacted: "bg-yellow-500",
        qualified: "bg-green-500",
        lost: "bg-red-500",
    };
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", colors[status] || "bg-gray-400")} />
            <span className="capitalize">{status}</span>
        </span>
    );
};

export const AdminDashboard = () => {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [salesUsers, setSalesUsers] = useState<SalesUserWithLeads[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingSales, setLoadingSales] = useState(true);
    const [errorUsers, setErrorUsers] = useState<string | null>(null);
    const [errorSales, setErrorSales] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const fetchUsers = async () => {
        setLoadingUsers(true);
        setErrorUsers(null);
        try {
            const data = await getAllUsers();
            setUsers(data.users);
        } catch (err: any) {
            setErrorUsers(err.response?.data?.message || "Failed to fetch users.");
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchSalesUsers = async () => {
        setLoadingSales(true);
        setErrorSales(null);
        try {
            const data = await getSalesUsersWithLeads();
            setSalesUsers(data.salesUsers);
        } catch (err: any) {
            setErrorSales(err.response?.data?.message || "Failed to fetch sales data.");
        } finally {
            setLoadingSales(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchSalesUsers();
    }, []);

    const toggleRow = (id: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const adminCount = users.filter((u) => u.role === "admin").length;
    const salesCount = users.filter((u) => u.role === "user").length;
    const totalLeads = salesUsers.reduce((sum, u) => sum + u.leads.length, 0);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage users and monitor sales performance.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Users</p>
                                <p className="text-3xl font-bold">{loadingUsers ? "—" : users.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                <ShieldCheck className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Admins</p>
                                <p className="text-3xl font-bold">{loadingUsers ? "—" : adminCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <UserCheck className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Sales Users</p>
                                <p className="text-3xl font-bold">{loadingUsers ? "—" : salesCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* All Users Table */}
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">All Users</CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={loadingUsers}>
                        <RefreshCw className={cn("h-4 w-4", loadingUsers && "animate-spin")} />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingUsers ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : errorUsers ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                            <p className="text-sm">{errorUsers}</p>
                            <Button variant="outline" size="sm" onClick={fetchUsers}>Retry</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <RoleBadge role={user.role} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Sales Performance</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {loadingSales ? "Loading..." : `${salesUsers.length} sales users · ${totalLeads} total leads`}
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchSalesUsers} disabled={loadingSales}>
                        <RefreshCw className={cn("h-4 w-4", loadingSales && "animate-spin")} />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingSales ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : errorSales ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                            <p className="text-sm">{errorSales}</p>
                            <Button variant="outline" size="sm" onClick={fetchSalesUsers}>Retry</Button>
                        </div>
                    ) : salesUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                            <Users className="h-8 w-8" />
                            <p className="text-sm">No sales users found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-8"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-center">Leads</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesUsers.map((salesUser) => (
                                    <>
                                        {/* Sales user row */}
                                        <TableRow
                                            key={salesUser._id}
                                            className="cursor-pointer"
                                            onClick={() => toggleRow(salesUser._id)}
                                        >
                                            <TableCell>
                                                {expandedRows.has(salesUser._id) ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{salesUser.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{salesUser.email}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 min-w-[2rem]">
                                                    {salesUser.leads.length}
                                                </span>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded leads sub-table */}
                                        {expandedRows.has(salesUser._id) && salesUser.leads.length > 0 && (
                                            <TableRow key={`${salesUser._id}-leads`}>
                                                <TableCell colSpan={4} className="p-0 bg-muted/30">
                                                    <div className="px-8 py-3">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                                            Assigned Leads
                                                        </p>
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-muted-foreground text-xs">
                                                                    <th className="text-left pb-1 font-medium">Lead Name</th>
                                                                    <th className="text-left pb-1 font-medium">Status</th>
                                                                    <th className="text-left pb-1 font-medium">Created</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {salesUser.leads.map((lead) => (
                                                                    <tr key={lead._id} className="border-t border-border/50">
                                                                        <td className="py-1.5 font-medium">{lead.name}</td>
                                                                        <td className="py-1.5">
                                                                            <LeadStatusDot status={lead.status} />
                                                                        </td>
                                                                        <td className="py-1.5 text-muted-foreground">
                                                                            {new Date(lead.createdAt).toLocaleDateString("en-US", {
                                                                                month: "short",
                                                                                day: "numeric",
                                                                                year: "numeric",
                                                                            })}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {/* No leads message */}
                                        {expandedRows.has(salesUser._id) && salesUser.leads.length === 0 && (
                                            <TableRow key={`${salesUser._id}-empty`}>
                                                <TableCell colSpan={4} className="bg-muted/30 text-center text-sm text-muted-foreground py-3">
                                                    No leads assigned to this user.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
