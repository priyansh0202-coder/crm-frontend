import { useState, useEffect } from "react";
import { getDashboardData } from "@/api/dashboard";
import type { DashboardResponse } from "@/types/dashboard";
import { useAuth } from "@/context/AuthContext";
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
} from "recharts";
import {
    Users,
    Handshake,
    DollarSign,
    XCircle,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    MoreHorizontal,
} from "lucide-react";

// ── Consistent muted palette ──────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
    Prospect: "#6366f1",
    Negotiation: "#f59e0b",
    Won: "#22c55e",
    Lost: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
    New: "#6366f1",
    Contacted: "#3b82f6",
    Qualified: "#c4c4cc",
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
    <div className={`dashboard-skeleton ${className || ""}`} />
);

// ── Custom Tooltips ───────────────────────────────────────────────────────────
const BarTip = ({ active, payload, label }: any) =>
    active && payload?.length ? (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            <p className="chart-tooltip-value">
                Deals: <span>{payload[0].value}</span>
            </p>
        </div>
    ) : null;

const PieTip = ({ active, payload }: any) =>
    active && payload?.length ? (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{payload[0].name}</p>
            <p className="chart-tooltip-value">
                Leads: <span>{payload[0].value}</span>
            </p>
        </div>
    ) : null;

// ── Dashboard Page ────────────────────────────────────────────────────────────
export const DashboardPage = () => {
    const { isAdmin } = useAuth();
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

    const barData = (data?.dealsByStage ?? []).map((s) => ({
        stage: s._id,
        count: s.count,
        fill: STAGE_COLORS[s._id] ?? "#6366f1",
    }));

    const pieData = (data?.leadsByStatus ?? []).map((s, i) => ({
        name: s._id,
        value: s.count,
        fill: STATUS_COLORS[s._id] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

    const totalLeads = overview?.totalLeads ?? 0;

    const winRate =
        overview && overview.totalDeals > 0
            ? Math.round((overview.wonDeals / overview.totalDeals) * 100)
            : 0;

    return (
        <>
            {/* ── Page Header ── */}
            <div className="content-header">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h2 className="content-title">Performance Overview</h2>
                        <p className="content-subtitle">
                            Real-time metrics and pipeline analytics for Q4
                        </p>
                    </div>
                    <button className="topbar-create-btn" onClick={fetchData} disabled={loading}>
                        {loading ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span className="topbar-create-text">Refreshing</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4" />
                                <span className="topbar-create-text">Refresh</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="dashboard-error">
                    <AlertCircle className="h-10 w-10" />
                    <p>{error}</p>
                    <button className="error-retry-btn" onClick={fetchData}>Try Again</button>
                </div>
            )}

            {/* ── Loading skeleton ── */}
            {loading && !error && (
                <div className="dashboard-loading">
                    <div className="stat-cards-grid">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="skeleton-stat" />)}
                    </div>
                    <Skeleton className="skeleton-winrate" />
                    <div className="charts-grid">
                        <Skeleton className="skeleton-bar" />
                        <Skeleton className="skeleton-pie" />
                    </div>
                </div>
            )}

            {/* ── Main content ── */}
            {!loading && !error && data && (
                <div className="dashboard-data">

                    {/* Stat cards */}
                    <div className="stat-cards-grid">
                        {/* Total Leads */}
                        <div className="stat-card">
                            <div className="stat-card-top">
                                <div className="stat-icon stat-icon-blue">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="stat-change stat-change-positive">+12%</span>
                            </div>
                            <p className="stat-label">Total Leads</p>
                            <p className="stat-value">{overview!.totalLeads}</p>
                        </div>

                        {/* Total Deals */}
                        <div className="stat-card">
                            <div className="stat-card-top">
                                <div className="stat-icon stat-icon-orange">
                                    <Handshake className="h-5 w-5" />
                                </div>
                                <span className="stat-change stat-change-positive">+4%</span>
                            </div>
                            <p className="stat-label">Total Deals</p>
                            <p className="stat-value">{overview!.totalDeals}</p>
                        </div>

                        {/* Revenue Won */}
                        <div className="stat-card">
                            <div className="stat-card-top">
                                <div className="stat-icon stat-icon-green">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <span className="stat-change stat-change-positive">+22%</span>
                            </div>
                            <p className="stat-label">Revenue Won</p>
                            <p className="stat-value">{fmt(overview!.totalRevenue)}</p>
                        </div>

                        {/* Deals Lost */}
                        <div className="stat-card">
                            <div className="stat-card-top">
                                <div className="stat-icon stat-icon-red">
                                    <XCircle className="h-5 w-5" />
                                </div>
                                <span className="stat-change stat-change-negative">-2%</span>
                            </div>
                            <p className="stat-label">Deals Lost</p>
                            <p className="stat-value">{overview!.lostDeals}</p>
                        </div>
                    </div>

                    {/* Win rate */}
                    <div className="winrate-card">
                        <div className="winrate-header">
                            <div className="winrate-info">
                                <h3 className="winrate-title">{winRate}% overall win rate</h3>
                                <p className="winrate-subtitle">Pipeline efficiency against monthly benchmarks</p>
                            </div>
                            <div className={`winrate-badge ${winRate >= 50 ? "winrate-badge-good" : "winrate-badge-warn"}`}>
                                <TrendingUp className="h-4 w-4" />
                                <span>{winRate >= 50 ? "On target" : "Below target"}</span>
                            </div>
                        </div>
                        <div className="winrate-bar-track">
                            <div
                                className="winrate-bar-fill"
                                style={{ width: `${Math.min(winRate, 100)}%` }}
                            />
                            {/* Goal marker */}
                            <div className="winrate-goal-marker" style={{ left: "75%" }} />
                        </div>
                        <div className="winrate-labels">
                            <span>0% MILESTONE</span>
                            <span>GOAL: 75%</span>
                            <span>100% REACH</span>
                        </div>
                    </div>

                    {/* Charts row */}
                    <div className="charts-grid">

                        {/* Bar chart */}
                        <div className="chart-card chart-bar">
                            <div className="chart-header">
                                <h3 className="chart-title">Deals by Stage</h3>
                                <button className="chart-menu-btn">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="chart-body">
                                {barData.length === 0 ? (
                                    <div className="chart-empty">No deal data yet</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart
                                            data={barData}
                                            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                            barCategoryGap="30%"
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#e5e7eb"
                                            />
                                            <XAxis
                                                dataKey="stage"
                                                tick={{ fontSize: 12, fill: "#9ca3af" }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: "#9ca3af" }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                content={<BarTip />}
                                                cursor={{ fill: "rgba(0,0,0,0.03)", radius: 6 }}
                                            />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
                                                {barData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Donut chart */}
                        <div className="chart-card chart-pie">
                            <div className="chart-header">
                                <h3 className="chart-title">Leads by Status</h3>
                                <div className="chart-dots">
                                    {pieData.map((entry, i) => (
                                        <span
                                            key={i}
                                            className="chart-dot"
                                            style={{ backgroundColor: entry.fill }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="chart-body chart-pie-body">
                                {pieData.length === 0 ? (
                                    <div className="chart-empty">No lead data yet</div>
                                ) : (
                                    <div className="pie-container">
                                        <div className="pie-chart-wrapper">
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                        strokeWidth={0}
                                                        label={false}
                                                    >
                                                        {pieData.map((entry, i) => (
                                                            <Cell key={i} fill={entry.fill} fillOpacity={0.9} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<PieTip />} />
                                                    {/* Center label */}
                                                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '28px', fontWeight: 700, fill: '#1f2937' }}>
                                                        {totalLeads}
                                                    </text>
                                                    <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '10px', fontWeight: 600, fill: '#9ca3af', letterSpacing: '0.05em' }}>
                                                        TOTAL LEADS
                                                    </text>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="pie-legend">
                                            {pieData.map((entry, i) => {
                                                const total = pieData.reduce((s, d) => s + d.value, 0);
                                                const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                                                return (
                                                    <div key={i} className="pie-legend-item">
                                                        <span
                                                            className="pie-legend-dot"
                                                            style={{ backgroundColor: entry.fill }}
                                                        />
                                                        <span className="pie-legend-label">
                                                            {entry.name} ({pct}%)
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DashboardPage;
