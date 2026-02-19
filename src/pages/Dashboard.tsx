import { useState, useEffect } from "react";
import { getDashboardData } from "@/api/dashboard";
import type { DashboardResponse } from "@/types/dashboard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    Users,
    Handshake,
    DollarSign,
    XCircle,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";


const STAGE_COLORS: Record<string, string> = {
    Prospect: "#6366f1",
    Negotiation: "#f59e0b",
    Won: "#22c55e",
    Lost: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
    New: "#6366f1",
    Contacted: "#3b82f6",
    Qualified: "#f59e0b",
    Lost: "#ef4444",
};
const FALLBACK_COLORS = ["#6366f1", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];



const fmt = (val: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: val >= 1_000_000 ? "compact" : "standard",
        maximumFractionDigits: val >= 1_000_000 ? 1 : 0,
    }).format(val);

interface StatCardProps {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    gradient: string;
    iconBg: string;
}

const StatCard = ({ label, value, sub, icon, gradient, iconBg }: StatCardProps) => (
    <div className={cn(
        "relative rounded-2xl p-5 text-white overflow-hidden",
        gradient
    )}>
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-2 h-20 w-20 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
                <p className="text-sm font-medium text-white/80 mb-1">{label}</p>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                <p className="text-xs text-white/70 mt-1.5">{sub}</p>
            </div>
            <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                iconBg
            )}>
                {icon}
            </div>
        </div>
    </div>
);

const WinRateCard = ({ rate, won, total }: { rate: number; won: number; total: number }) => (
    <div className="rounded-2xl border bg-card p-5 flex items-center gap-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <TrendingUp className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
                <p className="text-2xl font-bold">{rate}%</p>
                <p className="text-sm text-muted-foreground">overall win rate</p>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700",
                        rate >= 50 ? "bg-green-500" : "bg-amber-500"
                    )}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                {won} won out of {total} total deals
            </p>
        </div>
        <p className={cn(
            "text-sm font-semibold shrink-0",
            rate >= 50 ? "text-green-600" : "text-amber-600"
        )}>
            {rate >= 50 ? "↑ On target" : "↓ Below 50%"}
        </p>
    </div>
);

const BarTip = ({ active, payload, label }: any) => active && payload?.length ? (
    <div className="rounded-xl border bg-background shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold mb-0.5">{label}</p>
        <p className="text-muted-foreground">Deals: <span className="font-bold text-foreground">{payload[0].value}</span></p>
    </div>
) : null;

const PieTip = ({ active, payload }: any) => active && payload?.length ? (
    <div className="rounded-xl border bg-background shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-muted-foreground">Leads: <span className="font-bold text-foreground">{payload[0].value}</span></p>
    </div>
) : null;

const PieLegend = ({ payload }: any) => (
    <div className="flex flex-col gap-1.5 mt-2">
        {payload?.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.value}</span>
                </div>
                <span className="font-semibold text-foreground ml-4">
                    {entry.payload?.value}
                </span>
            </div>
        ))}
    </div>
);

const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
);

