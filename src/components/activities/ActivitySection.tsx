import { useState, useEffect, useCallback } from "react";
import {
    createActivity,
    getActivitiesByLead,
    deleteActivity,
} from "@/api/activities";
import type { Activity, ActivityType, CreateActivityPayload } from "@/types/activity";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertCircle,
    Loader2,
    Trash2,
    Plus,
    Phone,
    Users,
    FileText,
    Bell,
    Activity as ActivityIcon,
    ChevronDown,
    ChevronUp,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Config ────────────────────────────────────────────────────────────────

const ACTIVITY_TYPES: ActivityType[] = ["Call", "Meeting", "Note", "Follow-up"];

const typeConfig: Record<
    ActivityType,
    { icon: React.ReactNode; className: string; dotColor: string }
> = {
    Call: {
        icon: <Phone className="h-3.5 w-3.5" />,
        className: "bg-blue-100 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500",
    },
    Meeting: {
        icon: <Users className="h-3.5 w-3.5" />,
        className: "bg-purple-100 text-purple-700 border-purple-200",
        dotColor: "bg-purple-500",
    },
    Note: {
        icon: <FileText className="h-3.5 w-3.5" />,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        dotColor: "bg-yellow-500",
    },
    "Follow-up": {
        icon: <Bell className="h-3.5 w-3.5" />,
        className: "bg-green-100 text-green-700 border-green-200",
        dotColor: "bg-green-500",
    },
};

// ─── Type Badge ─────────────────────────────────────────────────────────────

const ActivityTypeBadge = ({ type }: { type: ActivityType }) => {
    const config = typeConfig[type];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                config.className
            )}
        >
            {config.icon}
            {type}
        </span>
    );
};

// ─── Create Form ─────────────────────────────────────────────────────────────

interface CreateActivityFormProps {
    leadId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const CreateActivityForm = ({ leadId, onSuccess, onCancel }: CreateActivityFormProps) => {
    const [formData, setFormData] = useState<{
        type: ActivityType;
        description: string;
        activityDate: string;
    }>({
        type: "Call",
        description: "",
        activityDate: new Date().toISOString().slice(0, 10),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload: CreateActivityPayload = {
            leadId,
            type: formData.type,
            description: formData.description.trim(),
            activityDate: formData.activityDate || undefined,
        };

        try {
            await createActivity(payload);
            setFormData({
                type: "Call",
                description: "",
                activityDate: new Date().toISOString().slice(0, 10),
            });
            onSuccess();
        } catch (err: any) {
            const backendError = err.response?.data;
            let msg = "Something went wrong.";
            if (backendError?.message) msg = backendError.message;
            else if (Array.isArray(backendError?.errors))
                msg = backendError.errors.map((e: any) => e.msg).join(", ");
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Log New Activity</p>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onCancel}
                    disabled={loading}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3">
                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-2.5 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                        <Label className="text-xs">Type *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(v) =>
                                setFormData((p) => ({ ...p, type: v as ActivityType }))
                            }
                            disabled={loading}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ACTIVITY_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="text-xs">
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-xs">Date</Label>
                        <Input
                            type="date"
                            className="h-8 text-xs"
                            value={formData.activityDate}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, activityDate: e.target.value }))
                            }
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="grid gap-1.5">
                    <Label className="text-xs">Description *</Label>
                    <textarea
                        required
                        rows={3}
                        placeholder="What happened? Add details about this activity..."
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((p) => ({ ...p, description: e.target.value }))
                        }
                        disabled={loading}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={loading}>
                        {loading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                        Log Activity
                    </Button>
                </div>
            </form>
        </div>
    );
};

// ─── Activity Item ───────────────────────────────────────────────────────────

interface ActivityItemProps {
    activity: Activity;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

const ActivityItem = ({ activity, onDelete, isDeleting }: ActivityItemProps) => {
    const [expanded, setExpanded] = useState(false);
    const config = typeConfig[activity.type];
    const isLong = activity.description.length > 120;

    const formattedDate = new Date(activity.activityDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const formattedTime = new Date(activity.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="flex gap-3">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
                <div
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background shadow-sm",
                        config.dotColor,
                        "text-white"
                    )}
                >
                    {config.icon}
                </div>
                <div className="w-px flex-1 bg-border mt-1" />
            </div>

            {/* Content */}
            <div className="pb-5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <ActivityTypeBadge type={activity.type} />
                        <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(activity._id)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Trash2 className="h-3 w-3" />
                        )}
                    </Button>
                </div>

                {/* Description */}
                <p
                    className={cn(
                        "text-sm text-foreground leading-relaxed",
                        !expanded && isLong && "line-clamp-2"
                    )}
                >
                    {activity.description}
                </p>
                {isLong && (
                    <button
                        onClick={() => setExpanded((p) => !p)}
                        className="text-xs text-primary mt-0.5 flex items-center gap-0.5 hover:underline"
                    >
                        {expanded ? (
                            <>Show less <ChevronUp className="h-3 w-3" /></>
                        ) : (
                            <>Show more <ChevronDown className="h-3 w-3" /></>
                        )}
                    </button>
                )}

                {/* Footer */}
                <p className="text-xs text-muted-foreground mt-1.5">
                    Logged by{" "}
                    <span className="font-medium text-foreground">
                        {activity.createdBy?.name || "Unknown"}
                    </span>{" "}
                    at {formattedTime}
                </p>
            </div>
        </div>
    );
};

// ─── Main ActivitySection ────────────────────────────────────────────────────

interface ActivitySectionProps {
    leadId: string;
}

export const ActivitySection = ({ leadId }: ActivitySectionProps) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getActivitiesByLead(leadId);
            // Already sorted descending by backend, but ensure it
            setActivities(data.activities);
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 403) {
                setError("Access denied.");
            } else {
                setError(err.response?.data?.message || "Failed to load activities.");
            }
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteActivity(id);
            setActivities((prev) => prev.filter((a) => a._id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete activity.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleCreateSuccess = () => {
        setShowForm(false);
        fetchActivities();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                    <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <ActivityIcon className="h-4 w-4" />
                        Activity Log
                    </CardTitle>
                    {!loading && !error && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {activities.length} activit{activities.length !== 1 ? "ies" : "y"}
                        </p>
                    )}
                </div>
                {!showForm && (
                    <Button size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Log Activity
                    </Button>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                {/* Create Form */}
                {showForm && (
                    <div className="mb-4">
                        <CreateActivityForm
                            leadId={leadId}
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                        <p className="text-sm">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchActivities}>
                            Retry
                        </Button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground border-2 border-dashed rounded-lg">
                        <ActivityIcon className="h-8 w-8" />
                        <p className="text-sm font-medium">No activities logged yet</p>
                        <p className="text-xs">Track calls, meetings, notes and follow-ups here.</p>
                        {!showForm && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-1"
                                onClick={() => setShowForm(true)}
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Log First Activity
                            </Button>
                        )}
                    </div>
                )}

                {/* Timeline */}
                {!loading && !error && activities.length > 0 && (
                    <div className="mt-1">
                        {activities.map((activity, idx) => (
                            <div
                                key={activity._id}
                                className={cn(idx === activities.length - 1 && "[&_.w-px]:hidden")}
                            >
                                <ActivityItem
                                    activity={activity}
                                    onDelete={handleDelete}
                                    isDeleting={deletingId === activity._id}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