export const DashboardPage = () => {
    const { user, isAdmin } = useAuth();
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await getDashboardData());
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const overview = data?.overview;

    const barData = (data?.dealsByStage ?? []).map(s => ({
        stage: s._id, count: s.count, fill: STAGE_COLORS[s._id] ?? "#6366f1",
    }));

    const pieData = (data?.leadsByStatus ?? []).map((s, i) => ({
        name: s._id, value: s.count,
        fill: STATUS_COLORS[s._id] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

    const winRate = overview && overview.totalDeals > 0
        ? Math.round((overview.wonDeals / overview.totalDeals) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 ">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Welcome back,{" "}
                            <span className="text-primary">{user?.name?.split(" ")[0] ?? "there"}</span>
                            {" "}👋
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {isAdmin
                                ? "Here's an overview of the entire CRM."
                                : "Here's a summary of your leads and deals."}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-destructive">
                        <AlertCircle className="h-10 w-10" />
                        <p className="font-medium">{error}</p>
                        <Button variant="outline" onClick={fetchData}>Try Again</Button>
                    </div>
                )}

                {loading && !error && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-32 rounded-2xl" />
                            ))}
                        </div>
                        <Skeleton className="h-20 rounded-2xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <Skeleton className="lg:col-span-3 h-72 rounded-2xl" />
                            <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
                        </div>
                    </div>
                )}

                {!loading && !error && data && (
                    <div className="space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                label="Total Leads"
                                value={String(overview!.totalLeads)}
                                sub={isAdmin ? "Across all reps" : "Assigned to you"}
                                icon={<Users className="h-5 w-5 text-white" />}
                                gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                                iconBg="bg-white/20"
                            />
                            <StatCard
                                label="Total Deals"
                                value={String(overview!.totalDeals)}
                                sub={`${overview!.wonDeals} won · ${overview!.lostDeals} lost`}
                                icon={<Handshake className="h-5 w-5 text-white" />}
                                gradient="bg-gradient-to-br from-violet-500 to-violet-600"
                                iconBg="bg-white/20"
                            />
                            <StatCard
                                label="Revenue Won"
                                value={fmt(overview!.totalRevenue)}
                                sub="From closed-won deals"
                                icon={<DollarSign className="h-5 w-5 text-white" />}
                                gradient="bg-gradient-to-br from-amber-400 to-orange-500"
                                iconBg="bg-white/20"
                            />
                            <StatCard
                                label="Deals Lost"
                                value={String(overview!.lostDeals)}
                                sub="Closed-lost deals"
                                icon={<XCircle className="h-5 w-5 text-white" />}
                                gradient="bg-gradient-to-br from-rose-500 to-red-600"
                                iconBg="bg-white/20"
                            />
                        </div>

                        <WinRateCard
                            rate={winRate}
                            won={overview!.wonDeals}
                            total={overview!.totalDeals}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <Card className="lg:col-span-3 rounded-2xl shadow-none border">
                                <CardHeader className="pb-0 pt-5 px-6">
                                    <CardTitle className="text-base font-semibold">Deals by Stage</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Distribution of deals across pipeline stages
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-4 px-4 pb-5">
                                    {barData.length === 0 ? (
                                        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                                            No deal data yet
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <BarChart
                                                data={barData}
                                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                                barSize={60}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="hsl(var(--border))"
                                                />
                                                <XAxis
                                                    dataKey="stage"
                                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    allowDecimals={false}
                                                />
                                                    <Tooltip content={<BarTip />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 6 }} />
                                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                                    {barData.map((entry, i) => (
                                                        <Cell key={i} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}

                                    <div className="flex flex-wrap gap-4 mt-3 px-2">
                                        {Object.entries(STAGE_COLORS).map(([stage, color]) => (
                                            <div key={stage} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                                {stage}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pie Chart */}
                            <Card className="lg:col-span-2 rounded-2xl shadow-none border">
                                <CardHeader className="pb-0 pt-5 px-6">
                                    <CardTitle className="text-base font-semibold">Leads by Status</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Breakdown by current lead status
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-2 px-4 pb-5">
                                    {pieData.length === 0 ? (
                                        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                                            No lead data yet
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={65}
                                                        outerRadius={95}
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                        strokeWidth={0}
                                                    >
                                                        {pieData.map((entry, i) => (
                                                            <Cell key={i} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<PieTip />} />
                                                </PieChart>
                                            </ResponsiveContainer>

                                            {/* Custom legend with counts */}
                                            <div className="w-full mt-1 space-y-2 px-2">
                                                {pieData.map((entry, i) => {
                                                    const total = pieData.reduce((s, d) => s + d.value, 0);
                                                    const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                                                    return (
                                                        <div key={i} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                                                                <span className="text-muted-foreground">{entry.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full"
                                                                        style={{ width: `${pct}%`, backgroundColor: entry.fill }}
                                                                    />
                                                                </div>
                                                                <span className="font-semibold text-foreground w-6 text-right">{pct}%</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
